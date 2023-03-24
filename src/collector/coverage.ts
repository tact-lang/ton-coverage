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
    gasLimit: bigint
}) {
    let collector = args.collector;
    let logs = args.logs;
    let gasRemaining = args.gasLimit;
    let offset = 0;
    while (offset < logs.length) {

        // Load stack
        const stack = logs[offset++];
        if (stack.kind !== 'stack') {
            throw new Error('Expected stack log entry, got: ' + stack.kind + " at " + offset);
        }

        // Load cell
        let cell = logs[offset++];

        // Skip implicit RET
        if (cell.kind === 'execute' && cell.command.startsWith('implicit ')) {
            while (offset < logs.length) {
                if (logs[offset].kind === 'gas') {
                    break;
                }
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

        // Load gas
        let gas = logs[offset++];
        if (gas.kind === 'output_action') { // Skip output action
            gas = logs[offset++]
        }
        if (gas.kind !== 'gas') {
            throw new Error('Expected gas entry, got: ' + cell.kind + " at " + offset);
        }

        // Collect
        collector.collectCell(Buffer.from(cell.hash, 'hex'), cell.offset, gasRemaining - gas.remaining);

        // Update 
        gasRemaining = gas.remaining;
    }
}