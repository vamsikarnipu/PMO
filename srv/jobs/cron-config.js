const cron = require('node-cron');
const { autoStartProjects, autoCloseProjects, cleanupNotifications } = require('./scheduledJobs');

function initializeJobs() {
    console.log('Initializing scheduled jobs...');

    // Auto-start projects job - Daily at 1:00 AM UTC
    cron.schedule('0 1 * * *', async () => {
        await autoStartProjects();
    }, {
        timezone: "UTC"
    });
    console.log('✓ Auto-start projects job scheduled: Daily at 1:00 AM UTC');

    // Auto-close projects job - Daily at 2:00 AM UTC
    cron.schedule('0 2 * * *', async () => {
        await autoCloseProjects();
    }, {
        timezone: "UTC"
    });
    console.log('✓ Auto-close projects job scheduled: Daily at 2:00 AM UTC');

    // Cleanup notifications job - Weekly Sunday at 3:00 AM UTC
    cron.schedule('0 3 * * 0', async () => {
        await cleanupNotifications();
    }, {
        timezone: "UTC"
    });
    console.log('✓ Cleanup notifications job scheduled: Weekly Sunday at 3:00 AM UTC');

    console.log('All scheduled jobs initialized successfully\n');
}

module.exports = { initializeJobs };
