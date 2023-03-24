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
    kind: 'gas-limit-change',
    limit: bigint
} | {
    kind: 'info',
    message: string
}

export function parseVMLogs(logs: string) {
    let lines = logs.split('\n').map((v) => v.trim()).filter((v) => v.length > 0);
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
        } else if (l.startsWith('changing gas limit to ')) {
            let limit = BigInt(l.substring('changing gas limit to '.length));
            res.push({ kind: 'gas-limit-change', limit });
        } else {
            res.push({ kind: 'info', message: l });
        }
    }
    return res;
}