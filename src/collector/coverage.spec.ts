import * as fs from 'fs';
import * as path from 'path';
import { Cell } from '@ton/core';
import { collectCoverage, CoverageCollector } from './coverage';
import { parseVMLogs } from './parseVMLogs';
import { printCoverage } from './printCoverage';

describe('coverage', () => {
    it('should parse logs', () => {
        let logs = fs.readFileSync(path.resolve(__dirname, '__testdata__', 'log1.txt'), 'utf8');
        parseVMLogs(logs);
    });
    it('should parse logs with empty lines', () => {
        let logs = fs.readFileSync(path.resolve(__dirname, '__testdata__', 'log2.txt'), 'utf8');
        parseVMLogs(logs);
    });
    // it('should collect coverage', () => {

    //     // Collect coverage
    //     let rawLogs = fs.readFileSync(path.resolve(__dirname, '__testdata__', 'log1.txt'), 'utf8');
    //     let logs = parseVMLogs(rawLogs);
    //     let collector = new CoverageCollector();
    //     collectCoverage({
    //         collector,
    //         logs,
    //         gasLimit: 1000000000n
    //     });
    //     expect(collector.export()).toMatchSnapshot();

    //     // Print coverage
    //     let rawCode = Cell.fromBoc(fs.readFileSync(path.resolve(__dirname, '__testdata__', 'log1.boc')))[0];
    //     let res = printCoverage(rawCode, collector);
    //     fs.writeFileSync(path.resolve(__dirname, '__testdata__', 'log1.html'), res);
    // });

    it('should collect coverage 2', () => {

        // Collect coverage
        let rawLogs = fs.readFileSync(path.resolve(__dirname, '__testdata__', 'log2.txt'), 'utf8');
        let logs = parseVMLogs(rawLogs);
        let collector = new CoverageCollector();
        collectCoverage({
            collector,
            logs
        });
        expect(collector.export()).toMatchSnapshot();

        // Print coverage
        let rawCode = Cell.fromBase64('te6ccgEBCAEAlwABFP8A9KQT9LzyyAsBAgEgAgMCAUgEBQC48oMI1xgg0x/TH9MfAvgju/Jj7UTQ0x/TH9P/0VEyuvKhUUS68qIE+QFUEFX5EPKj9ATR+AB/jhYhgBD0eG+lIJgC0wfUMAH7AJEy4gGz5lsBpMjLH8sfy//J7VQABNAwAgFIBgcAF7s5ztRNDTPzHXC/+AARuMl+1E0NcLH4');
        let res = printCoverage(rawCode, collector);
        fs.writeFileSync(path.resolve(__dirname, '__testdata__', 'log2.html'), res);
    });
});