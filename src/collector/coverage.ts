import { Maybe } from "../utils/maybe";
import { LogEntry } from "./parseVMLogs";

type CollectedCell = {
    offsets: Map<number, { count: number, gas: bigint[] }>;
}

export class CoverageCollector {
    #collected = new Map<string, CollectedCell>();

    coverageForCell(hash: string) {
        return this.#collected.get(hash);
    }

    collectCell(hash: Buffer, offset: number, gas: bigint) {
        let id = hash.toString('hex');
        let c = this.#collected.get(id);
        if (!c) {
            c = { offsets: new Map() };
            this.#collected.set(id, c);
        }
        let cc = c.offsets.get(offset);
        if (!cc) {
            cc = { count: 0, gas: [] };
            c.offsets.set(offset, cc);
        }
        cc.count++;
        cc.gas.push(gas);
    }

    export() {
        let res: any = {};
        for (let [id, c] of this.#collected) {
            let offsets: any = {};
            for (let [offset, cc] of c.offsets) {
                offsets[offset] = {
                    count: cc.count,
                    gas: cc.gas.map((v) => v.toString())
                }
            }
            res[id] = {
                offsets
            }
        }
        return res;
    }
}

export function collectCoverage(args: {
    collector: CoverageCollector,
    logs: LogEntry[],
    gasLimit?: Maybe<bigint>
}) {

    // Determine gas limit
    let gasLimit = 1000000000n;
    if (typeof args.gasLimit === 'bigint') {
        gasLimit = args.gasLimit;
    } else {
        // Try to determine gas limit from logs, ignoring the first opcode that usually
        // is the SETCP 0 and means nothing
        if (args.logs.length > 4) {
            if (args.logs[0].kind === 'stack'
                && args.logs[1].kind === 'cell'
                && args.logs[2].kind === 'execute'
                && args.logs[3].kind === 'gas') {
                if (args.logs[2].command === 'SETCP 0') {
                    gasLimit = args.logs[3].remaining;
                }
            }
        }
    }

    // Filter logs
    let logs = args.logs.filter((v) => ["execute", "cell", "gas", "gas-limit-change"].includes(v.kind));

    // Collect coverage
    let collector = args.collector;
    let gasRemaining = gasLimit;
    let offset = 0;
    while (offset < logs.length) {

        // Load cell
        let cell = logs[offset++];

        // Skip implicit RET
        if (cell.kind === 'execute' && cell.command.startsWith('implicit ')) {
            // Skip non-gas
            while (logs[offset].kind !== 'gas') {
                offset++;
            }
            let g = logs[offset++];
            if (g.kind !== 'gas') {
                throw new Error('Expected gas log entry, got: ' + g.kind + " at " + offset);
            }
            gasRemaining = g.remaining;
            continue;
        }

        // Check for cell
        if (cell.kind !== 'cell') {
            throw new Error('Expected cell log entry, got: ' + cell.kind + " at " + offset);
        }

        // Load execute
        let execute = logs[offset++];
        if (execute.kind !== 'execute') {
            throw new Error('Expected execute entry, got: ' + cell.kind + " at " + offset);
        }

        // Collect all intermediate messages
        let messages: LogEntry[] = [];
        while (logs[offset].kind !== 'gas') {
            messages.push(logs[offset++]);
        }

        // Check for gas limit change
        let gasLimitChange = messages.find((v) => v.kind === 'gas-limit-change');
        if (gasLimitChange) {
            let delta = (gasLimitChange as { limit: bigint }).limit - gasLimit;
            gasLimit = (gasLimitChange as { limit: bigint }).limit;
            gasRemaining += delta;
        }

        // Look for end of execution
        let gas = logs[offset++];
        if (gas.kind !== 'gas') {
            throw new Error('Expected gas entry, got: ' + cell.kind + " at " + offset);
        }

        // Collect
        collector.collectCell(Buffer.from(cell.hash, 'hex'), cell.offset, gasRemaining - gas.remaining);

        // Update 
        gasRemaining = gas.remaining;
    }
}