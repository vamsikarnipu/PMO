const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
    const { Assignments, Employees, Projects, EmployeeSkills, Skills, AssignmentHistory, EmployeeStatusLog, Notifications, Customers } = this.entities;

    // ============================================
    // ADD OFFICIAL PID ACTION
    // ============================================
    this.on('addOfficialPID', async (req) => {
        const { projectId, officialPid } = req.data;
        
        if (!projectId || !officialPid) {
            return {
                success: false,
                message: 'ProjectId and OfficialPID are required'
            };
        }

        const db = await cds.connect.to('db');
        try {
            await db.run('BEGIN');
            
            const project = await SELECT.one.from(Projects)
                .where({ projectId: projectId })
                .columns('projectId', 'name', 'officialPid');
            
            if (!project) {
                await db.run('ROLLBACK');
                return {
                    success: false,
                    message: 'Project not found'
                };
            }

            if (project.officialPid) {
                await db.run('ROLLBACK');
                return {
                    success: false,
                    message: 'Project already has an official PID'
                };
            }

            console.log(`Adding official PID ${officialPid} to project ${project.name}`);
            
            await UPDATE(Projects)
                .set({ officialPid: officialPid })
                .where({ projectId: projectId });

            // Update all assignments to use the new official PID
            const assignments = await SELECT.from(Assignments)
                .where({ project_projectId: projectId })
                .columns('assignmentId', 'employee_ohrId');

            let assignmentsUpdated = 0;
            for (const assignment of assignments) {
                await INSERT.into(AssignmentHistory).entries({
                    historyId: cds.utils.uuid(),
                    assignment_assignmentId: assignment.assignmentId,
                    oldState: assignment.state,
                    newState: assignment.state,
                    changedBy: req.user.id || 'SYSTEM',
                    changeReason: `Official PID ${officialPid} added to project`,
                    changedAt: new Date().toISOString()
                });
                assignmentsUpdated++;
            }

            await db.run('COMMIT');
            return {
                success: true,
                message: `Official PID ${officialPid} added successfully`,
                assignmentsUpdated: assignmentsUpdated
            };
        } catch (error) {
            await db.run('ROLLBACK');
            console.error('Error in addOfficialPID:', error);
            throw error;
        }
    });

    // ============================================
    // START ASSIGNMENT ACTION
    // ============================================
    this.on('startAssignment', async (req) => {
        const { assignmentId } = req.data;
        
        if (!assignmentId) {
            return {
                success: false,
                message: 'AssignmentId is required'
            };
        }

        const db = await cds.connect.to('db');
        try {
            await db.run('BEGIN');
            
            const assignment = await SELECT.one.from(Assignments)
                .where({ assignmentId: assignmentId })
                .columns('assignmentId', 'employee_ohrId', 'project_projectId', 'state');
            
            if (!assignment) {
                await db.run('ROLLBACK');
                return {
                    success: false,
                    message: 'Assignment not found'
                };
            }

            if (assignment.state !== 'Pending') {
                await db.run('ROLLBACK');
                return {
                    success: false,
                    message: 'Assignment is not in Pending state'
                };
            }

            const today = new Date().toISOString().split('T')[0];
            const project = await SELECT.one.from(Projects)
                .where({ projectId: assignment.project_projectId })
                .columns('projectId', 'name', 'officialPid', 'tempProjectKey');

            console.log(`Starting assignment ${assignmentId} for project ${project.name}`);
            
            await UPDATE(Assignments)
                .set({
                    state: 'Active',
                    actualStartDate: today
                })
                .where({ assignmentId: assignmentId });

            await UPDATE(Employees)
                .set({ status_statusId: 'ALLOCATED' })
                .where({ ohrId: assignment.employee_ohrId });

            await INSERT.into(AssignmentHistory).entries({
                historyId: cds.utils.uuid(),
                assignment_assignmentId: assignmentId,
                oldState: 'Pending',
                newState: 'Active',
                changedBy: req.user.id || 'SYSTEM',
                changeReason: 'Assignment started',
                changedAt: new Date().toISOString()
            });

            await INSERT.into(EmployeeStatusLog).entries({
                logId: cds.utils.uuid(),
                employee_ohrId: assignment.employee_ohrId,
                oldStatus: 'PRE_ALLOCATED',
                newStatus: 'ALLOCATED',
                changedBy: req.user.id || 'SYSTEM',
                changeReason: 'Assignment started',
                changedAt: new Date().toISOString()
            });

            const projectRef = project.officialPid || project.tempProjectKey;
            await INSERT.into(Notifications).entries({
                notificationId: cds.utils.uuid(),
                recipient_ohrId: assignment.employee_ohrId,
                notificationType: 'ASSIGNMENT_STARTED',
                message: `Your assignment on project "${project.name} (${projectRef})" has started`,
                relatedEntityId: project.projectId,
                isRead: false,
                createdAt: new Date().toISOString()
            });

            await db.run('COMMIT');
            return {
                success: true,
                message: 'Assignment started successfully',
                newState: 'Active',
                newEmployeeStatus: 'ALLOCATED'
            };
        } catch (error) {
            await db.run('ROLLBACK');
            console.error('Error in startAssignment:', error);
            throw error;
        }
    });

    // ============================================
    // CLOSE ASSIGNMENT ACTION
    // ============================================
    this.on('closeAssignment', async (req) => {
        const { assignmentId } = req.data;
        
        if (!assignmentId) {
            return {
                success: false,
                message: 'AssignmentId is required'
            };
        }

        const db = await cds.connect.to('db');
        try {
            await db.run('BEGIN');
            
            const assignment = await SELECT.one.from(Assignments)
                .where({ assignmentId: assignmentId })
                .columns('assignmentId', 'employee_ohrId', 'project_projectId', 'state');
            
            if (!assignment) {
                await db.run('ROLLBACK');
                return {
                    success: false,
                    message: 'Assignment not found'
                };
            }

            if (assignment.state === 'Closed') {
                await db.run('ROLLBACK');
                return {
                    success: false,
                    message: 'Assignment is already closed'
                };
            }

            const oldState = assignment.state;
            const oldEmployeeStatus = oldState === 'Active' ? 'ALLOCATED' : 'PRE_ALLOCATED';
            const today = new Date().toISOString().split('T')[0];
            const project = await SELECT.one.from(Projects)
                .where({ projectId: assignment.project_projectId })
                .columns('projectId', 'name', 'officialPid', 'tempProjectKey');

            console.log(`Closing assignment ${assignmentId} from state ${oldState}`);
            
            await UPDATE(Assignments)
                .set({
                    state: 'Closed',
                    actualEndDate: today
                })
                .where({ assignmentId: assignmentId });

            await UPDATE(Employees)
                .set({ status_statusId: 'BENCH' })
                .where({ ohrId: assignment.employee_ohrId });

            await INSERT.into(AssignmentHistory).entries({
                historyId: cds.utils.uuid(),
                assignment_assignmentId: assignmentId,
                oldState: oldState,
                newState: 'Closed',
                changedBy: req.user.id || 'SYSTEM',
                changeReason: 'Assignment closed',
                changedAt: new Date().toISOString()
            });

            await INSERT.into(EmployeeStatusLog).entries({
                logId: cds.utils.uuid(),
                employee_ohrId: assignment.employee_ohrId,
                oldStatus: oldEmployeeStatus,
                newStatus: 'BENCH',
                changedBy: req.user.id || 'SYSTEM',
                changeReason: 'Assignment closed',
                changedAt: new Date().toISOString()
            });

            const projectRef = project.officialPid || project.tempProjectKey;
            await INSERT.into(Notifications).entries({
                notificationId: cds.utils.uuid(),
                recipient_ohrId: assignment.employee_ohrId,
                notificationType: 'ASSIGNMENT_CLOSED',
                message: `Your assignment on project "${project.name} (${projectRef})" has been closed`,
                relatedEntityId: project.projectId,
                isRead: false,
                createdAt: new Date().toISOString()
            });

            await db.run('COMMIT');
            return {
                success: true,
                message: 'Assignment closed successfully'
            };
        } catch (error) {
            await db.run('ROLLBACK');
            console.error('Error in closeAssignment:', error);
            throw error;
        }
    });

    // ============================================
    // RESIGN EMPLOYEE ACTION
    // ============================================
    this.on('resignEmployee', async (req) => {
        const { ohrId, lwdDate } = req.data;
        
        if (!ohrId || !lwdDate) {
            return {
                success: false,
                message: 'Employee ID and Last Working Day are required'
            };
        }

        const db = await cds.connect.to('db');
        try {
            await db.run('BEGIN');
            
            const employee = await SELECT.one.from(Employees)
                .where({ ohrId: ohrId })
                .columns('ohrId', 'fullName', 'status_statusId', 'isActive');
            
            if (!employee) {
                await db.run('ROLLBACK');
                return {
                    success: false,
                    message: 'Employee not found'
                };
            }

            if (!employee.isActive) {
                await db.run('ROLLBACK');
                return {
                    success: false,
                    message: 'Employee is already inactive'
                };
            }

            const oldStatus = employee.status_statusId;

            // Close all active assignments
            const activeAssignments = await SELECT.from(Assignments)
                .where({
                    employee_ohrId: ohrId,
                    state: { in: ['Pending', 'Active_Temp', 'Active'] }
                });

            if (activeAssignments.length > 0) {
                await UPDATE(Assignments)
                    .set({
                        state: 'Closed',
                        actualEndDate: lwdDate
                    })
                    .where({
                        employee_ohrId: ohrId,
                        state: { in: ['Pending', 'Active_Temp', 'Active'] }
                    });

                for (const assignment of activeAssignments) {
                    await INSERT.into(AssignmentHistory).entries({
                        historyId: cds.utils.uuid(),
                        assignment_assignmentId: assignment.assignmentId,
                        oldState: assignment.state,
                        newState: 'Closed',
                        changedBy: req.user.id || 'SYSTEM',
                        changeReason: 'Employee resigned',
                        changedAt: new Date().toISOString()
                    });
                }
            }

            // Update employee to RESIGNED
            await UPDATE(Employees)
                .set({
                    status_statusId: 'RESIGNED',
                    isActive: false,
                    lwdDate: lwdDate
                })
                .where({ ohrId: ohrId });

            await INSERT.into(EmployeeStatusLog).entries({
                logId: cds.utils.uuid(),
                employee_ohrId: ohrId,
                oldStatus: oldStatus,
                newStatus: 'RESIGNED',
                changedBy: req.user.id || 'SYSTEM',
                changeReason: `Employee resigned with LWD: ${lwdDate}`,
                changedAt: new Date().toISOString()
            });

            await db.run('COMMIT');
            console.log(`Employee ${employee.fullName} resigned with LWD: ${lwdDate}, closed ${activeAssignments.length} assignments`);
            
            return {
                success: true,
                message: `Employee ${employee.fullName} marked as resigned. ${activeAssignments.length} assignments closed.`
            };
        } catch (error) {
            await db.run('ROLLBACK');
            console.error('Error in resignEmployee:', error);
            throw error;
        }
    });

    // ============================================
    // GET ELIGIBLE EMPLOYEES FUNCTION
    // ============================================
    this.on('getEligibleEmployees', async (req) => {
        const { requirementId } = req.data;
        
        if (!requirementId) {
            return [];
        }

        try {
            const requirement = await SELECT.one.from('ProjectRequirement')
                .where({ reqId: requirementId })
                .columns('reqId', 'role', 'band', 'experienceMin', 'project_projectId');

            if (!requirement) {
                return [];
            }

            // Get required skills for this requirement
            const requiredSkills = await SELECT.from('RequirementSkill')
                .where({ requirement_reqId: requirementId })
                .columns('skill_skillId', 'requiredProficiency');

            const skillIds = requiredSkills.map(rs => rs.skill_skillId);

            // Find employees with matching skills and status
            const eligibleEmployees = await SELECT.from(Employees)
                .where({
                    status_statusId: { in: ['BENCH', 'PRE_ALLOCATED'] },
                    isActive: true,
                    experience: { '>=': requirement.experienceMin },
                    band: requirement.band
                })
                .columns('ohrId', 'fullName', 'mailId', 'role', 'band', 'employeeType', 'experience', 'status_statusId');

            const result = [];
            for (const employee of eligibleEmployees) {
                // Get employee skills
                const empSkills = await SELECT.from(EmployeeSkills)
                    .where({ 
                        employee_ohrId: employee.ohrId,
                        skill_skillId: { in: skillIds }
                    })
                    .columns('skill_skillId', 'proficiencyLevel', 'yearsOfExp');

                const skillNames = await SELECT.from(Skills)
                    .where({ skillId: { in: skillIds } })
                    .columns('skillId', 'skillName');

                const skillMap = {};
                skillNames.forEach(s => {
                    skillMap[s.skillId] = s.skillName;
                });

                const matchingSkills = empSkills.map(es => ({
                    skillName: skillMap[es.skill_skillId],
                    proficiency: es.proficiencyLevel,
                    yearsOfExp: es.yearsOfExp
                }));

                result.push({
                    employeeId: employee.ohrId,
                    fullName: employee.fullName,
                    email: employee.mailId,
                    role: employee.role,
                    band: employee.band,
                    employeeType: employee.employeeType,
                    experienceYears: employee.experience,
                    currentStatus: employee.status_statusId,
                    matchingSkills: matchingSkills
                });
            }

            return result;
        } catch (error) {
            console.error('Error in getEligibleEmployees:', error);
            throw error;
        }
    });

    // ============================================
    // GENERATE CLIENT REPORT FUNCTION
    // ============================================
    this.on('generateClientReport', async (req) => {
        const { projectId, includeFields } = req.data;
        
        if (!projectId) {
            return {
                reportId: null,
                message: 'ProjectId is required',
                employees: []
            };
        }

        try {
            const project = await SELECT.one.from(Projects)
                .where({ projectId: projectId })
                .columns('projectId', 'name', 'officialPid', 'tempProjectKey', 'projectType', 'customer_customerId');
            
            if (!project) {
                return {
                    reportId: null,
                    message: 'Project not found',
                    employees: []
                };
            }

            const customer = await SELECT.one.from(Customers)
                .where({ customerId: project.customer_customerId })
                .columns('custName');

            const projectRef = project.officialPid || project.tempProjectKey;
            const assignments = await SELECT.from(Assignments)
                .where({
                    project_projectId: projectId,
                    state: { in: ['Active_Temp', 'Active'] }
                })
                .columns('assignmentId', 'employee_ohrId', 'supervisor_ohrId', 'plannedStartDate', 'plannedEndDate');

            console.log(`Generating report for project ${projectRef}: ${assignments.length} employees`);

            const employeeData = [];
            for (const assignment of assignments) {
                const employee = await SELECT.one.from(Employees)
                    .where({ ohrId: assignment.employee_ohrId })
                    .columns('ohrId', 'fullName', 'mailId', 'phone', 'role', 'band', 'employeeType', 'experience');
                
                if (!employee) continue;

                let skillsString = '';
                if (includeFields.skills) {
                    const empSkills = await SELECT.from(EmployeeSkills)
                        .where({ employee_ohrId: employee.ohrId })
                        .columns('skill_skillId', 'proficiencyLevel');
                    
                    const skillNames = await SELECT.from(Skills)
                        .where({ skillId: { in: empSkills.map(es => es.skill_skillId) } })
                        .columns('skillId', 'skillName');
                    
                    const skillMap = {};
                    skillNames.forEach(s => {
                        skillMap[s.skillId] = s.skillName;
                    });
                    
                    skillsString = empSkills.map(es =>
                        `${skillMap[es.skill_skillId]} (${es.proficiencyLevel})`
                    ).join(', ');
                }

                let supervisorName = '';
                if (includeFields.supervisor && assignment.supervisor_ohrId) {
                    const supervisor = await SELECT.one.from(Employees)
                        .where({ ohrId: assignment.supervisor_ohrId })
                        .columns('fullName');
                    supervisorName = supervisor ? supervisor.fullName : '';
                }

                employeeData.push({
                    employeeName: includeFields.employeeName ? employee.fullName : '',
                    email: includeFields.email ? employee.mailId : '',
                    phone: includeFields.phone ? employee.phone : '',
                    role: includeFields.role ? employee.role : '',
                    band: includeFields.band ? employee.band : '',
                    employeeType: includeFields.employeeType ? employee.employeeType : '',
                    experienceYears: includeFields.experienceYears ? employee.experience : null,
                    skills: skillsString,
                    supervisor: supervisorName,
                    startDate: includeFields.assignmentDates ? assignment.plannedStartDate : '',
                    endDate: includeFields.assignmentDates ? assignment.plannedEndDate : ''
                });
            }

            return {
                reportId: cds.utils.uuid(),
                projectReference: projectRef,
                projectName: project.name,
                projectType: project.projectType,
                customerName: customer ? customer.custName : '',
                generatedAt: new Date().toISOString(),
                totalEmployees: employeeData.length,
                employees: employeeData
            };
        } catch (error) {
            console.error('Error in generateClientReport:', error);
            throw error;
        }
    });
});
