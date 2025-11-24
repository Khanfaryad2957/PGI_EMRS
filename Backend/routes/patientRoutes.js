const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patientController');
const PatientFileController = require('../controllers/patientFileController');
const { authenticateToken, requireMWOOrDoctor, requireAdmin, authorizeRoles } = require('../middleware/auth');
const {
  validatePatient,
  validatePatientRegistration,
  validateId,
  validatePagination
} = require('../middleware/validation');
const { handleUpload } = require('../middleware/upload');

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - name
 *         - sex
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated patient ID
 *         cr_no:
 *           type: string
 *           description: Central Registration Number
 *         psy_no:
 *           type: string
 *           description: Psychiatry General Number
 *         special_clinic_no:
 *           type: string
 *           description: Special Clinic Number
 *         adl_no:
 *           type: string
 *           description: ADL File Number (for complex cases)
 *         name:
 *           type: string
 *           description: Patient's full name
 *         sex:
 *           type: string
 *           enum: [M, F, Other]
 *           description: Patient's sex (radio button selection)
 *         age:
 *           type: integer
 *           description: Patient's actual age
 *         has_adl_file:
 *           type: boolean
 *           description: Whether patient has an ADL file. **Automatically set to `true` when a complex case clinical proforma is created with an ADL file.**
 *         file_status:
 *           type: string
 *           enum: [none, created, stored, retrieved, active]
 *           description: Current file status
 *         assigned_room:
 *           type: string
 *           description: Assigned room number
 *         case_complexity:
 *           type: string
 *           enum: [simple, complex]
 *           description: Case complexity level. **Automatically set to `'complex'` when a complex case clinical proforma is created with an ADL file.**
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Patient registration timestamp
 *     
 *     PatientCreate:
 *       type: object
 *       required:
 *         - name
 *         - sex
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *         sex:
 *           type: string
 *           enum: [M, F, Other]
 *         age:
 *           type: integer
 *           minimum: 0
 *           maximum: 150
 *         assigned_room:
 *           type: string
 *           maxLength: 10
 *     
 *     PatientUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *         sex:
 *           type: string
 *           enum: [M, F, Other]
 *         age:
 *           type: integer
 *           minimum: 0
 *           maximum: 150
 *         assigned_room:
 *           type: string
 *           maxLength: 10
 *         case_complexity:
 *           type: string
 *           enum: [simple, complex]
 *         file_status:
 *           type: string
 *           enum: [none, created, stored, retrieved, active]
 *         has_adl_file:
 *           type: boolean
 */

// Protected routes (require authentication)
/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientCreate'
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     patient:
 *                       $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Basic patient creation (for doctors)
router.post('/', authenticateToken, requireMWOOrDoctor, validatePatient, PatientController.createPatient);

