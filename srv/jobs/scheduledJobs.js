const cds = require('@sap/cds');

// ============================================
// AUTO-START PROJECTS JOB
// Runs daily at 1:00 AM UTC
// ============================================
async function autoStartProjects() {
    console.log('========================================');
    console.log('AUTO-START PROJECTS JOB STARTED');
    console.log(`Execution Time: ${new Date().toISOString()}`);
    console.log('========================================');

    try {
        const db = await cds.connect.to('db');
        const today = new Date().toISOString().split('T')[0];

        // Find projects that should start today
        const projectsToStart = await SELECT.from('Project')
            .where({
                status: 'Planned',
                startDate: today
            })
            .columns('projectId', 'name', 'officialPid', 'tempProjectKey');

        console.log(`Found ${projectsToStart.length} projects to start`);

        for (const project of projectsToStart) {
            try {
                await db.run('BEGIN');

                // Get all pending assignments for this project
                const assignments = await SELECT.from('Assignment')
                    .where({
                        project_projectId: project.projectId,
                        state: 'Pending'
                    })
                    .columns('assignmentId', 'employee_ohrId', 'state');

                console.log(`Starting project ${project.officialPid || project.tempProjectKey}: ${assignments.length} assignments`);

                // Update project status
                await UPDATE('Project')
                    .set({ status: 'Active' })
                    .where({ projectId: project.projectId });

                // Update assignments to Active_Temp
                for (const assignment of assignments) {
                    await UPDATE('Assignment')
                        .set({ state: 'Active_Temp' })
                        .where({ assignmentId: assignment.assignmentId });

                    await UPDATE('Employee')
                        .set({ status_statusId: 'PRE_ALLOCATED' })
                        .where({ ohrId: assignment.employee_ohrId });

                    await INSERT.into('AssignmentHistory').entries({
                        historyId: cds.utils.uuid(),
                        assignment_assignmentId: assignment.assignmentId,
                        oldState: 'Pending',
                        newState: 'Active_Temp',
                        changedBy: 'SYSTEM',
                        changeReason: 'Auto-start on project start date',
                        changedAt: new Date().toISOString()
                    });

                    await INSERT.into('EmployeeStatusLog').entries({
                        logId: cds.utils.uuid(),
                        employee_ohrId: assignment.employee_ohrId,
                        oldStatus: 'BENCH',
                        newStatus: 'PRE_ALLOCATED',
                        changedBy: 'SYSTEM',
                        changeReason: 'Auto-start on project start date',
                        changedAt: new Date().toISOString()
                    });

                    await INSERT.into('Notification').entries({
                        notificationId: cds.utils.uuid(),
                        recipient_ohrId: assignment.employee_ohrId,
                        notificationType: 'ASSIGNMENT_STARTED',
                        message: `Your assignment on project "${project.name}" (${project.officialPid || project.tempProjectKey}) has started`,
                        relatedEntityId: project.projectId,
                        isRead: false,
                        createdAt: new Date().toISOString()
                    });

                    console.log(`✓ Updated employee ${assignment.employee_ohrId}: BENCH → PRE_ALLOCATED`);
                }

                await db.run('COMMIT');
                console.log(`✓ Successfully started project ${project.officialPid || project.tempProjectKey} with ${assignments.length} assignments`);
            } catch (error) {
                await db.run('ROLLBACK');
                console.error(`✗ Error starting project ${project.officialPid || project.tempProjectKey}:`, error);
            }
        }

        console.log('\n========================================');
        console.log('AUTO-START PROJECTS JOB COMPLETED');
        console.log(`Total projects processed: ${projectsToStart.length}`);
        console.log('========================================\n');
    } catch (error) {
        console.error('Fatal error in autoStartProjects:', error);
    }
}

