const ADLFile = require('../models/ADLFile');
const Patient = require('../models/Patient');
const db = require('../config/database');
class ADLController {
  // Get all ADL files with pagination and filters
  // By default, only returns ADL files associated with complex cases
  static async getAllADLFiles(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      // Apply filters
      if (req.query.file_status) filters.file_status = req.query.file_status;
      if (req.query.is_active !== undefined) filters.is_active = req.query.is_active === 'true';
      if (req.query.created_by) filters.created_by = req.query.created_by;
      if (req.query.last_accessed_by) filters.last_accessed_by = req.query.last_accessed_by;
      if (req.query.date_from) filters.date_from = req.query.date_from;
      if (req.query.date_to) filters.date_to = req.query.date_to;
      
      // Allow showing all ADL files (including non-complex cases) if explicitly requested
      // By default, only show complex cases (clinical_proforma_id IS NOT NULL)
      if (req.query.include_all === 'true') {
        filters.include_all = true;
      }

      const result = await ADLFile.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all ADL files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get ADL file by ID
  static async getADLFileById(req, res) {
    try {
      const { id } = req.params;
      const adlFile = await ADLFile.findById(id);

      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      res.json({
        success: true,
        data: {
          adlFile: adlFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Get ADL file by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get ADL files by patient ID (integer)
  static async getADLFilesByPatientId(req, res) {
    try {
      const { patient_id } = req.params;
      
      console.log(`[ADLController.getADLFilesByPatientId] Fetching ADL files for patient_id: ${patient_id}`);
      
      const adlFiles = await ADLFile.findByPatientId(patient_id);

      res.json({
        success: true,
        data: {
          adlFiles: adlFiles.map(file => file.toJSON())
        }
      });
    } catch (error) {
      console.error('Get ADL files by patient ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Create ADL file

  static async createADLFile(req, res) {
    try {
      const adlData = req.body;
      const createdBy = req.user.id; // Get user ID from authenticated request

      // Validate required fields
      if (!adlData.patient_id) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
      }

      // Generate ADL number if not provided
      let adl_no = adlData.adl_no;
      if (!adl_no) {
        try {
          const db = require('../config/database');
          const adlNoResult = await db.query('SELECT generate_adl_number() as adl_no');
          adl_no = adlNoResult.rows[0]?.adl_no;
        } catch (error) {
          console.warn('Failed to generate ADL number via SQL function, using JavaScript fallback:', error.message);
          // Fallback: Generate ADL number in JavaScript
          const year = new Date().getFullYear();
          const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
          adl_no = `ADL${year}${randomPart}`;
        }
        
        // If still no ADL number, generate one
        if (!adl_no) {
          const year = new Date().getFullYear();
          const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
          adl_no = `ADL${year}${randomPart}`;
        }
      }

      // Ensure integer IDs are properly parsed
      const patientIdInt = adlData.patient_id ? parseInt(adlData.patient_id, 10) : null;
      const createdByIdInt = createdBy ? parseInt(createdBy, 10) : null;
      const clinicalProformaIdInt = adlData.clinical_proforma_id ? parseInt(adlData.clinical_proforma_id, 10) : null;

      // Prepare ADL data with defaults
      const createData = {
        ...adlData,
        patient_id: patientIdInt,
        adl_no,
        created_by: createdByIdInt,
        clinical_proforma_id: clinicalProformaIdInt,
        file_status: adlData.file_status || 'created',
        file_created_date: adlData.file_created_date || new Date(),
        total_visits: adlData.total_visits || 1,
        is_active: adlData.is_active !== undefined ? adlData.is_active : true
      };

      // Create the ADL file
      const adlFile = await ADLFile.create(createData);

      if (!adlFile || !adlFile.id) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create ADL file: No ID returned'
        });
      }

      // Fetch the created file with all joins
      const createdFile = await ADLFile.findById(adlFile.id);

      res.status(201).json({
        success: true,
        message: 'ADL file created successfully',
        data: {
          adl_file: createdFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Create ADL file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }



  // static async createADLFile(req, res) {
  //   try {
  //     const adlData = req.body;
  //     const createdBy = req.user.id;
  
  //     if (!adlData.patient_id) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Patient ID is required"
  //       });
  //     }
  
  //     if (!adlData.clinical_proforma_id) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Walk-in Clinical Proforma ID is required"
  //       });
  //     }
  
  //     // -------------------------------------
  //     // 1. CHECK IF ADL FILE ALREADY EXISTS
  //     // -------------------------------------
  //     // Use findByClinicalProformaId instead of findOneBy
  //     const existing = await ADLFile.findByClinicalProformaId(
  //       adlData.clinical_proforma_id
  //     );
  
  //     if (existing) {
  //       return res.status(200).json({
  //         success: true,
  //         message: "ADL file already exists",
  //         data: { adl_file: existing }
  //       });
  //     }
  
  //     // -------------------------------------
  //     // 2. GENERATE NEXT ADL NUMBER
  //     // -------------------------------------
  //     // Query to get the last ADL number
     
  //     const lastAdlResult = await db.query(
  //       'SELECT adl_no FROM adl_files ORDER BY adl_no DESC LIMIT 1'
  //     );
      
  //     const adl_no = lastAdlResult.rows.length > 0 
  //       ? lastAdlResult.rows[0].adl_no + 1 
  //       : 1;
  
  //     // -------------------------------------
  //     // 3. PREPARE DATA
  //     // -------------------------------------
  //     const createData = {
  //       ...adlData,
  //       adl_no,
  //       created_by: createdBy,
  //       file_status: "created",
  //       file_created_date: new Date(),
  //       total_visits: 1,
  //       is_active: true
  //     };
  
  //     // -------------------------------------
  //     // 4. CREATE ADL FILE
  //     // -------------------------------------
  //     const adlFile = await ADLFile.create(createData);
  
  //     if (!adlFile || !adlFile.id) {
  //       return res.status(500).json({
  //         success: false,
  //         message: "Failed to create ADL file (ID missing)"
  //       });
  //     }
  
  //     // Fetch the complete record with joined data
  //     const createdFile = await ADLFile.findById(adlFile.id);
  
  //     return res.status(201).json({
  //       success: true,
  //       message: "ADL file created successfully",
  //       data: { adl_file: createdFile }
  //     });
  
  //   } catch (error) {
  //     console.error("Create ADL file error:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Failed to create ADL file",
  //       error: error.message
  //     });
  //   }
  // }
  
  // Update ADL file
  static async updateADLFile(req, res) {
    try {
      const { id } = req.params;
      console.log('[ADLController.updateADLFile] Request received for ID:', id);
      console.log('[ADLController.updateADLFile] Request body keys:', Object.keys(req.body));
      console.log('[ADLController.updateADLFile] Request body sample:', JSON.stringify(req.body).substring(0, 500));
      
      const adlFile = await ADLFile.findById(id);

      if (!adlFile) {
        console.log('[ADLController.updateADLFile] ADL file not found for ID:', id);
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      console.log('[ADLController.updateADLFile] ADL file found, current ID:', adlFile.id);
      
      // Remove id from updateData if present (should not be updated)
      const updateData = { ...req.body };
      delete updateData.id;
      delete updateData.patient_id; // Should not be updated
      delete updateData.clinical_proforma_id; // Should not be updated
      delete updateData.adl_no; // Should not be updated
      delete updateData.created_by; // Should not be updated
      delete updateData.created_at; // Should not be updated
      
      console.log('[ADLController.updateADLFile] Update data keys after cleanup:', Object.keys(updateData));
      console.log('[ADLController.updateADLFile] Update data count:', Object.keys(updateData).length);
      
      if (Object.keys(updateData).length === 0) {
        console.warn('[ADLController.updateADLFile] No fields to update after cleanup');
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }
      
      await adlFile.update(updateData);
      
      console.log('[ADLController.updateADLFile] Update successful, refreshing ADL file...');
      
      // Refresh the ADL file to get updated data
      const updatedAdlFile = await ADLFile.findById(id);

      res.json({
        success: true,
        message: 'ADL file updated successfully',
        data: {
          adlFile: updatedAdlFile ? updatedAdlFile.toJSON() : adlFile.toJSON()
        }
      });
    } catch (error) {
      console.error('[ADLController.updateADLFile] Error:', error);
      console.error('[ADLController.updateADLFile] Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to update ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get active files (currently retrieved)
  static async getActiveFiles(req, res) {
    try {
      const activeFiles = await ADLFile.getActiveFiles();

      res.json({
        success: true,
        data: {
          activeFiles: activeFiles.map(file => file.toJSON())
        }
      });
    } catch (error) {
      console.error('Get active files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get ADL file statistics
  static async getADLStats(req, res) {
    try {
      const stats = await ADLFile.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get ADL stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get files by status
  static async getFilesByStatus(req, res) {
    try {
      const statusStats = await ADLFile.getFilesByStatus();

      res.json({
        success: true,
        data: {
          statusStats
        }
      });
    } catch (error) {
      console.error('Get files by status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get status statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete ADL file (soft delete by archiving)
  static async deleteADLFile(req, res) {
    try {
      const { id } = req.params;
      const adlFile = await ADLFile.findById(id);

      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      await adlFile.delete();

      res.json({
        success: true,
        message: 'ADL file deleted successfully'
      });
    } catch (error) {
      console.error('Delete ADL file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete ADL file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Bulk operations for file management
  static async bulkRetrieveFiles(req, res) {
    try {
      const { file_ids } = req.body;

      if (!Array.isArray(file_ids) || file_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File IDs array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const fileId of file_ids) {
        try {
          const adlFile = await ADLFile.findById(fileId);
          if (adlFile && adlFile.file_status === 'stored') {
            await adlFile.retrieveFile(req.user.id);
            results.push(adlFile.toJSON());
          } else {
            errors.push(`File ${fileId}: Not found or not available for retrieval`);
          }
        } catch (error) {
          errors.push(`File ${fileId}: ${error.message}`);
        }
      }

      res.json({
        success: true,
        message: `Retrieved ${results.length} files successfully`,
        data: {
          retrieved: results,
          errors: errors
        }
      });
    } catch (error) {
      console.error('Bulk retrieve files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk retrieve files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Bulk return files
  static async bulkReturnFiles(req, res) {
    try {
      const { file_ids } = req.body;

      if (!Array.isArray(file_ids) || file_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File IDs array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const fileId of file_ids) {
        try {
          const adlFile = await ADLFile.findById(fileId);
          if (adlFile && adlFile.file_status === 'retrieved') {
            await adlFile.returnFile(req.user.id);
            results.push(adlFile.toJSON());
          } else {
            errors.push(`File ${fileId}: Not found or not currently retrieved`);
          }
        } catch (error) {
          errors.push(`File ${fileId}: ${error.message}`);
        }
      }

      res.json({
        success: true,
        message: `Returned ${results.length} files successfully`,
        data: {
          returned: results,
          errors: errors
        }
      });
    } catch (error) {
      console.error('Bulk return files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk return files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = ADLController;
