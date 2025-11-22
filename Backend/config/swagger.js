const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EMRS PGIMER API',
      version: '1.0.0',
      description: `Electronic Medical Record System for Psychiatry Department - PGIMER, Chandigarh
      
## Authentication

This API uses JWT Bearer tokens for authentication with **Conditional Two-Factor Authentication (2FA)**.

### How to authenticate in Swagger:

This API supports **Conditional 2FA** - OTP verification is only required when enabled by the user.

#### **Login Process:**

**Scenario 1: User has 2FA DISABLED (Default)**

1. **Direct Login**: Use the \`/api/users/login\` endpoint with your email and password
   - You'll receive the JWT token immediately (no OTP required)
   - Response contains \`user\` object and \`token\`

2. **Access Protected Endpoints**:
   - Copy the \`token\` from the login response
   - Click the "Authorize" button (🔓) at the top right
   - Enter your token in the format: \`Bearer YOUR_TOKEN_HERE\`
   - Click "Authorize" and then "Close"
   - Now you can access protected endpoints 🔒

**Scenario 2: User has 2FA ENABLED**

1. **Step 1 - Initial Login**: Use the \`/api/users/login\` endpoint with your email and password
   - You'll receive an OTP via email (valid for 5 minutes)
   - Response will contain \`user_id\` and \`email\`

2. **Step 2 - Verify OTP**: Use the \`/api/users/verify-login-otp\` endpoint with your \`user_id\` and the 6-digit OTP from your email
   - Upon successful verification, you'll receive the JWT token
   - The OTP will be automatically marked as used

3. **Step 3 - Access Protected Endpoints**:
   - Copy the \`token\` from the OTP verification response
   - Click the "Authorize" button (🔓) at the top right
   - Enter your token in the format: \`Bearer YOUR_TOKEN_HERE\`
   - Click "Authorize" and then "Close"
   - Now you can access protected endpoints 🔒

**Managing 2FA Settings:**

Users can enable or disable 2FA from their profile:
- **Enable 2FA**: \`POST /api/users/enable-2fa\` (requires authentication)
- **Disable 2FA**: \`POST /api/users/disable-2fa\` (requires authentication)

#### **Password Reset Process:**

1. **Request Reset**: Use \`/api/users/forgot-password\` with your email
2. **Verify OTP**: Use \`/api/users/verify-otp\` with the token and OTP from email
3. **Reset Password**: Use \`/api/users/reset-password\` with the token and new password

### Token Format:
\`\`\`
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### Security Features:
- ✅ **Email OTP Verification** - 6-digit codes sent to registered email
- ✅ **5-minute OTP expiration** - Enhanced security with time-limited codes
- ✅ **One-time use OTPs** - Codes become invalid after verification
- ✅ **Account status validation** - Only active accounts can login
- ✅ **JWT token authentication** - Secure session management

**Note**: Tokens expire after a certain period. If you get a 401 error, complete the login process again.`,
      contact: {
        name: 'PGIMER Team',
        email: 'support@pgimer.ac.in',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'http://31.97.60.2:2025/api' 
          : `http://localhost:${process.env.PORT || 2025}/api`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from the login response. Format: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            error: {
              type: 'string',
              example: 'Detailed error information (development only)',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            pages: {
              type: 'integer',
              example: 10,
            },
          },
        },
        LoginOTPResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'OTP sent to your email. Please check your inbox.',
            },
            data: {
              type: 'object',
              properties: {
                user_id: {
                  type: 'integer',
                  example: 1,
                  description: 'User ID for OTP verification',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'admin@pgimer.ac.in',
                  description: 'Email where OTP was sent',
                },
                expires_in: {
                  type: 'integer',
                  example: 300,
                  description: 'OTP expiration time in seconds',
                },
              },
            },
          },
        },
        VerifyLoginOTPRequest: {
          type: 'object',
          required: ['user_id', 'otp'],
          properties: {
            user_id: {
              type: 'integer',
              example: 1,
              description: 'User ID from login response',
            },
            otp: {
              type: 'string',
              pattern: '^[0-9]{6}$',
              example: '123456',
              description: '6-digit OTP from email',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 1,
                    },
                    name: {
                      type: 'string',
                      example: 'Dr. Admin User',
                    },
                    role: {
                      type: 'string',
                      enum: ['Psychiatric Welfare Officer', 'Faculty Residents (Junior Resident (JR))', 'Faculty Residents (Senior Resident (SR))', 'System Administrator'],
                      example: 'System Administrator',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'admin@pgimer.ac.in',
                    },
                  },
                },
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  description: 'JWT access token',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
              description: 'Auto-generated user ID',
            },
            name: {
              type: 'string',
              example: 'Dr. Admin User',
              description: 'Full name of the user',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@pgimer.ac.in',
              description: 'User email address',
            },
            role: {
              type: 'string',
              enum: ['Psychiatric Welfare Officer', 'Faculty Residents (Junior Resident (JR))', 'Faculty Residents (Senior Resident (SR))', 'System Administrator'],
              example: 'System Administrator',
              description: 'User role in the system',
            },
            two_factor_enabled: {
              type: 'boolean',
              example: false,
              description: 'Whether 2FA is enabled for this user',
            },
            is_active: {
              type: 'boolean',
              example: true,
              description: 'Whether the user account is active',
            },
            last_login: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-27T10:30:00Z',
              description: 'Last login timestamp',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-01T00:00:00Z',
              description: 'Account creation timestamp',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-27T10:30:00Z',
              description: 'Last update timestamp',
            },
          },
        },
        UserRegistration: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 255,
              example: 'Dr. New User',
              description: 'Full name of the user',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'newuser@pgimer.ac.in',
              description: 'User email address',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'securePassword123',
              description: 'User password (minimum 6 characters)',
            },
            role: {
              type: 'string',
              enum: ['Psychiatric Welfare Officer', 'Faculty Residents (Junior Resident (JR))', 'Faculty Residents (Senior Resident (SR))', 'System Administrator'],
              example: 'Faculty Residents (Junior Resident (JR))',
              description: 'User role in the system',
            },
          },
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@pgimer.ac.in',
              description: 'User email address',
            },
            password: {
              type: 'string',
              example: 'password123',
              description: 'User password',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'User Management',
        description: 'User profile management',
      },
      {
        name: 'Patient Management',
        description: 'Patient registration and management',
      },
      {
        name: 'Walk-in Clinical Proforma',
        description: 'Clinical assessment and documentation (Faculty Residents)',
      },
      {
        name: 'Out Patient Intake Record',
        description: 'ADL file management for complex cases',
      },
      {
        name: 'Prescriptions',
        description: 'Prescription management',
      },
    ],
  },
  apis: [
    './routes/userRoutes.js',
    './routes/patientRoutes.js',
    './routes/clinicalRoutes.js',
    './routes/adlRoutes.js',
    './routes/prescriptionRoutes.js',
    // Excluded: './routes/outpatientRoutes.js' - Not used in frontend
    // Note: Removed endpoints (not in frontend):
    // - ADL: /adl-files/:id/retrieve, /adl-files/:id/return, /adl-files/:id/archive, /adl-files/to-retrieve, /adl-files/adl/:adl_no
    // - Patients: /patients/today, /patients/complex
    // - Clinical: /clinical-proformas/severity-stats, /clinical-proformas/room/:room_no
  ],
};

const specs = swaggerJsdoc(options);

// Swagger UI configuration
const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'EMRS PGIMER API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    tryItOutEnabled: true,
    validatorUrl: null,
    deepLinking: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    defaultModelRendering: 'example',
    maxDisplayedTags: 10,
    showCommonExtensions: true,
    requestInterceptor: (req) => {
      // Ensure all requests use HTTP
      if (req.url && req.url.startsWith('https://')) {
        req.url = req.url.replace('https://', 'http://');
      }
      return req;
    },
    responseInterceptor: (res) => {
      // Ensure all responses use HTTP
      if (res.url && res.url.startsWith('https://')) {
        res.url = res.url.replace('https://', 'http://');
      }
      return res;
    }
  }
};

module.exports = { swaggerSpecs: specs, swaggerUiOptions };
