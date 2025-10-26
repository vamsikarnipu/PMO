const cds = require('@sap/cds');
const { initializeJobs } = require('./jobs/cron-config');

cds.on('listening', () => {
    console.log('\n========================================');
    console.log('CAP Application Started Successfully');
    console.log(`Server running at: ${cds.app.server.url || 'http://localhost:4004'}`);
    console.log('========================================\n');
    
    initializeJobs();
});

module.exports = cds.server;
