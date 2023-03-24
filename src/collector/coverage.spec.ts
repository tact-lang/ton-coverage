import * as fs from 'fs';
import * as path from 'path';
import { Cell } from 'ton-core';
import { collectCoverage, CoverageCollector } from './coverage';
import { parseVMLogs } from './parseVMLogs';
import { printCoverage } from './printCoverage';

describe('coverage', () => {
    it('should parse logs', () => {
        let logs = fs.readFileSync(path.resolve(__dirname, '__testdata__', 'log1.txt'), 'utf8');
        parseVMLogs(logs);
    });
    it('should collect coverage', () => {

        // Collect coverage
        let rawLogs = fs.readFileSync(path.resolve(__dirname, '__testdata__', 'log1.txt'), 'utf8');
        let logs = parseVMLogs(rawLogs);
        let collector = new CoverageCollector();
        collectCoverage({
            collector,
            logs,
            gasLimit: 1000000000n
        });
        expect(collector.export()).toMatchSnapshot();

        // Print coverage
        let rawCode = Cell.fromBoc(fs.readFileSync(path.resolve(__dirname, '__testdata__', 'log1.boc')))[0];
        let res = printCoverage(rawCode, collector);
        fs.writeFileSync(path.resolve(__dirname, '__testdata__', 'log1.html'), res);
    });
});