/**
 * @swagger
 * /api/patients/register-complete:
 *   post:
 *     summary: Register a new patient with complete personal information (Psychiatric Welfare Officer only)
 *     description: This endpoint allows Psychiatric Welfare Officer users to register a patient with both basic patient information and detailed personal information in a single request, eliminating duplicate "Personal Information" sections.
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sex
 *             properties:
 *               # Basic Patient Information
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 example: "John Doe"
 *                 description: Patient's full name
 *               sex:
 *                 type: string
 *                 enum: [M, F, Other]
 *                 example: "M"
 *                 description: Patient's sex (radio button selection)
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 150
 *                 example: 35
 *                 description: Patient's actual age
 *               assigned_room:
 *                 type: string
 *                 maxLength: 10
 *                 example: "Ward A-101"
 *                 description: Assigned room number
 *               cr_no:
 *                 type: string
 *                 maxLength: 50
 *                 example: "CR2024000001"
 *                 description: Central Registration Number
 *               psy_no:
 *                 type: string
 *                 maxLength: 50
 *                 example: "PSY2024000001"
 *                 description: Psychiatry General Number
 *               
 *               # Personal Information
 *               age_group:
 *                 type: string
 *                 maxLength: 20
 *                 example: "30-40"
 *                 description: Age group category
 *               marital_status:
 *                 type: string
 *                 maxLength: 20
 *                 example: "Married"
 *                 description: Marital status
 *               year_of_marriage:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 2024
 *                 example: 2015
 *                 description: Year of marriage
 *               no_of_children:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 20
 *                 example: 2
 *                 description: Number of children
 *               
 *               # Occupation & Education
 *               occupation:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Engineer"
 *                 description: Primary occupation
 *               actual_occupation:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Software Engineer at Tech Corp"
 *                 description: Detailed occupation description
 *               education_level:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Graduate"
 *                 description: Education level
 *               completed_years_of_education:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 30
 *                 example: 16
 *                 description: Years of education completed
 *               
 *               # Financial Information
 *               patient_income:
 *                 type: number
 *                 format: decimal
 *                 example: 50000.00
 *                 description: Patient's monthly income
 *               family_income:
 *                 type: number
 *                 format: decimal
 *                 example: 75000.00
 *                 description: Family's monthly income
 *               
 *               # Family Information
 *               religion:
 *                 type: string
 *                 maxLength: 20
 *                 example: "Hindu"
 *                 description: Religion
 *               family_type:
 *                 type: string
 *                 maxLength: 20
 *                 example: "Nuclear"
 *                 description: Type of family
 *               locality:
 *                 type: string
 *                 maxLength: 20
 *                 example: "Urban"
 *                 description: Locality type
 *               head_name:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Robert Doe"
 *                 description: Family head name
 *               head_age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 150
 *                 example: 60
 *                 description: Family head age
 *               head_relationship:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Father"
 *                 description: Relationship to family head
 *               head_education:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Post Graduate"
 *                 description: Family head education
 *               head_occupation:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Retired Government Officer"
 *                 description: Family head occupation
 *               head_income:
 *                 type: number
 *                 format: decimal
 *                 example: 25000.00
 *                 description: Family head income
 *               
 *               # Referral & Mobility
 *               distance_from_hospital:
 *                 type: string
 *                 maxLength: 100
 *                 example: "15 km"
 *                 description: Distance from hospital
 *               mobility:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Own Vehicle"
 *                 description: Mode of transportation
 *               referred_by:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Dr. Smith"
 *                 description: Who referred the patient
 *               exact_source:
 *                 type: string
 *                 maxLength: 255
 *                 example: "General Hospital Emergency"
 *                 description: Exact source of referral
 *               
 *               # Contact Information
 *               present_address:
 *                 type: string
 *                 maxLength: 500
 *                 example: "123 Main Street, City, State"
 *                 description: Present address
 *               permanent_address:
 *                 type: string
 *                 maxLength: 500
 *                 example: "456 Village Road, District, State"
 *                 description: Permanent address
 *               local_address:
 *                 type: string
 *                 maxLength: 500
 *                 example: "789 Local Street, Area, City"
 *                 description: Local address
 *               school_college_office:
 *                 type: string
 *                 maxLength: 255
 *                 example: "ABC University"
 *                 description: School/College/Office name
 *               contact_number:
 *                 type: string
 *                 maxLength: 20
 *                 example: "+91-9876543210"
 *                 description: Contact number
 *     responses:
 *       201:
 *         description: Patient registered successfully with complete information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Patient registered successfully with complete information"
 *                 data:
 *                   type: object
 *                   properties:
 *                     patient:
 *                       $ref: '#/components/schemas/Patient'
 *                     outpatientRecord:
 *                       $ref: '#/components/schemas/OutpatientRecord'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Psychiatric Welfare Officer access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Comprehensive patient registration with personal information (for Psychiatric Welfare Officer)
router.post('/register-complete', authenticateToken, authorizeRoles('Psychiatric Welfare Officer', 'Faculty', 'Resident', 'Admin'), validatePatientRegistration, PatientController.registerPatientWithDetails);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients with pagination and filters
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of patients per page
 *       - in: query
 *         name: sex
 *         schema:
 *           type: string
 *           enum: [M, F, Other]
 *         description: Filter by sex
 *       - in: query
 *         name: case_complexity
 *         schema:
 *           type: string
 *           enum: [simple, complex]
 *         description: Filter by case complexity
 *       - in: query
 *         name: has_adl_file
 *         schema:
 *           type: boolean
 *         description: Filter by ADL file status
 *       - in: query
 *         name: file_status
 *         schema:
 *           type: string
 *           enum: [none, created, stored, retrieved, active]
 *         description: Filter by file status
 *       - in: query
 *         name: assigned_room
 *         schema:
 *           type: string
 *         description: Filter by assigned room
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: When provided (YYYY-MM-DD), returns patients registered on that date by Psychiatric Welfare Officer. For Faculty/Resident, only patients assigned to the logged-in doctor are returned. Admin sees all.
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Allow Admin to access patient list as well
router.get('/', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validatePagination, PatientController.getAllPatients);

/**
 * @swagger
 * /api/patients/search:
 *   get:
 *     summary: Search patients by name or number
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search term (name, CR number, PSY number, or ADL number)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of patients per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search term too short
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/search', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.searchPatients);

/**
 * @swagger
 * /api/patients/stats:
 *   get:
 *     summary: Get patient statistics
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.getPatientStats);

router.get('/age-distribution', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.getAgeDistribution);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientById);

// Get visit count for a patient
router.get('/:id/visits/count', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientVisitCount);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update patient information
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientUpdate'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, handleUpload, PatientController.updatePatient);

/**
 * @swagger
 * /api/patients/{patient_id}/visits/complete:
 *   post:
 *     summary: Mark patient visit as completed
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visit_date:
 *                 type: string
 *                 format: date
 *                 description: Visit date (optional, defaults to today)
 *     responses:
 *       200:
 *         description: Visit marked as completed successfully
 *       400:
 *         description: Invalid patient ID
 *       404:
 *         description: Visit not found
 *       500:
 *         description: Server error
 */
