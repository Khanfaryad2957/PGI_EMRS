const Prescription = require('../models/Prescription');
const ClinicalProforma = require('../models/ClinicalProforma');
const { validationResult } = require('express-validator');

/**
 * Create a new prescription
 */


const createPrescription = async (req, res) => {
  try {
    const data = req.body;

    // Ensure required IDs exist
    if (!data.clinical_proforma_id) {
      return res.status(400).json({
        success: false,
        message: "clinical_proforma_id is required"
      });
    }

    if (!data.patient_id) {
      return res.status(400).json({
        success: false,
        message: "patient_id is required"
      });
    }

    // Check clinical_proforma exists
    const proforma = await ClinicalProforma.findById(data.clinical_proforma_id);
    if (!proforma) {
      return res.status(404).json({
        success: false,
        message: "Clinical proforma not found"
      });
    }

    // Handle both new structure (prescription array) and legacy structure (prescriptions array)
    // Allow empty arrays - no validation required
    let prescriptionArray = [];
    
    if (data.prescription && Array.isArray(data.prescription)) {
      // New structure - ensure each item has a unique ID
      prescriptionArray = data.prescription.map((p, index) => ({
        id: p.id || (index + 1),
        medicine: p.medicine || null,
        dosage: p.dosage || null,
        when_to_take: p.when_to_take || p.when || null,
        frequency: p.frequency || null,
        duration: p.duration || null,
        quantity: p.quantity || p.qty || null,
        details: p.details || null,
        notes: p.notes || null
      }));
    } else if (data.prescriptions && Array.isArray(data.prescriptions)) {
      // Legacy structure - convert to new format
      prescriptionArray = data.prescriptions.map((p, index) => ({
        id: p.id || (index + 1),
        medicine: p.medicine || null,
        dosage: p.dosage || null,
        when_to_take: p.when_to_take || p.when || null,
        frequency: p.frequency || null,
        duration: p.duration || null,
        quantity: p.quantity || p.qty || null,
        details: p.details || null,
        notes: p.notes || null
      }));
    }
    // If no prescription array provided, use empty array (no error thrown)
    // Allow empty prescriptions - no validation error

    // Ensure patient_id is an integer
    const patientIdInt = parseInt(data.patient_id);
    if (isNaN(patientIdInt)) {
      return res.status(400).json({
        success: false,
        message: "patient_id must be a valid integer"
      });
    }

    // Create prescription with multiple medicines
    const prescription = await Prescription.create({
      patient_id: patientIdInt,
      clinical_proforma_id: data.clinical_proforma_id,
      prescription: prescriptionArray
    });

    return res.status(201).json({
      success: true,
      message: `Prescription created successfully with ${prescriptionArray.length} medication(s)`,
      data: {
        prescription: prescription.toJSON()
      }
    });

  } catch (error) {
    console.error("Error creating prescription:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message
    });
  }
};


/**
 * Get a single prescription by ID or clinical_proforma_id
 */
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { clinical_proforma_id } = req.query;

    console.log('[getPrescriptionById] Request params:', { id, clinical_proforma_id });

    let prescription;

    // If clinical_proforma_id is provided in query, use it (ignore id param)
    if (clinical_proforma_id) {
      const proformaIdInt = parseInt(clinical_proforma_id, 10);
      if (isNaN(proformaIdInt)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid clinical_proforma_id format'
        });
      }
      console.log('[getPrescriptionById] Searching by clinical_proforma_id:', proformaIdInt);
      prescription = await Prescription.findByClinicalProformaId(proformaIdInt);
    } else if (id) {
      const idInt = parseInt(id, 10);
      if (isNaN(idInt)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prescription ID format'
        });
      }
      console.log('[getPrescriptionById] Searching by prescription ID:', idInt);
      prescription = await Prescription.findById(idInt);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either id or clinical_proforma_id is required'
      });
    }

    if (!prescription) {
      console.log('[getPrescriptionById] Prescription not found');
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    console.log('[getPrescriptionById] Prescription found:', prescription.id);

    res.status(200).json({
      success: true,
      message: 'Prescription retrieved successfully',
      data: {
        prescription: prescription.toJSON()
      }
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription',
      error: error.message
    });
  }
};

/**
 * Update a prescription
 */
const updatePrescription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Find prescription by id or by clinical_proforma_id
    let prescription;
    if (id) {
      prescription = await Prescription.findById(parseInt(id));
    } else if (updateData.clinical_proforma_id) {
      prescription = await Prescription.findByClinicalProformaId(updateData.clinical_proforma_id);
    }

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Handle both new structure (prescription array) and legacy structure (individual prescriptions array)
    if (updateData.prescriptions && Array.isArray(updateData.prescriptions)) {
      // Legacy bulk update - convert to new structure
      const prescriptionArray = updateData.prescriptions.map((p, index) => ({
        id: p.id || (index + 1),
        medicine: p.medicine || null,
        dosage: p.dosage || null,
        when_to_take: p.when_to_take || p.when || null,
        frequency: p.frequency || null,
        duration: p.duration || null,
        quantity: p.quantity || p.qty || null,
        details: p.details || null,
        notes: p.notes || null
      }));

      updateData.prescription = prescriptionArray;
      delete updateData.prescriptions;
    }

    await prescription.update(updateData);

    // Refetch to get updated data
    const updatedPrescription = await Prescription.findByClinicalProformaId(prescription.clinical_proforma_id);

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: {
        prescription: updatedPrescription ? updatedPrescription.toJSON() : prescription.toJSON()
      }
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
      error: error.message
    });
  }
};

/**
 * Get all prescriptions with pagination and filters
 */
const getAllPrescription = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};

    // Extract filters from query parameters
    if (req.query.patient_id) {
      filters.patient_id = req.query.patient_id;
    }
    if (req.query.clinical_proforma_id) {
      filters.clinical_proforma_id = req.query.clinical_proforma_id;
    }
    if (req.query.doctor_decision) {
      filters.doctor_decision = req.query.doctor_decision;
    }

    const result = await Prescription.findAll(page, limit, filters);

    res.status(200).json({
      success: true,
      message: 'Prescriptions retrieved successfully',
      data: {
        prescriptions: result.prescriptions.map(p => p.toJSON()),
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
};

/**
 * Delete a prescription
 */
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(parseInt(id));

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    await prescription.delete();

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription',
      error: error.message
    });
  }
};


module.exports = {
  createPrescription,
  getPrescriptionById,
  getAllPrescription,
  updatePrescription,
  deletePrescription
};

