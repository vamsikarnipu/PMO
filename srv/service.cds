using {com.company.resourceallocation as db} from '../db/schema';
using {com.company.resourceallocation.views as views} from '../db/views';

service ResourceAllocationService @(path: '/resource-allocation') {

// ============================================
// MASTER DATA ENTITIES
// ============================================

entity Verticals as projection on db.Vertical;
entity ProjectTypes as projection on db.ProjectType;
entity BusinessTypes as projection on db.BusinessType;
entity Skills as projection on db.Skill;

@readonly
entity EntityStatuses as projection on db.EntityStatus;

// ============================================
// CORE ENTITIES
// ============================================

entity Customers as projection on db.Customer {
    *,
    vertical.verticalName as verticalName : String
};

entity Opportunities as projection on db.Opportunity {
    *,
    customer.custName as customerName : String,
    businessType.typeName as businessTypeName : String,
    projects
};

entity Projects as projection on db.Project {
    *,
    customer.custName as customerName : String,
    projectManager.fullName as pmName : String,
    requirements,
    assignments
};

entity ProjectRequirements as projection on db.ProjectRequirement {
    *,
    project.name as projectName : String,
    requiredSkills
};

entity RequirementSkills as projection on db.RequirementSkill {
    *,
    requirement.role as requirementRole : String,
    skill.skillName as skillName : String
};

entity Assignments as projection on db.Assignment {
    *,
    employee.fullName as employeeName : String,
    project.name as projectName : String,
    supervisor.fullName as supervisorName : String
};

entity Employees as projection on db.Employee {
    *,
    status.name as statusName : String,
    supervisor.fullName as supervisorName : String,
    skills,
    assignments
};

entity EmployeeSkills as projection on db.EmployeeSkill {
    *,
    employee.fullName as employeeName : String,
    skill.skillName as skillName : String
};

// ============================================
// AUDIT & NOTIFICATIONS
// ============================================

@readonly
entity AssignmentHistory as projection on db.AssignmentHistory;

@readonly
entity EmployeeStatusLog as projection on db.EmployeeStatusLog;

@readonly
entity Notifications as projection on db.Notification;

// ============================================
// VIEWS
// ============================================

@readonly
entity ResourceAllocation as projection on views.ResourceAllocationView;

@readonly
entity EmployeeAllocation as projection on views.EmployeeAllocationView;

@readonly
entity SkillsMatrix as projection on views.SkillsMatrixView;

@readonly
entity ProjectDetail as projection on views.ProjectDetailView;

// ============================================
// ACTIONS & FUNCTIONS
// ============================================

action addOfficialPID(
    projectId : UUID,
    officialPid : String
) returns {
    success : Boolean;
    message : String;
    assignmentsUpdated : Integer;
};

action startAssignment(assignmentId : UUID) returns {
    success : Boolean;
    message : String;
    newState : String;
    newEmployeeStatus : String;
};

action closeAssignment(assignmentId : UUID) returns {
    success : Boolean;
    message : String;
};

action resignEmployee(
    ohrId : String,
    lwdDate : String
) returns {
    success : Boolean;
    message : String;
};

function getEligibleEmployees(requirementId : UUID) returns array of {
    employeeId : String;
    fullName : String;
    email : String;
    role : String;
    band : String;
    employeeType : String;
    experienceYears : Decimal;
    currentStatus : String;
    matchingSkills : array of {
        skillName : String;
        proficiency : String;
        yearsOfExp : Decimal;
    };
};

function generateClientReport(
    projectId : UUID,
    includeFields : {
        employeeName : Boolean;
        email : Boolean;
        phone : Boolean;
        role : Boolean;
        band : Boolean;
        employeeType : Boolean;
        experienceYears : Boolean;
        skills : Boolean;
        supervisor : Boolean;
        assignmentDates : Boolean;
    }
) returns {
    reportId : UUID;
    projectReference : String;
    projectName : String;
    projectType : String;
    customerName : String;
    generatedAt : String;
    totalEmployees : Integer;
    employees : array of {
        employeeName : String;
        email : String;
        phone : String;
        role : String;
        band : String;
        employeeType : String;
        experienceYears : Decimal;
        skills : String;
        supervisor : String;
        startDate : String;
        endDate : String;
    };
};

}