router.post('/:id/visits/complete', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.markVisitCompleted);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete patient (Admin only)
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       400:
 *         description: Cannot delete patient with existing records
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, requireAdmin, validateId, PatientController.deletePatient);

/**
 * @swagger
 * /api/patients/{id}/profile:
 *   get:
 *     summary: Get complete patient profile with all related records
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Complete patient profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id/profile', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientProfile);

/**
 * @swagger
 * /api/patients/{id}/visits:
 *   get:
 *     summary: Get patient's visit history
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Visit history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id/visits', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientVisitHistory);

/**
 * @swagger
 * /api/patients/{id}/clinical-records:
 *   get:
 *     summary: Get patient's clinical records
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Clinical records retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id/clinical-records', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientClinicalRecords);

/**
 * @swagger
 * /api/patients/{id}/adl-files:
 *   get:
 *     summary: Get patient's ADL files
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: ADL files retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id/adl-files', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientADLFiles);

/**
 * @swagger
 * /api/patients/assign:
 *   post:
 *     summary: Assign patient to Psychiatric Welfare Officer (Psychiatric Welfare Officer/Admin only)
 *     description: Assign a patient to a specific Psychiatric Welfare Officer for tracking purposes
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - assigned_to
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 description: Patient ID to assign
 *                 example: 1
 *               assigned_to:
 *                 type: integer
 *                 description: Psychiatric Welfare Officer user ID to assign patient to
 *                 example: 5
 *     responses:
 *       200:
 *         description: Patient assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Patient assigned successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     patient:
 *                       $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Validation error or invalid assignment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Psychiatric Welfare Officer or Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Patient or Psychiatric Welfare Officer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/assign', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.assignPatient);

// Routes for finding patients by specific numbers
/**
 * @swagger
 * /api/patients/cr/{cr_no}:
 *   get:
 *     summary: Get patient by CR number
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cr_no
 *         required: true
 *         schema:
 *           type: string
 *         description: Central Registration Number
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/cr/:cr_no', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.getPatientByCRNo);

// Endpoint not used in frontend - Swagger docs removed
router.get('/psy/:psy_no', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.getPatientByPSYNo);

// Endpoint not used in frontend - Swagger docs removed
router.get('/adl/:adl_no', authenticateToken,  PatientController.getPatientByADLNo);

// Duplicate /stats endpoint - using the one at line 537 with proper Swagger docs
router.get('/stats', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.getPatientStats);

/**
 * @swagger
 * /api/patients/{id}/files:
 *   post:
 *     summary: Upload files for a patient
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of files to upload (max 20 files, 10MB each)
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       400:
 *         description: Bad request (no files or invalid file type)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.post('/:id/files', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, handleUpload, PatientController.uploadPatientFiles);

/**
 * @swagger
 * /api/patients/{id}/files:
 *   get:
 *     summary: Get all files for a patient
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id/files', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientFiles);

/**
 * @swagger
 * /api/patients/{id}/files/{filename}:
 *   delete:
 *     summary: Delete a file for a patient
 *     tags: [Patient Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient or file not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/files/:filename', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.deletePatientFile);

/**
 * @swagger
 * /api/patients/files/create:
 *   post:
 *     summary: Upload files for a patient (create new record)
 *     tags: [Patient Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *             properties:
 *               patient_id:
 *                 type: integer
 *               attachments[]:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Patient not found
 */
router.post('/files/create', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), handleUpload, PatientFileController.createPatientFiles);

/**
 * @swagger
 * /api/patients/files/update/{patient_id}:
 *   put:
 *     summary: Update patient files (add/remove)
 *     tags: [Patient Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               attachments[]:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               files_to_remove:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Files updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Patient not found
 */
router.put('/files/update/:patient_id', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, handleUpload, PatientFileController.updatePatientFiles);

/**
 * @swagger
 * /api/patients/files/{patient_id}:
 *   get:
 *     summary: Get patient files
 *     tags: [Patient Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient files retrieved successfully
 *       404:
 *         description: Patient not found
 */
router.get('/files/:patient_id', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientFileController.getPatientFiles);

/**
 * @swagger
 * /api/patients/files/delete/{patient_id}/{file_path}:
 *   delete:
 *     summary: Delete a specific patient file
 *     tags: [Patient Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: file_path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File or patient not found
 */
router.delete('/files/delete/:patient_id/:file_path', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientFileController.deletePatientFile);

module.exports = router;
