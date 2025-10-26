# Resource Allocation System v7.0

A comprehensive Resource Allocation and Project Lifecycle Management System built with SAP CAP.

## 🚀 Features

### Core Functionality
- **Project Management**: Complete project lifecycle from opportunity to closure
- **Resource Allocation**: Smart employee-project matching based on skills and availability
- **Employee Management**: Comprehensive employee lifecycle with status tracking
- **Automated Workflows**: Auto-start/close projects and status updates
- **Reporting**: Flexible client reports and analytics

### Key Capabilities
- ✅ **16 Entities** - Complete data model
- ✅ **4 Business Actions** - State management and workflows
- ✅ **2 Business Functions** - Employee matching and reporting
- ✅ **3 Scheduled Jobs** - Automated business processes
- ✅ **4 Business Views** - Rich reporting capabilities
- ✅ **Audit Trail** - Complete change tracking

## 📋 Prerequisites

- Node.js 18+
- SAP CAP SDK 7.0+
- SQLite (for development)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PMO
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Load initial data**
   ```bash
   npm run load-data
   ```

4. **Start the application**
   ```bash
   npm start
   ```

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Database Schema

### Master Data Entities
- **Vertical** - Business verticals
- **ProjectType** - Project type definitions
- **BusinessType** - Business type classifications
- **Skill** - Skills catalog
- **EntityStatus** - Status definitions

### Core Entities
- **Customer** - Customer information
- **Opportunity** - Sales opportunities
- **Project** - Project management
- **Employee** - Employee master data
- **Assignment** - Employee-project assignments

### Audit Entities
- **AssignmentHistory** - Assignment change tracking
- **EmployeeStatusLog** - Employee status tracking
- **Notification** - System notifications

## 🔄 Business Processes

### Project Lifecycle
1. **Opportunity Creation** → **Project Planning** → **Resource Allocation**
2. **Auto-Start** (on start date) → **Active Development** → **Auto-Close** (on end date)

### Employee Lifecycle
1. **Hiring** → **Bench** → **Pre-Allocated** → **Allocated** → **Resigned**

### Automated Jobs
- **Daily 1:00 AM**: Auto-start projects
- **Daily 2:00 AM**: Auto-close projects
- **Weekly Sunday 3:00 AM**: Cleanup old notifications

## 📈 API Endpoints

### Master Data
- `GET /resource-allocation/Verticals`
- `GET /resource-allocation/ProjectTypes`
- `GET /resource-allocation/BusinessTypes`
- `GET /resource-allocation/Skills`

### Core Operations
- `GET /resource-allocation/Projects`
- `GET /resource-allocation/Employees`
- `GET /resource-allocation/Assignments`

### Business Actions
- `POST /resource-allocation/addOfficialPID`
- `POST /resource-allocation/startAssignment`
- `POST /resource-allocation/closeAssignment`
- `POST /resource-allocation/resignEmployee`

### Business Functions
- `GET /resource-allocation/getEligibleEmployees`
- `GET /resource-allocation/generateClientReport`

## 🔧 Configuration

### Environment Variables
```bash
# Database configuration
DB_KIND=sqlite
DB_DATABASE=db.sqlite

# Server configuration
PORT=4004
```

### Scheduled Jobs
Jobs are automatically initialized on server startup:
- **Auto-start projects**: Daily at 1:00 AM UTC
- **Auto-close projects**: Daily at 2:00 AM UTC
- **Cleanup notifications**: Weekly Sunday at 3:00 AM UTC

## 📝 Usage Examples

### Create a Project
```javascript
const project = await INSERT.into('Projects').entries({
    projectId: cds.utils.uuid(),
    tempProjectKey: 'TEMP001',
    name: 'Analytics Dashboard',
    projectType: 'Data Analytics',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    status: 'Planned'
});
```

### Assign Employee to Project
```javascript
const assignment = await INSERT.into('Assignments').entries({
    assignmentId: cds.utils.uuid(),
    employee_ohrId: 'EMP001',
    project_projectId: projectId,
    state: 'Pending',
    plannedStartDate: '2025-01-01',
    plannedEndDate: '2025-06-30'
});
```

### Generate Client Report
```javascript
const report = await SELECT.from('generateClientReport')
    .where({ projectId: projectId })
    .columns('projectReference', 'employees');
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Cloud
```bash
npm run deploy
```

## 📊 Monitoring

### Health Checks
- Database connectivity
- Scheduled job status
- Service availability

### Logging
- Application logs
- Error tracking
- Performance metrics

## 🔒 Security

### Authentication
- User authentication
- Role-based access
- API security

### Data Protection
- Audit trail
- Data encryption
- Privacy compliance

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Database Schema](docs/schema.md)
- [Deployment Guide](docs/deployment.md)
- [Testing Guide](docs/testing.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Version 7.0** - Ready for Production! 🚀