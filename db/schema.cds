// prototype schema :  reply to this thread and suggest changes recommended
namespace db;

using {managed} from '@sap/cds/common';


type CustomerStatusEnum   : String enum {
    A = 'Active';
    I = 'Inactive';
    P = 'Prospect'
}

entity Vertical {
    key id           : Integer;
        verticalName : String;

}

entity Customer {
    key SAPcustId        : String;
        customerName     : String(100);
        city             : String;
        segment          : String;
        state            : String;
        country          : String;
        status           : CustomerStatusEnum;
        vertical         : String;
        verticalId       : Integer;
        to_vertical      : Association to many Vertical
                               on to_vertical.id = $self.verticalId;

        to_Opportunities : Association to many Opportunity
                               on to_Opportunities.customerId = $self.SAPcustId;
}


// -------------------- Opportunity --------------------


type ProbabilityEnum      : String enum {
    ProposalStage = '0%'; // Proposal Stage
    SoWSent = '33%'; // SoW is Sent
    SoWSigned = '85%'; // SoW is Signed
    PurchaseOrderReceived = '100%'; // Purchase Order is received
}

type OpportunityStageEnum : String enum {
    Discover = 'Discover';
    Define = 'Define';
    OnBid = 'On Bid';
    DownSelect = 'Down Select';
    SignedDeal = 'Signed Deal';
}

entity Opportunity {

    key sapOpportunityId  : String;
        sfdcOpportunityId : String;
        opportunityName   : String;
        businessUnit      : String;
        probability       : ProbabilityEnum;
        salesSPOC         : String;
        deliverySPOC      : String;
        expectedStart     : Date;
        expectedEnd       : Date;
        estimatedRevenue  : Decimal(15, 2);
        Stage             : OpportunityStageEnum;
        customerId        : String;
        to_Customer       : Association to one Customer
                                on to_Customer.SAPcustId = $self.customerId;
        to_Project        : Association to many Project
                                on to_Project.oppId = $self.sapOpportunityId;
}


// -------------------- Project --------------------

type ProjectTypeEnum      : String enum {
    FixedPrice = 'Fixed Price';
    TransactionBased = 'Transaction Based';
    FixedMonthly = 'Fixed Monthly';
    PassThru = 'Pass Thru';
    Divine = 'Divine';
}

type ProjectStatusEnum    : String enum {
    Active = 'Active';
    Closed = 'Closed';
    Planned = 'Planned';
}

entity Project {

    key sapPId         : String;
        sfdcPId        : String;
        projectName    : String(256);
        startDate      : Date;
        endDate        : Date;
        gpm            : String;
        projectType    : ProjectTypeEnum;
        oppId          : String;
        status         : ProjectStatusEnum;

        to_Opportunity : Association to one Opportunity
                             on to_Opportunity.sapOpportunityId = $self.oppId;

        to_Demand      : Association to many Demand
                             on to_Demand.sapPId = $self.sapPId;

}

// ----------------------- Demand -------------------------------------

entity Demand {
    key demandId : UUID;
        skill    : String;
        band     : String;
        sapPId   : String;
        quantity : Integer;
}


// -------------------- Employee --------------------

type EmployeeTypeEnum     : String enum {
    FullTime = 'Full Time';
    SubCon = 'Subcon';
    Intern = 'Intern';
    YTJ = 'Yet To Join';
}

type EmployeeStatusEnum   : String enum {
    PreAllocated = 'Pre Allocated';
    Bench = 'Bench';
    Resigned = 'Resigned';
    Allocated = 'Allocated';
}

type GenderEnum           : String enum {
    Male = 'Male';
    Female = 'Female';
    Others = 'Others';
}

type EmployeeBandEnum     : String enum {
    Band1 = 'Vice President';
    Band2 = 'Vice President';
    Band3 = 'Assistant Vice President';
    Band4A_1 = 'Consultant';
    Band4A_2 = 'Management Trainee';
    Band4B_C = 'Assistant Manager/Consultant';

    Band4B_LC = 'Assistant Manager/ Lead Consultant';
    Band4C = 'Manager/Principal Consultant/Project Manager';

    Band4D = 'Senior Manager/Senior Principal Consultant/Senior Project Manager';
    Band5A = 'Process Associate';
    Band5B = 'Senior Associate/Technical Associate';
}


entity Employee {
    key ohrId         : String;
        mailid        : String;
        firstName     : String;
        lastName      : String;
        gender        : GenderEnum;
        employeeType  : EmployeeTypeEnum;
        doj           : Date;
        band          : EmployeeBandEnum;
        role          : String;
        location      : String;
        supervisorOHR : String;
        skills        : String;
        city          : String;
        lwd           : Date;
        status        : EmployeeStatusEnum;
}

//-------------Skills--------------------

entity Skills {
    key id       : UUID;
        name     : String;
        category : String;
}
