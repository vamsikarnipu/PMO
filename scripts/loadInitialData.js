const cds = require('@sap/cds');

async function loadInitialData() {
    console.log('Loading initial data...\n');
    const db = await cds.connect.to('db');
    
    try {
        // 1. EntityStatus
        console.log('Loading EntityStatus...');
        await INSERT.into('EntityStatus').entries([
            { statusId: 'BENCH', name: 'Bench', description: 'Employee available or assigned but project not started' },
            { statusId: 'PRE_ALLOCATED', name: 'Pre-Allocated', description: 'Working on temp project without official PID' },
            { statusId: 'ALLOCATED', name: 'Allocated', description: 'Working on project with official PID' },
            { statusId: 'RESIGNED', name: 'Resigned', description: 'No longer with company' }
        ]);
        console.log('✓ EntityStatus loaded\n');

        // 2. Verticals
        console.log('Loading Verticals...');
        await INSERT.into('Vertical').entries([
            { verticalId: cds.utils.uuid(), verticalName: 'Healthcare', description: 'Healthcare and Life Sciences' },
            { verticalId: cds.utils.uuid(), verticalName: 'Finance', description: 'Banking and Financial Services' },
            { verticalId: cds.utils.uuid(), verticalName: 'Technology', description: 'Technology and IT Services' },
            { verticalId: cds.utils.uuid(), verticalName: 'Retail', description: 'Retail and E-commerce' },
            { verticalId: cds.utils.uuid(), verticalName: 'Manufacturing', description: 'Manufacturing and Industrial' }
        ]);
        console.log('✓ Verticals loaded\n');

        // 3. ProjectTypes
        console.log('Loading ProjectTypes...');
        await INSERT.into('ProjectType').entries([
            { projectTypeId: cds.utils.uuid(), typeName: 'Application Development', description: 'Custom application development' },
            { projectTypeId: cds.utils.uuid(), typeName: 'Application Maintenance', description: 'Application support and maintenance' },
            { projectTypeId: cds.utils.uuid(), typeName: 'Data Analytics', description: 'Data analytics and business intelligence' },
            { projectTypeId: cds.utils.uuid(), typeName: 'Cloud Migration', description: 'Cloud migration and modernization' }
        ]);
        console.log('✓ ProjectTypes loaded\n');

        // 4. BusinessTypes
        console.log('Loading BusinessTypes...');
        await INSERT.into('BusinessType').entries([
            { businessTypeId: cds.utils.uuid(), typeName: 'New Business', description: 'New customer acquisition' },
            { businessTypeId: cds.utils.uuid(), typeName: 'Renewal', description: 'Existing customer renewal' },
            { businessTypeId: cds.utils.uuid(), typeName: 'Expansion', description: 'Expansion with existing customer' },
            { businessTypeId: cds.utils.uuid(), typeName: 'Upsell', description: 'Upselling to existing customer' }
        ]);
        console.log('✓ BusinessTypes loaded\n');

        // 5. Skills
        console.log('Loading Skills...');
        await INSERT.into('Skill').entries([
            { skillId: cds.utils.uuid(), skillName: 'Python', category: 'Technical', description: 'Python programming' },
            { skillId: cds.utils.uuid(), skillName: 'Java', category: 'Technical', description: 'Java programming' },
            { skillId: cds.utils.uuid(), skillName: 'JavaScript', category: 'Technical', description: 'JavaScript programming' },
            { skillId: cds.utils.uuid(), skillName: 'SQL', category: 'Technical', description: 'SQL database' },
            { skillId: cds.utils.uuid(), skillName: 'Machine Learning', category: 'Technical', description: 'ML and AI' },
            { skillId: cds.utils.uuid(), skillName: 'Project Management', category: 'Functional', description: 'Project management skills' },
            { skillId: cds.utils.uuid(), skillName: 'Communication', category: 'Soft Skill', description: 'Communication and presentation' },
            { skillId: cds.utils.uuid(), skillName: 'Leadership', category: 'Soft Skill', description: 'Team leadership and mentoring' }
        ]);
        console.log('✓ Skills loaded\n');

        console.log('========================================');
        console.log('✓ ALL INITIAL DATA LOADED SUCCESSFULLY');
        console.log('========================================\n');
    } catch (error) {
        console.error('Error loading initial data:', error);
        throw error;
    }
}

if (require.main === module) {
    loadInitialData()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = { loadInitialData };
