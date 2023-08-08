import { beginCoverage, completeCoverage } from "./integrate";
import { ContractSystem, randomAddress } from '@tact-lang/emulator';
import { toNano } from "@ton/core";

fdescribe('integrate', () => {
    it('should integrate', async () => {
        beginCoverage();
        let system = await ContractSystem.create();
        let treasure = system.treasure('treasure');
        let target = randomAddress('some');
        await treasure.send({ to: target, value: toNano('10') });
        await system.run();
        completeCoverage(__dirname + '/__testdata__/**/*.boc');
    });
});