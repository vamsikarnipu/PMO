const cds = require('@sap/cds');

// Global test setup
beforeAll(async () => {
    // Initialize test database
    await cds.deploy();
});

afterAll(async () => {
    // Cleanup after all tests
    const db = await cds.connect.to('db');
    await db.run('DROP TABLE IF EXISTS Notification');
    await db.run('DROP TABLE IF EXISTS EmployeeStatusLog');
    await db.run('DROP TABLE IF EXISTS AssignmentHistory');
    await db.run('DROP TABLE IF EXISTS EmployeeSkill');
    await db.run('DROP TABLE IF EXISTS Assignment');
    await db.run('DROP TABLE IF EXISTS Employee');
    await db.run('DROP TABLE IF EXISTS RequirementSkill');
    await db.run('DROP TABLE IF EXISTS ProjectRequirement');
    await db.run('DROP TABLE IF EXISTS Project');
    await db.run('DROP TABLE IF EXISTS Opportunity');
    await db.run('DROP TABLE IF EXISTS Customer');
    await db.run('DROP TABLE IF EXISTS Skill');
    await db.run('DROP TABLE IF EXISTS BusinessType');
    await db.run('DROP TABLE IF EXISTS ProjectType');
    await db.run('DROP TABLE IF EXISTS Vertical');
    await db.run('DROP TABLE IF EXISTS EntityStatus');
});
