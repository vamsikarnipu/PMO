namespace com.company.resourceallocation;

// ============================================
// MASTER DATA ENTITIES
// ============================================

entity Vertical {
    key verticalId : UUID;
    verticalName : String(60) not null;
    description : String(200);
}

entity ProjectType {
    key projectTypeId : UUID;
    typeName : String(60) not null;
    description : String(200);
}

entity BusinessType {
    key businessTypeId : UUID;
    typeName : String(60) not null;
    description : String(200);
}

entity EntityStatus {
    key statusId : String(20); // BENCH, PRE_ALLOCATED, ALLOCATED, RESIGNED
    name : String(30) not null;
    description : String(150);
}

entity Skill {
    key skillId : UUID;
    skillName : String(60) not null;
    category : String(40); // Technical, Functional, Soft Skill
    description : String(100);
}

// ============================================
// CORE ENTITIES
// ============================================

entity Customer {
    key customerId : UUID;
    custName : String(120) not null;
    city : String(60);
    country : String(60);
    status : String(1); // P=Prospect, A=Active, I=Inactive
    vertical : Association to Vertical;
    contactPerson : String(80);
    email : String(100);
    phone : String(20);
    opportunities : Association to many Opportunity on opportunities.customer = $self;
    projects : Association to many Project on projects.customer = $self;
}

entity Opportunity {
    key oppId : UUID;
    sfdcOppId : String(50); // Changed from sapOppId
    customer : Association to Customer not null;
    businessType : Association to BusinessType not null; // NEW
    name : String(120) not null;
    stage : String(20) not null; // ENUM: Planned, Won, Lost
    probability : Integer; // Auto-calculated: Planned=33, Won=100, Lost=0
    salesSpoc : String(80);
    deliverySpoc : String(80);
    startDate : Date;
    endDate : Date;
    estimatedRevenue : Decimal(15, 2);
    projects : Association to many Project on projects.opportunity = $self;
}

entity Project {
    key projectId : UUID;
    tempProjectKey : String(50) not null; // TEMP001, TEMP002... (permanent)
    officialPid : String(50); // NULL initially, added later
    opportunity : Association to Opportunity not null;
    customer : Association to Customer not null;
    name : String(120) not null;
    projectType : String(50) not null; // ENUM: Application Development, etc.
    startDate : Date not null;
    endDate : Date not null;
    projectManager : Association to Employee;
    status : String(20) not null; // Planned, Active, Closed
    requirements : Association to many ProjectRequirement on requirements.project = $self;
    assignments : Association to many Assignment on assignments.project = $self;
}

entity ProjectRequirement {
    key reqId : UUID;
    project : Association to Project not null;
    role : String(60) not null;
    band : String(3) not null; // ENUM: 1A, 1B, 1C, 2A, 2B, 2C, 3A, 3B, 3C, 4A, 4B, 4C, 5A, 5B, 5C
    experienceMin : Decimal(3, 1);
    quantity : Integer not null;
    requiredSkills : Association to many RequirementSkill on requiredSkills.requirement = $self;
}

entity RequirementSkill {
    key reqSkillId : UUID;
    requirement : Association to ProjectRequirement not null;
    skill : Association to Skill not null;
    requiredProficiency : String(20) not null; // Beginner, Intermediate, Advanced
}

entity Assignment {
    key assignmentId : UUID;
    employee : Association to Employee not null;
    project : Association to Project not null;
    requirement : Association to ProjectRequirement not null;
    supervisor : Association to Employee;
    state : String(20) not null; // Pending, Active_Temp, Active, Closed
    plannedStartDate : Date;
    plannedEndDate : Date;
    actualStartDate : Date;
    actualEndDate : Date;
}

entity Employee {
    key ohrId : String(20);
    mailId : String(100) not null;
    firstName : String(50) not null;
    lastName : String(50) not null;
    fullName : String(100);
    employeeType : String(20) not null; // ENUM: Full-Time, Part-Time, Contractor, Intern
    doj : Date; // Date of Joining
    band : String(3) not null; // ENUM: 1A, 1B, 1C, 2A, 2B, 2C, 3A, 3B, 3C, 4A, 4B, 4C, 5A, 5B, 5C
    role : String(20); // Employee, Supervisor, Project Manager, Admin
    experience : Decimal(3, 1);
    phone : String(20);
    supervisor : Association to Employee;
    status : Association to EntityStatus not null;
    isActive : Boolean default true;
    lwdDate : Date; // Last Working Day (set when resigned)
    skills : Association to many EmployeeSkill on skills.employee = $self;
    assignments : Association to many Assignment on assignments.employee = $self;
}

entity EmployeeSkill {
    key empSkillId : UUID;
    employee : Association to Employee not null;
    skill : Association to Skill not null;
    proficiencyLevel : String(20) not null; // Beginner, Intermediate, Advanced
    yearsOfExp : Decimal(3, 1);
}

entity AssignmentHistory {
    key historyId : UUID;
    assignment : Association to Assignment not null;
    oldState : String(20);
    newState : String(20) not null;
    changedBy : String(80);
    changeReason : String(200);
    changedAt : Timestamp not null;
}

entity EmployeeStatusLog {
    key logId : UUID;
    employee : Association to Employee not null;
    oldStatus : String(20);
    newStatus : String(20) not null;
    changedBy : String(80);
    changeReason : String(200);
    changedAt : Timestamp not null;
}

entity Notification {
    key notificationId : UUID;
    recipient : Association to Employee not null;
    notificationType : String(50) not null;
    message : String(300) not null;
    relatedEntityId : UUID;
    isRead : Boolean default false;
    createdAt : Timestamp not null;
}
