namespace com.company.resourceallocation.views;

using {com.company.resourceallocation as db} from './schema';

define view ResourceAllocationView as
select from db.Project as p
left join db.Customer as c
on p.customer.customerId = c.customerId
left join db.Assignment as a
on a.project.projectId = p.projectId
left join db.Employee as e
on a.employee.ohrId = e.ohrId
left join db.EntityStatus as es
on e.status.statusId = es.statusId
{
    key p.projectId,
    key a.assignmentId,
    case
        when p.officialPid is not null then p.officialPid
        else p.tempProjectKey
    end as projectReference : String(50),
    p.name as projectName,
    p.projectType,
    p.status as projectStatus,
    p.startDate as projectStartDate,
    p.endDate as projectEndDate,
    p.tempProjectKey,
    p.officialPid,
    c.customerId,
    c.custName as customerName,
    e.ohrId as employeeId,
    e.fullName as employeeName,
    e.mailId as employeeEmail,
    e.phone as employeePhone,
    e.role as employeeRole,
    e.band as employeeBand,
    e.employeeType,
    e.experience as experienceYears,
    es.statusId as employeeStatus,
    es.name as employeeStatusName,
    a.state as assignmentState,
    a.plannedStartDate,
    a.plannedEndDate,
    a.actualStartDate,
    a.actualEndDate
};

define view EmployeeAllocationView as
select from db.Employee as e
left join db.EntityStatus as es
on e.status.statusId = es.statusId
left join db.Assignment as a
on a.employee.ohrId = e.ohrId
and a.state in ('Pending', 'Active_Temp', 'Active')
left join db.Project as p
on a.project.projectId = p.projectId
left join db.Employee as sup
on e.supervisor.ohrId = sup.ohrId
{
    key e.ohrId as employeeId,
    e.fullName as employeeName,
    e.mailId as email,
    e.phone,
    e.role,
    e.band,
    e.employeeType,
    e.experience as experienceYears,
    e.lwdDate as lastWorkingDay,
    es.statusId as employeeStatus,
    es.name as employeeStatusName,
    e.isActive,
    p.projectId as currentProjectId,
    case
        when p.officialPid is not null then p.officialPid
        else p.tempProjectKey
    end as currentProjectReference : String(50),
    p.name as currentProjectName,
    p.projectType as currentProjectType,
    a.state as assignmentState,
    a.plannedEndDate as availableFrom,
    sup.ohrId as supervisorId,
    sup.fullName as supervisorName
}
where e.isActive = true;

define view SkillsMatrixView as
select from db.Employee as e
left join db.EntityStatus as es
on e.status.statusId = es.statusId
left join db.EmployeeSkill as empSkill
on empSkill.employee.ohrId = e.ohrId
left join db.Skill as s
on empSkill.skill.skillId = s.skillId
left join db.Assignment as a
on a.employee.ohrId = e.ohrId
and a.state in ('Active_Temp', 'Active')
left join db.Project as p
on a.project.projectId = p.projectId
{
    key e.ohrId as employeeId,
    key empSkill.empSkillId,
    e.fullName as employeeName,
    es.statusId as employeeStatus,
    es.name as employeeStatusName,
    e.role,
    e.band,
    e.employeeType,
    e.experience as experienceYears,
    case
        when p.officialPid is not null then p.officialPid
        else p.tempProjectKey
    end as currentProjectReference : String(50),
    p.name as currentProjectName,
    p.projectType as currentProjectType,
    s.skillId,
    s.skillName,
    s.category as skillCategory,
    empSkill.proficiencyLevel,
    empSkill.yearsOfExp as skillYearsOfExp
}
where e.isActive = true;

define view ProjectDetailView as
select from db.Project as p
left join db.Customer as c
on p.customer.customerId = c.customerId
left join db.Opportunity as o
on p.opportunity.oppId = o.oppId
left join db.BusinessType as bt
on o.businessType.businessTypeId = bt.businessTypeId
left join db.Employee as pm
on p.projectManager.ohrId = pm.ohrId
left join db.Assignment as a
on a.project.projectId = p.projectId
left join db.Employee as e
on a.employee.ohrId = e.ohrId
left join db.EntityStatus as es
on e.status.statusId = es.statusId
left join db.Employee as sup
on a.supervisor.ohrId = sup.ohrId
{
    key p.projectId,
    key a.assignmentId,
    p.tempProjectKey,
    p.officialPid,
    p.name as projectName,
    p.projectType,
    p.status as projectStatus,
    p.startDate,
    p.endDate,
    o.sfdcOppId,
    bt.typeName as businessTypeName,
    c.customerId,
    c.custName as customerName,
    c.contactPerson,
    c.email as customerEmail,
    c.phone as customerPhone,
    pm.ohrId as pmEmployeeId,
    pm.fullName as pmName,
    pm.mailId as pmEmail,
    e.ohrId as employeeId,
    e.fullName as employeeName,
    e.mailId as employeeEmail,
    e.phone as employeePhone,
    e.role as employeeRole,
    e.band as employeeBand,
    e.employeeType,
    e.experience as experienceYears,
    es.statusId as employeeStatus,
    es.name as employeeStatusName,
    a.state as assignmentState,
    a.plannedStartDate,
    a.plannedEndDate,
    a.actualStartDate,
    a.actualEndDate,
    sup.ohrId as supervisorId,
    sup.fullName as supervisorName
};
