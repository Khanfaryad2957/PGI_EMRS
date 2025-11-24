const express = require('express');
const router = express.Router();
const PatientFileController = require('../controllers/patientFileController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');
const { handleUpload } = require('../middleware/upload');

/**
 * @swagger
 * /api/patient-files/{patient_id}:
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
router.get('/:patient_id', 
  authenticateToken, 
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), 
  validateId, 
  PatientFileController.getPatientFiles
);

/**
 * @swagger
 * /api/patient-files/create:
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
 *               user_id:
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
router.post('/create', 
  authenticateToken, 
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), 
  handleUpload, 
  PatientFileController.createPatientFiles
);

/**
 * @swagger
 * /api/patient-files/update/{patient_id}:
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
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Patient not found
 */
router.put('/update/:patient_id', 
  authenticateToken, 
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), 
  validateId, 
  handleUpload, 
  PatientFileController.updatePatientFiles
);

/**
 * @swagger
 * /api/patient-files/delete/{patient_id}/{file_path}:
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
 *       403:
 *         description: Permission denied
 *       404:
 *         description: File or patient not found
 */
router.delete('/delete/:patient_id/:file_path', 
  authenticateToken, 
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), 
  validateId, 
  PatientFileController.deletePatientFile
);

/**
 * @swagger
 * /api/patient-files/stats:
 *   get:
 *     summary: Get patient file upload statistics
 *     tags: [Patient Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', 
  authenticateToken, 
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), 
  PatientFileController.getFileStats
);

module.exports = router;

