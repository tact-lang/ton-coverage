# TON Code Coverage

This package provides a set of tools to build a code coverage report for TON smart contracts. Integrated directly with `@tact-lang/emulator`.

## Installation

```bash
yarn add @tact-lang/coverage ton-core ton-crypto
```

## Usage

```ts
import { beginCoverage } from "@tact-lang/coverage";

// Call this function before you start executing your contract.
beginCoverage();

// ... Execute your contract via @tact-lang/emulator

// Generate report
completeCoverage('... path to boc files with contracts ...');

// Find out the coverage report next to boc file
```

## License

MIT