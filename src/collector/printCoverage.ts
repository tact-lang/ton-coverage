import { decompileAll, Printer } from "@tact-lang/opcode";
import { Cell } from "ton-core";
import { pad, trimIndent } from "../utils/text";
import { CoverageCollector } from "./coverage";

function span(src: string, className: string) {
    return `<span class="${className}">${src}</span>`;
}

function template(src: string) {
    return trimIndent(`
    <html>
        <head>
            <style>
                pre {
                    display: flex;
                    flex-direction: column;
                }
                .padding {
                    color: #ccc;
                }
                .line-covered {
                    background-color: #DDFFDD;
                }
                .line-uncovered {
                    background-color: #fffcdd;
                }
                .count {
                    display: inline-flex;
                    width: 30px;
                    justify-content: center;
                    color: #10620d;
                }
                .gas {
                    display: inline-flex;
                    width: 30px;
                    justify-content: center;
                    color: #e60f0f;
                }
            </style>
        </head>
        <body>
            <h1>Code coverage</h1>
            <pre>
            ${pad(trimIndent(src), 16)}
            </pre>
        <body>
    </html>
    `);
}

export function printCoverage(code: Cell, collector: CoverageCollector) {

    // Create printer
    const printer: Printer = (src, indent) => {
        if (typeof src === 'string') {
            return span(span(``, 'count') + span(``, 'gas') + span('.'.repeat(indent * 2), 'padding') + src, 'line');
        }
        let line = span('.'.repeat(indent * 2), 'padding') + span(src.op, 'opcode');
        // console.log(src.hash.toLowerCase());
        // console.log(src);
        let cov = collector.coverageForCell(src.hash.toLowerCase());
        let lineClass: string;
        if (cov && cov.offsets.has(src.offset)) {
            let d = cov.offsets.get(src.offset)!!;
            line = span(`x${d.count}`, 'count') + line;
            if (src.length > 0) { // Ignore non-opcode lines
                // let min = d.gas.reduce((a, b) => a < b ? a : b, d.gas[0]);
                let max = d.gas.reduce((a, b) => a > b ? a : b, d.gas[0]);
                // if (min !== max) {
                //     line = span(`${min} - ${max}`, 'gas') + line;
                // } else {
                //     line = span(`${min}`, 'gas') + line;
                // }
                line = span(`${max}`, 'gas') + line;
            } else {
                line = span(``, 'gas') + line;
            }
            lineClass = 'line-covered';
        } else {
            line = span(``, 'count') + line;
            line = span(``, 'gas') + line;
            lineClass = 'line-uncovered';
        }

        return span(line, lineClass);
    }

    // Decompile with coverage
    let decompiled = decompileAll({ src: code, printer });

    // Process template and return result
    return template(decompiled);
}