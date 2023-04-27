export {
    printCoverage
} from './collector/printCoverage';

export {
    CoverageCollector,
    collectCoverage
} from './collector/coverage';

export {
    LogEntry,
    parseVMLogs
} from './collector/parseVMLogs';

export {
    beginCoverage,
    completeCoverage,
    exportCoverageLogs,
    exportCoverageRawLogs
} from './integration/integrate';