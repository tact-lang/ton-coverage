import { decompileAll, opcodeToString, Printer } from "@tact-lang/opcode";
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
                    height: 1em;
                    background-color: #0f0;
                }
                .line-uncovered {
                    height: 1em;
                    background-color: #F6C6CE;
                }
                .count {
                    color: #00f;
                }
            </style>
        </head>
        <body>
            <pre>
            ${pad(trimIndent(src), 8)}
            </pre>
        <body>
    </html>
    `);
}

export function printCoverage(code: Cell, collector: CoverageCollector) {

    // Create printer
    const printer: Printer = (src, indent) => {
        if (typeof src === 'string') {
            return span(span('.'.repeat(indent * 2), 'padding') + src, 'line');
        }
        let line = span('.'.repeat(indent * 2), 'padding') + span(opcodeToString(src.op), 'opcode');
        let cov = collector.coverageForCell(src.hash);
        let lineClass: string;
        if (cov && cov.offsets.has(src.offset)) {
            let d = cov.offsets.get(src.offset)!!;
            line = line + ' ' + span(`x${d.count}`, 'count');
            let min = d.gas.reduce((a, b) => a < b ? a : b, d.gas[0]);
            let max = d.gas.reduce((a, b) => a > b ? a : b, d.gas[0]);
            if (min !== max) {
                line = line + ' ' + span(`gas: ${min} - ${max}`, 'gas');
            } else {
                line = line + ' ' + span(`gas: ${min}`, 'gas');
            }
            lineClass = 'line-covered';
        } else {
            lineClass = 'line-uncovered';
        }

        return span(line, lineClass);
    }

    // Decompile with coverage
    let decompiled = decompileAll({ src: code, printer });

    // Process template and return result
    return template(decompiled);
}