// ============================================
// AUTO-CLOSE PROJECTS JOB
// Runs daily at 2:00 AM UTC
// ============================================
async function autoCloseProjects() {
    console.log('========================================');
    console.log('AUTO-CLOSE PROJECTS JOB STARTED');
    console.log(`Execution Time: ${new Date().toISOString()}`);
    console.log('========================================');

    try {
        const db = await cds.connect.to('db');
        const today = new Date().toISOString().split('T')[0];

        // Find projects that should close today
        const projectsToClose = await SELECT.from('Project')
            .where({
                status: 'Active',
                endDate: today
            })
            .columns('projectId', 'name', 'officialPid', 'tempProjectKey');

        console.log(`Found ${projectsToClose.length} projects to close`);

        for (const project of projectsToClose) {
            try {
                await db.run('BEGIN');

                // Get all active assignments for this project
                const assignments = await SELECT.from('Assignment')
                    .where({
                        project_projectId: project.projectId,
                        state: { in: ['Active_Temp', 'Active'] }
                    })
                    .columns('assignmentId', 'employee_ohrId', 'state');

                console.log(`Closing project ${project.officialPid || project.tempProjectKey}: ${assignments.length} assignments`);

                // Close all assignments
                for (const assignment of assignments) {
                    const oldStatus = assignment.state === 'Active' ? 'ALLOCATED' : 'PRE_ALLOCATED';

                    await UPDATE('Assignment')
                        .set({
                            state: 'Closed',
                            actualEndDate: today
                        })
                        .where({ assignmentId: assignment.assignmentId });

                    await UPDATE('Employee')
                        .set({ status_statusId: 'BENCH' })
                        .where({ ohrId: assignment.employee_ohrId });

                    await INSERT.into('AssignmentHistory').entries({
                        historyId: cds.utils.uuid(),
                        assignment_assignmentId: assignment.assignmentId,
                        oldState: assignment.state,
                        newState: 'Closed',
                        changedBy: 'SYSTEM',
                        changeReason: 'Auto-close on project end date',
                        changedAt: new Date().toISOString()
                    });

                    await INSERT.into('EmployeeStatusLog').entries({
                        logId: cds.utils.uuid(),
                        employee_ohrId: assignment.employee_ohrId,
                        oldStatus: oldStatus,
                        newStatus: 'BENCH',
                        changedBy: 'SYSTEM',
                        changeReason: 'Auto-close on project end date',
                        changedAt: new Date().toISOString()
                    });

                    await INSERT.into('Notification').entries({
                        notificationId: cds.utils.uuid(),
                        recipient_ohrId: assignment.employee_ohrId,
                        notificationType: 'ASSIGNMENT_CLOSED',
                        message: `Your assignment on project "${project.name}" (${project.officialPid || project.tempProjectKey}) has been closed`,
                        relatedEntityId: project.projectId,
                        isRead: false,
                        createdAt: new Date().toISOString()
                    });

                    console.log(`✓ Updated employee ${assignment.employee_ohrId}: ${oldStatus} → BENCH`);
                }

                await UPDATE('Project')
                    .set({ status: 'Closed' })
                    .where({ projectId: project.projectId });

                await db.run('COMMIT');
                console.log(`✓ Successfully closed project ${project.officialPid || project.tempProjectKey} with ${assignments.length} assignments`);
            } catch (error) {
                await db.run('ROLLBACK');
                console.error(`✗ Error closing project ${project.officialPid || project.tempProjectKey}:`, error);
            }
        }

        console.log('\n========================================');
        console.log('AUTO-CLOSE PROJECTS JOB COMPLETED');
        console.log(`Total projects processed: ${projectsToClose.length}`);
        console.log('========================================\n');
    } catch (error) {
        console.error('Fatal error in autoCloseProjects:', error);
    }
}

// ============================================
// CLEANUP OLD NOTIFICATIONS JOB
// Runs weekly on Sunday at 3:00 AM
// ============================================
async function cleanupNotifications() {
    console.log('========================================');
    console.log('CLEANUP NOTIFICATIONS JOB STARTED');
    console.log(`Execution Time: ${new Date().toISOString()}`);
    console.log('========================================');

    try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const cutoffDate = ninetyDaysAgo.toISOString();

        const result = await DELETE.from('Notification')
            .where({
                isRead: true,
                createdAt: { '<': cutoffDate }
            });

        console.log(`✓ Deleted ${result} old read notifications`);

        console.log('\n========================================');
        console.log('CLEANUP NOTIFICATIONS JOB COMPLETED');
        console.log('========================================\n');
    } catch (error) {
        console.error('Error in cleanupNotifications:', error);
    }
}

module.exports = {
    autoStartProjects,
    autoCloseProjects,
    cleanupNotifications
};
