const cds = require('@sap/cds');

describe('Opportunity Probability Auto-Calculation', () => {
    let db;

    beforeAll(async () => {
        db = await cds.connect.to('db');
    });

    test('Should set probability to 33% for Planned stage', async () => {
        const { Opportunities } = cds.entities;
        const oppId = cds.utils.uuid();
        
        await INSERT.into(Opportunities).entries({
            oppId,
            name: 'Test Opportunity',
            stage: 'Planned'
        });

        const opp = await SELECT.one.from(Opportunities).where({ oppId });
        expect(opp.probability).toBe(33);
    });

    test('Should set probability to 100% for Won stage', async () => {
        const { Opportunities } = cds.entities;
        const oppId = cds.utils.uuid();
        
        await INSERT.into(Opportunities).entries({
            oppId,
            name: 'Test Opportunity',
            stage: 'Won'
        });

        const opp = await SELECT.one.from(Opportunities).where({ oppId });
        expect(opp.probability).toBe(100);
    });

    test('Should set probability to 0% for Lost stage', async () => {
        const { Opportunities } = cds.entities;
        const oppId = cds.utils.uuid();
        
        await INSERT.into(Opportunities).entries({
            oppId,
            name: 'Test Opportunity',
            stage: 'Lost'
        });

        const opp = await SELECT.one.from(Opportunities).where({ oppId });
        expect(opp.probability).toBe(0);
    });
});
