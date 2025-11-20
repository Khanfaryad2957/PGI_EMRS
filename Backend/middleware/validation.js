const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['Admin', 'Faculty', 'Resident', 'Psychiatric Welfare Officer'])
    .withMessage('Role must be one of: Admin, Faculty, Resident, Psychiatric Welfare Officer'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Patient validation rules (basic patient info only)
const validatePatient = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('sex')
    .optional()
    .isIn(['M', 'F', 'Other'])
    .withMessage('Sex must be M, F, or Other'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('assigned_room')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Room number must not exceed 10 characters'),
  body('cr_no')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('CR number must not exceed 50 characters'),
  body('psy_no')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('PSY number must not exceed 50 characters'),
  handleValidationErrors
];

// Comprehensive patient registration validation (includes personal information)
const validatePatientRegistration = [
  // Basic patient information
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('sex')
    .optional()
    .isIn(['M', 'F', 'Other'])
    .withMessage('Sex must be M, F, or Other'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('assigned_room')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Room number must not exceed 10 characters'),
  body('cr_no')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('CR number must not exceed 50 characters'),
  body('psy_no')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('PSY number must not exceed 50 characters'),
  
  // Additional fields for outpatient record
  body('seen_in_walk_in_on')
    .optional()
    .isISO8601()
    .withMessage('Seen in walk-in date must be a valid date'),
  body('worked_up_on')
    .optional()
    .isISO8601()
    .withMessage('Worked up date must be a valid date'),
  body('special_clinic_no')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Special clinic number must not exceed 50 characters'),
  
  // Personal Information (detailed)
  body('age_group')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Age group must not exceed 20 characters'),
  body('marital_status')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Marital status must not exceed 20 characters'),
  body('year_of_marriage')
    .optional({ nullable: true })
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Year of marriage must be a valid year'),
  body('no_of_children')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 20 })
    .withMessage('Number of children must be between 0 and 20'),
  body('no_of_children_male')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 20 })
    .withMessage('Number of male children must be between 0 and 20'),
  body('no_of_children_female')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 20 })
    .withMessage('Number of female children must be between 0 and 20'),
  
  // Occupation & Education
  body('occupation')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Occupation must not exceed 50 characters'),
  body('actual_occupation')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Actual occupation must not exceed 100 characters'),
  body('education_level')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Education level must not exceed 50 characters'),
  body('completed_years_of_education')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 30 })
    .withMessage('Completed years of education must be between 0 and 30'),
  
  // Financial Information
  body('patient_income')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Patient income must be a positive number'),
  body('family_income')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Family income must be a positive number'),
  
  // Family Information
  body('religion')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Religion must not exceed 20 characters'),
  body('family_type')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Family type must not exceed 20 characters'),
  body('locality')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Locality must not exceed 20 characters'),
  body('head_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Head name must not exceed 255 characters'),
  body('head_age')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 150 })
    .withMessage('Head age must be between 0 and 150'),
  body('head_relationship')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Head relationship must not exceed 50 characters'),
  body('head_education')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Head education must not exceed 50 characters'),
  body('head_occupation')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Head occupation must not exceed 100 characters'),
  body('head_income')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Head income must be a positive number'),
  
  // Referral & Mobility
  body('distance_from_hospital')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Distance from hospital must not exceed 100 characters'),
  body('mobility')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Mobility must not exceed 100 characters'),
  body('referred_by')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Referred by must not exceed 100 characters'),
  body('exact_source')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Exact source must not exceed 255 characters'),
  
  // Quick Entry Additional Fields
  body('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department must not exceed 100 characters'),
  body('unit_consit')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Unit/Consit must not exceed 100 characters'),
  body('room_no')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Room number must not exceed 20 characters'),
  body('serial_no')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Serial number must not exceed 50 characters'),
  body('file_no')
    .optional()
    .isLength({ max: 50 })
    .withMessage('File number must not exceed 50 characters'),
  body('unit_days')
    .optional({ nullable: true })
    .custom((value) => {
      // Allow null, undefined, or empty string
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If provided, must be one of the allowed values (case-insensitive)
      const allowedValues = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const lowerValue = String(value).toLowerCase();
      if (!allowedValues.includes(lowerValue)) {
        throw new Error('Unit days must be one of: Mon, Tue, Wed, Thu, Fri, Sat');
      }
      return true;
    }),
  
  // Address Information
  body('address_line')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Address line 1 must not exceed 255 characters'),
  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  body('district')
    .optional()
    .isLength({ max: 100 })
    .withMessage('District must not exceed 100 characters'),
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City/Town/Village must not exceed 100 characters'),
  body('pin_code')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // If value is null, undefined, or empty string, skip validation
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If value is provided, it must be exactly 6 digits
      const pinCodeStr = String(value);
      return pinCodeStr.length === 6 && /^\d+$/.test(pinCodeStr);
    })
    .withMessage('Pin code must be exactly 6 digits'),
  
  // Present Address Information
  body('present_address_line')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Present address line 1 must not exceed 255 characters'),
  body('present_country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Present country must not exceed 100 characters'),
  body('present_state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Present state must not exceed 100 characters'),
  body('present_district')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Present district must not exceed 100 characters'),
  body('present_city_town_village')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Present city/town/village must not exceed 100 characters'),
  body('present_pin_code')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // If value is null, undefined, or empty string, skip validation
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If value is provided, it must be exactly 6 digits
      const pinCodeStr = String(value);
      return pinCodeStr.length === 6 && /^\d+$/.test(pinCodeStr);
    })
    .withMessage('Present pin code must be exactly 6 digits'),
  
  // Permanent Address Information
  body('permanent_address_line_1')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Permanent address line 1 must not exceed 255 characters'),
  body('permanent_country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Permanent country must not exceed 100 characters'),
  body('permanent_state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Permanent state must not exceed 100 characters'),
  body('permanent_district')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Permanent district must not exceed 100 characters'),
  body('permanent_city_town_village')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Permanent city/town/village must not exceed 100 characters'),
  body('permanent_pin_code')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // If value is null, undefined, or empty string, skip validation
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If value is provided, it must be exactly 6 digits
      const pinCodeStr = String(value);
      return pinCodeStr.length === 6 && /^\d+$/.test(pinCodeStr);
    })
    .withMessage('Permanent pin code must be exactly 6 digits'),
  body('local_address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Local address must not exceed 500 characters'),
  body('school_college_office')
    .optional()
    .isLength({ max: 255 })
    .withMessage('School/College/Office must not exceed 255 characters'),
  body('contact_number')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Contact number must not exceed 20 characters'),
  
  // Additional fields validation
  body('category')
    .optional()
    .isIn(['GEN', 'SC', 'ST', 'OBC', 'EWS'])
    .withMessage('Category must be one of: GEN, SC, ST, OBC, EWS'),
    body('assigned_doctor_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Assigned doctor ID must be a valid integer'),
  
  
  handleValidationErrors
];



