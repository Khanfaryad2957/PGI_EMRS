const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, param } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Prescription:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         clinical_proforma_id:
 *           type: integer
 *           description: Foreign key reference to clinical_proforma table
 *         medicine:
 *           type: string
 *           maxLength: 255
 *         dosage:
 *           type: string
 *           maxLength: 100
 *         when:
 *           type: string
 *           maxLength: 100
 *           description: When to take medication (e.g., before/after food, morning, evening)
 *         frequency:
 *           type: string
 *           maxLength: 100
 *           description: Frequency of administration (e.g., daily, twice daily, SOS)
 *         duration:
 *           type: string
 *           maxLength: 100
 *           description: Duration of treatment (e.g., 5 days, 1 month)
 *         qty:
 *           type: string
 *           maxLength: 50
 *           description: Quantity prescribed
 *         details:
 *           type: string
 *         notes:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     PrescriptionCreate:
 *       type: object
 *       required:
 *         - clinical_proforma_id
 *         - medicine
 *       properties:
 *         clinical_proforma_id:
 *           type: integer
 *         medicine:
 *           type: string
 *           maxLength: 255
 *         dosage:
 *           type: string
 *           maxLength: 100
 *         when:
 *           type: string
 *           maxLength: 100
 *         frequency:
 *           type: string
 *           maxLength: 100
 *         duration:
 *           type: string
 *           maxLength: 100
 *         qty:
 *           type: string
 *           maxLength: 50
 *         details:
 *           type: string
 *         notes:
 *           type: string
 *     
 *     PrescriptionBulkCreate:
 *       type: object
 *       required:
 *         - clinical_proforma_id
 *         - prescriptions
 *       properties:
 *         clinical_proforma_id:
 *           type: integer
 *         prescriptions:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/PrescriptionCreate'
 */

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
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['Faculty', 'Resident', 'Admin']),
  // [
  //   body('clinical_proforma_id').isInt().withMessage('Clinical proforma ID must be an integer'),
  //   body('medicine').notEmpty().trim().withMessage('Medicine name is required'),
  //   body('dosage').optional().trim(),
  //   body('when').optional().trim(),
  //   body('frequency').optional().trim(),
  //   body('duration').optional().trim(),
  //   body('qty').optional().trim(),
  //   body('details').optional().trim(),
  //   body('notes').optional().trim()
  // ],
  prescriptionController.createPrescription
);

/**
 * @swagger
 * /api/prescriptions/bulk:
 *   post:
 *     summary: Create multiple prescriptions (bulk)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrescriptionBulkCreate'
 *           example:
 *             clinical_proforma_id: 1
 *             prescriptions:
 *               - medicine: "Paracetamol"
 *                 dosage: "500mg"
 *                 when: "After food"
 *                 frequency: "Twice daily"
 *                 duration: "5 days"
 *                 qty: "10"
 *                 details: "For fever"
 *                 notes: "Take with water"
 *               - medicine: "Ibuprofen"
 *                 dosage: "400mg"
 *                 when: "Before food"
 *                 frequency: "Once daily"
 *                 duration: "3 days"
 *                 qty: "3"
 *     responses:
 *       201:
 *         description: Prescriptions created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Clinical proforma not found
 *       500:
 *         description: Server error
 */
router.post(
  '/bulk',
  authenticateToken,
  authorizeRoles(['Faculty', 'Resident', 'Admin']),
  // [
  //   body('clinical_proforma_id').isInt().withMessage('Clinical proforma ID must be an integer'),
  //   body('prescriptions').isArray({ min: 1 }).withMessage('Prescriptions must be a non-empty array'),
  //   body('prescriptions.*.medicine').notEmpty().trim().withMessage('Each prescription must have a medicine name')
  // ],
  prescriptionController.createBulkPrescriptions
);

/**
 * @swagger
 * /api/prescriptions/proforma/{proforma_id}:
 *   get:
 *     summary: Get all prescriptions for a clinical proforma
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proforma_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Clinical proforma ID
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
 *                     count:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get(
  '/proforma/:proforma_id',
  authenticateToken,
  [
    param('proforma_id').isInt().withMessage('Proforma ID must be an integer')
  ],
  prescriptionController.getPrescriptionsByProformaId
);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get a prescription by ID
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
 *         description: Prescription retrieved successfully
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  authenticateToken,
  [
    param('id').isInt().withMessage('Prescription ID must be an integer')
  ],
  prescriptionController.getPrescriptionById
);

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
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['Faculty', 'Resident', 'Admin']),
  [
    param('id').isInt().withMessage('Prescription ID must be an integer')
  ],
  prescriptionController.deletePrescription
);

/**
 * @swagger
 * /api/prescriptions/proforma/{proforma_id}:
 *   delete:
 *     summary: Delete all prescriptions for a clinical proforma
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proforma_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Clinical proforma ID
 *     responses:
 *       200:
 *         description: Prescriptions deleted successfully
 *       500:
 *         description: Server error
 */
router.delete(
  '/proforma/:proforma_id',
  authenticateToken,
  authorizeRoles(['Faculty', 'Resident', 'Admin']),
  [
    param('proforma_id').isInt().withMessage('Proforma ID must be an integer')
  ],
  prescriptionController.deletePrescriptionsByProformaId
);

module.exports = router;

