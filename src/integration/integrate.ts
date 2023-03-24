import { collectCoverage, CoverageCollector } from "../collector/coverage";
import { parseVMLogs } from "../collector/parseVMLogs";
import * as fs from 'fs';
import { Cell } from "ton-core";
import { printCoverage } from "../collector/printCoverage";

export function beginCoverage() {

    // Check if coverage already started
    let ex = (globalThis as any).__ton_coverage__;
    if (ex) {
        throw new Error('Coverage already started');
    }

    // Start coverage
    (globalThis as any).__ton_coverage_storage__ = [];
    (globalThis as any).__ton_coverage__ = (src: string) => (globalThis as any).__ton_coverage_storage__.push(src);
}

export function completeCoverage(path: string) {
    let logs = (globalThis as any).__ton_coverage_storage__ as string[];

    // Collect coverage
    let collector = new CoverageCollector();
    for (let l of logs) {
        try {
            let parsed = parseVMLogs(l);
            collectCoverage({
                logs: parsed,
                collector
            });
        } catch (e) {
            console.warn(e);
        }
    }

    // Render coverage
    let files = fs.readdirSync(path);
    for (let f of files) {
        if (f.endsWith('.boc')) {
            try {
                let code = Cell.fromBoc(fs.readFileSync(path + '/' + f))[0];
                let coverage = printCoverage(code, collector);
                fs.writeFileSync(path + '/' + f + '.html', coverage);
            } catch (e) {
                console.warn(e);
            }
        }
    }
}