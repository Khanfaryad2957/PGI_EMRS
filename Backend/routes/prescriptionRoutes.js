const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, param } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     PrescriptionItem:
 *       type: object
 *       required:
 *         - medicine
 *       properties:
 *         medicine:
 *           type: string
 *           description: Medicine name (required)
 *         dosage:
 *           type: string
 *           description: Dosage (e.g., "650mg", "1-0-1")
 *         when_to_take:
 *           type: string
 *           description: When to take medication (e.g., "After food", "Before food")
 *           example: "After food"
 *         when:
 *           type: string
 *           description: Alias for when_to_take (for backward compatibility)
 *         frequency:
 *           type: string
 *           description: Frequency (e.g., "2 times", "Twice Daily")
 *         duration:
 *           type: string
 *           description: Duration (e.g., "5 days", "1 month")
 *         quantity:
 *           type: string
 *           description: Quantity prescribed
 *         qty:
 *           type: string
 *           description: Alias for quantity (for backward compatibility)
 *         details:
 *           type: string
 *           description: Additional details
 *         notes:
 *           type: string
 *           description: Additional notes
 *     
 *     Prescription:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Prescription ID
 *         patient_id:
 *           type: string
 *           format: uuid
 *           description: Patient ID
 *         clinical_proforma_id:
 *           type: integer
 *           description: Foreign key reference to clinical_proforma table
 *         prescription:
 *           type: array
 *           description: Array of prescription items (medications)
 *           items:
 *             $ref: '#/components/schemas/PrescriptionItem'
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         patient_id: "24"
 *         clinical_proforma_id: 12
 *         prescription:
 *           - medicine: "Paracetamol"
 *             dosage: "650mg"
 *             when_to_take: "After food"
 *             frequency: "2 times"
 *             duration: "5 days"
 *             quantity: "10"
 *             details: "If fever persists, revisit"
 *             notes: "No allergies"
 *     
 *     PrescriptionCreate:
 *       type: object
 *       required:
 *         - clinical_proforma_id
 *         - prescription
 *       properties:
 *         patient_id:
 *           type: string
 *           format: uuid
 *           description: Patient ID (optional, can be derived from clinical_proforma)
 *         clinical_proforma_id:
 *           type: integer
 *           description: Clinical proforma ID (required)
 *         prescription:
 *           type: array
 *           minItems: 1
 *           description: Array of prescription items (can add multiple medicines)
 *           items:
 *             $ref: '#/components/schemas/PrescriptionItem'
 *         prescriptions:
 *           type: array
 *           minItems: 1
 *           description: Legacy format - accepts when/qty field names (will be converted to prescription array)
 *           items:
 *             type: object
 *             required:
 *               - medicine
 *             properties:
 *               medicine:
 *                 type: string
 *               dosage:
 *                 type: string
 *               when:
 *                 type: string
 *                 description: When to take (legacy field name)
 *               when_to_take:
 *                 type: string
 *                 description: When to take (new field name)
 *               frequency:
 *                 type: string
 *               duration:
 *                 type: string
 *               qty:
 *                 type: string
 *                 description: Quantity (legacy field name)
 *               quantity:
 *                 type: string
 *                 description: Quantity (new field name)
 *               details:
 *                 type: string
 *               notes:
 *                 type: string
 *     
 * */

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create a new prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrescriptionCreate'
 *     responses:
 *       201:
 *         description: Prescription created successfully
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
 *                     prescription:
 *                       $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Clinical proforma not found
 *       500:
 *         description: Server error
 */
router.post( '/', authenticateToken, authorizeRoles(['Faculty', 'Resident', 'Admin']),prescriptionController.createPrescription);

/**
 * @swagger
 * /api/prescriptions:
 *   get:
 *     summary: Get all prescriptions with pagination and filters
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: integer
 *         description: Filter by patient ID
 *       - in: query
 *         name: clinical_proforma_id
 *         schema:
 *           type: integer
 *         description: Filter by clinical proforma ID
 *       - in: query
 *         name: doctor_decision
 *         schema:
 *           type: string
 *           enum: [simple_case, complex_case]
 *         description: Filter by doctor decision
 *     responses:
 *       200:
 *         description: Prescriptions retrieved successfully
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
 *                     prescriptions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Prescription'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       500:
 *         description: Server error
 */
router.get('/',authenticateToken, authorizeRoles(['Faculty', 'Resident', 'Admin']), prescriptionController.getAllPrescription
);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get a prescription by ID or clinical_proforma_id
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *       - in: query
 *         name: clinical_proforma_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Clinical proforma ID (alternative to id)
 *     responses:
 *       200:
 *         description: Prescription retrieved successfully
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Server error
 */
// Route to get prescription by clinical_proforma_id (path parameter)
router.get('/by-proforma/:clinical_proforma_id', authenticateToken, [
  param('clinical_proforma_id').isInt().withMessage('Clinical proforma ID must be an integer')
], async (req, res) => {
  // Call the controller with clinical_proforma_id in query
  req.query.clinical_proforma_id = req.params.clinical_proforma_id;
  req.params.id = '1'; // Placeholder, will be ignored by controller when clinical_proforma_id is present
  return prescriptionController.getPrescriptionById(req, res);
});

// Route to get prescription by ID or clinical_proforma_id (query)
router.get('/:id', authenticateToken, [
  param('id').isInt().withMessage('Prescription ID must be an integer')
], prescriptionController.getPrescriptionById);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   put:
 *     summary: Update a prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicine:
 *                 type: string
 *               dosage:
 *                 type: string
 *               when:
 *                 type: string
 *               frequency:
 *                 type: string
 *               duration:
 *                 type: string
 *               qty:
 *                 type: string
 *               details:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['Faculty', 'Resident', 'Admin']),
  [
    param('id').isInt().withMessage('Prescription ID must be an integer'),
    body('medicine').optional().trim(),
    body('dosage').optional().trim(),
    body('when').optional().trim(),
    body('frequency').optional().trim(),
    body('duration').optional().trim(),
    body('qty').optional().trim(),
    body('details').optional().trim(),
    body('notes').optional().trim()
  ],
  prescriptionController.updatePrescription
);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   delete:
 *     summary: Delete a prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription deleted successfully
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Server error
 */
router.delete( '/:id',  authenticateToken,  authorizeRoles(['Faculty', 'Resident', 'Admin']),  [  param('id').isInt().withMessage('Prescription ID must be an integer')], prescriptionController.deletePrescription);


module.exports = router;

