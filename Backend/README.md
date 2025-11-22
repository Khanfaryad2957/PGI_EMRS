# EMRS PGIMER Backend API

Electronic Medical Record System for Psychiatry Department - Postgraduate Institute of Medical Education & Research, Chandigarh

## Overview

This is a comprehensive backend API system designed for managing electronic medical records in a psychiatry department. The system supports three main user roles: Admin, MWO (Medical Social Welfare Officer), and JR/SR Doctors, with integrated registration and clinical assessment workflows.

## Features

### Core Functionality
- **User Management**: Role-based authentication and authorization
- **Patient Registration**: Centralized patient management with unique identifiers
- **Outpatient Records**: Comprehensive demographic and social data collection (MWO)
- **Clinical Assessment**: Detailed psychiatric evaluation and documentation (JR/SR)
- **ADL File Management**: Specialized file handling for complex cases
- **File Tracking**: Complete audit trail for physical file movements

### Key Workflows
1. **Patient Registration**: CR Number and PSY Number generation
2. **MWO Assessment**: Demographic data and social welfare information
3. **Clinical Evaluation**: Psychiatric assessment and case classification
4. **File Management**: ADL file creation for complex cases with movement tracking

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Logging**: Custom logging system

## Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd emrs-pgi-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=postgresql://username:password@host:port/database
   DB_PORT=5432
   DB_NAME=pgimer
   DB_USER=your_username
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   
   # Application Configuration
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**
   - Create PostgreSQL database named `pgimer`
   - Run the schema SQL provided in the database setup
   - Ensure proper user permissions

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

### Access Documentation
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

### Base URL
```
http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Patient Management
- `GET /api/patients` - Get all patients (paginated)
- `POST /api/patients` - Register new patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/search?q=term` - Search patients

### Outpatient Records (MWO)
- `GET /api/outpatient-records` - Get all records
- `POST /api/outpatient-records` - Create new record
- `GET /api/outpatient-records/:id` - Get record by ID
- `PUT /api/outpatient-records/:id` - Update record

### Walk-in Clinical Proforma (JR/SR)
- `GET /api/clinical-proformas` - Get all proformas
- `POST /api/clinical-proformas` - Create new proforma
- `GET /api/clinical-proformas/:id` - Get proforma by ID
- `PUT /api/clinical-proformas/:id` - Update proforma

### ADL Files
- `GET /api/adl-files` - Get all ADL files
- `GET /api/adl-files/:id` - Get ADL file by ID
- `POST /api/adl-files/:id/retrieve` - Retrieve file
- `POST /api/adl-files/:id/return` - Return file to storage

## User Roles & Permissions

### Admin
- Full system access
- User management
- System statistics
- All CRUD operations

### MWO (Medical Social Welfare Officer)
- Patient registration
- Outpatient record management
- Demographic data collection
- Social welfare assessment

### JR/SR (Junior/Senior Resident Doctors)
- Clinical assessment
- Psychiatric evaluation
- Case classification (simple/complex)
- ADL file creation for complex cases
- Treatment prescription

## Database Schema

### Core Tables
- `users` - System users with role-based access
- `patients` - Patient master data with unique identifiers
- `outpatient_record` - Demographic and social data (MWO)
- `clinical_proforma` - Clinical assessment data (JR/SR)
- `adl_files` - Specialized file management for complex cases
- `patient_visits` - Visit tracking and history

### Key Relationships
- Patients can have multiple outpatient records
- Patients can have multiple clinical proformas
- Complex cases automatically create ADL files
- File movements are tracked with user attribution

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Granular permission system
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin access
- **Helmet Security**: HTTP security headers

## Error Handling

- Comprehensive error handling middleware
- Structured error responses
- Development vs production error details
- Logging of all errors and requests

## Logging

- Request/response logging
- Error logging
- User activity tracking
- File access logging
- Custom application events

## Development

### Project Structure
```
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Data models
├── routes/          # API routes
├── utils/           # Utility functions
├── logs/            # Application logs
├── server.js        # Main application file
└── package.json     # Dependencies and scripts
```

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run test suite
```

## Deployment

### Production Considerations
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up SSL/TLS certificates
- Configure database connection pooling
- Set up monitoring and logging
- Configure backup strategies

### Environment Variables
Ensure all required environment variables are set:
- Database connection details
- JWT configuration
- Security settings
- Logging configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@pgimer.ac.in
- Documentation: `/api-docs`
- Health Check: `/health`

## Version History

- **v1.0.0** - Initial release with core functionality
  - User management and authentication
  - Patient registration and management
  - Outpatient records (MWO)
  - Clinical proforma (JR/SR)
  - ADL file management
  - Complete API documentation