// Clinical proforma validation
const validateClinicalProforma = [
  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),
  body('visit_date')
    .isISO8601()
    .withMessage('Valid visit date is required'),
  body('visit_type')
    .optional()
    .isIn(['first_visit', 'follow_up'])
    .withMessage('Visit type must be first_visit or follow_up'),
  body('room_no')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Room number must not exceed 10 characters'),
  body('doctor_decision')
    .optional()
    .isIn(['simple_case', 'complex_case'])
    .withMessage('Doctor decision must be simple_case or complex_case'),
  body('case_severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe', 'critical'])
    .withMessage('Case severity must be mild, moderate, severe, or critical'),
  body('assigned_doctor')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Assigned doctor name must not exceed 255 characters'),
  handleValidationErrors
];

// ADL file validation
const validateADLFile = [
  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),
  body('clinical_proforma_id')
    .isInt({ min: 1 })
    .withMessage('Valid clinical proforma ID is required'),
  body('file_created_date')
    .isISO8601()
    .withMessage('Valid file created date is required'),
  body('physical_file_location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('File location must not exceed 100 characters'),
  handleValidationErrors
];

// ID parameter validation (integer only)
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid integer ID is required'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePatient,
  validatePatientRegistration,
  validateClinicalProforma,
  validateADLFile,
  validateId,
  validatePagination
};
