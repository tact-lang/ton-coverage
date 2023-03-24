export type LogEntry = {
    kind: 'execute',
    command: string
} | {
    kind: 'cell',
    hash: string,
    offset: number
} | {
    kind: 'stack',
    stack: string
} | {
    kind: 'gas',
    remaining: bigint
} | {
    kind: 'output_action'
}

export function parseVMLogs(logs: string) {
    let lines = logs.split('\n');
    let res: LogEntry[] = [];
    for (let l of lines) {
        l = l.trim();
        if (l.startsWith('gas remaining: ')) {
            let remaining = BigInt(l.substring(15));
            res.push({ kind: 'gas', remaining });
        } else if (l.startsWith('execute ')) {
            let command = l.substring(8);
            res.push({ kind: 'execute', command });
        } else if (l.startsWith('code cell hash: ')) {
            l = l.substring(16);
            let hash = l.substring(0, 64);
            let offset = parseInt(l.substring(65 + 'offset: '.length));
            res.push({ kind: 'cell', hash, offset: offset });
        } else if (l.startsWith('stack: ')) {
            let stack = l.substring(7);
            res.push({ kind: 'stack', stack });
        } else if (l.startsWith('installing an output action')) {
            res.push({ kind: 'output_action' });
        } else {
            throw new Error('Unknown log line: ' + l);
        }
    }
    return res;
}