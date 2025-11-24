const PatientFile = require('../models/PatientFile');
const Patient = require('../models/Patient');
const path = require('path');
const fs = require('fs');
const uploadConfig = require('../config/uploadConfig');

// Helper function to check if user can edit/delete files
const canEditDelete = (user, patientFile) => {
  if (!user || !patientFile) return false;
  
  const userRole = user.role?.trim();
  const userId = parseInt(user.id, 10);
  
  // Admin and MWO have full access
  if (userRole === 'Admin' || userRole === 'Psychiatric Welfare Officer') {
    return true;
  }
  
  // Faculty and Resident can only edit/delete their own uploads
  if (userRole === 'Faculty' || userRole === 'Resident') {
    const roleArray = Array.isArray(patientFile.role) ? patientFile.role : [];
    return roleArray.some(r => r.id === userId);
  }
  
  return false;
};

class PatientFileController {
  // Get patient files
  static async getPatientFiles(req, res) {
    try {
      const { patient_id } = req.params;
      const patientIdInt = parseInt(patient_id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Get patient files
      const patientFile = await PatientFile.findByPatientId(patientIdInt);

      res.status(200).json({
        success: true,
        data: {
          patient_id: patientIdInt,
          files: patientFile ? patientFile.attachment : [],
          record: patientFile ? patientFile.toJSON() : null,
          can_edit: patientFile ? canEditDelete(req.user, patientFile) : false
        }
      });
    } catch (error) {
      console.error('Get patient files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Create/Upload patient files
  static async createPatientFiles(req, res) {
    try {
      const { patient_id, user_id } = req.body;
      const patientIdInt = parseInt(patient_id, 10);
      const userId = parseInt(user_id || req.user?.id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        // Clean up uploaded files if patient ID is invalid
        const files = Array.isArray(req.files) ? req.files : [];
        if (files.length > 0) {
          files.forEach(file => {
            if (file.path && fs.existsSync(file.path)) {
              try {
                fs.unlinkSync(file.path);
              } catch (err) {
                console.error('Error cleaning up file:', err);
              }
            }
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        // Clean up uploaded files if patient doesn't exist
        const files = Array.isArray(req.files) ? req.files : [];
        if (files.length > 0) {
          files.forEach(file => {
            if (file.path && fs.existsSync(file.path)) {
              try {
                fs.unlinkSync(file.path);
              } catch (err) {
                console.error('Error cleaning up file:', err);
              }
            }
          });
        }
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Ensure req.files is an array
      const files = Array.isArray(req.files) ? req.files : [];
      
      if (files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Get user role for folder structure
      const userRole = req.user?.role?.trim() || 'Admin';
      
      // Check if record exists to get the ID
      let patientFile = await PatientFile.findByPatientId(patientIdInt);
      let fileRecordId = patientFile ? patientFile.id : null;
      
      // If no record exists, create it first to get the ID
      if (!patientFile) {
        // Create empty record first
        patientFile = await PatientFile.create({
          patient_id: patientIdInt,
          attachment: [],
          user_id: userId
        });
        fileRecordId = patientFile.id;
      }
      
      // Create role-based directory structure using config
      const patientFilesDir = uploadConfig.getPatientFilesDir(patientIdInt, userRole);
      if (!fs.existsSync(patientFilesDir)) {
        fs.mkdirSync(patientFilesDir, { recursive: true });
      }

      // Move files to role-based directory and build file paths
      const filePaths = [];
      let fileIndex = 0;
      for (const file of files) {
        // Get file extension
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const ext = path.extname(originalName);
        
        // Generate filename: {file_record_id}_{role}{ext}
        // Use record ID + index to ensure uniqueness if multiple files
        const uniqueFilename = `${fileRecordId}_${roleFolder}${fileIndex > 0 ? `_${fileIndex}` : ''}${ext}`;
        const newPath = path.join(patientFilesDir, uniqueFilename);
        
          // Move file from temp location to role-based directory
        if (fs.existsSync(file.path)) {
          fs.renameSync(file.path, newPath);
        }
        // Store relative URL path for database using config
        const relativePath = uploadConfig.getPatientFileUrl(newPath, userRole);
        filePaths.push(relativePath);
        fileIndex++;
      }

      // Update patient file record with new files
      const updatedFiles = [...(patientFile.attachment || []), ...filePaths];
      patientFile = await PatientFile.update(patientFile.id, {
        attachment: updatedFiles,
        user_id: userId
      });

      res.status(201).json({
        success: true,
        message: `${files.length} file(s) uploaded successfully`,
        data: {
          files: filePaths,
          record: patientFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Create patient files error:', error);
      // Clean up uploaded files on error
      const files = Array.isArray(req.files) ? req.files : [];
      if (files.length > 0) {
        const { patient_id } = req.body;
        const patientIdInt = parseInt(patient_id, 10);
        if (!isNaN(patientIdInt)) {
          files.forEach(file => {
            if (file.path && fs.existsSync(file.path)) {
              try {
                fs.unlinkSync(file.path);
              } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
              }
            }
          });
        }
      }
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update patient files (add/remove)
  static async updatePatientFiles(req, res) {
    try {
      const { patient_id } = req.params;
      const { files_to_remove } = req.body; // Array of file paths to remove
      const patientIdInt = parseInt(patient_id, 10);
      const userId = parseInt(req.user?.id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Get existing record
      const existing = await PatientFile.findByPatientId(patientIdInt);
      
      // Check permissions for edit/delete
      if (existing && !canEditDelete(req.user, existing)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to edit/delete these files. You can only edit/delete files you uploaded.'
        });
      }

      const newFiles = [];
      const filesToRemove = Array.isArray(files_to_remove) ? files_to_remove : [];

      // Get user role for folder structure
      const userRole = req.user?.role?.trim() || 'Admin';

      // Get or create record to use its ID for filename
      let currentRecord = existing;
      if (!currentRecord) {
        currentRecord = await PatientFile.findByPatientId(patientIdInt);
        if (!currentRecord) {
          // Create empty record first
          currentRecord = await PatientFile.create({
            patient_id: patientIdInt,
            attachment: [],
            user_id: userId
          });
        }
      }
      const recordId = currentRecord.id;

      // Handle new file uploads
      const files = Array.isArray(req.files) ? req.files : [];
      if (files.length > 0) {
        // Create role-based directory structure using config
        const patientFilesDir = uploadConfig.getPatientFilesDir(patientIdInt, userRole);
        if (!fs.existsSync(patientFilesDir)) {
          fs.mkdirSync(patientFilesDir, { recursive: true });
        }

        // Count existing files to append index for uniqueness
        const existingFileCount = (currentRecord.attachment || []).length;
        let fileIndex = 0;

        // Move files to role-based directory
        for (const file of files) {
          // Get file extension
          const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          const ext = path.extname(originalName);
          
          // Generate filename: {file_record_id}_{role}{ext} or {file_record_id}_{role}_{index}{ext} for multiple files
          const uniqueFilename = `${recordId}_${roleFolder}${fileIndex > 0 || existingFileCount > 0 ? `_${existingFileCount + fileIndex}` : ''}${ext}`;
          const newPath = path.join(patientFilesDir, uniqueFilename);
          
          if (fs.existsSync(file.path)) {
            fs.renameSync(file.path, newPath);
          }
          // Store relative URL path for database using config
          const relativePath = uploadConfig.getPatientFileUrl(newPath, userRole);
          newFiles.push(relativePath);
          fileIndex++;
        }
      }

      // Get existing files
      let updatedFiles = existing ? [...(existing.attachment || [])] : [];

      // Add new files
      updatedFiles = [...updatedFiles, ...newFiles];

      // Remove specified files
      if (filesToRemove.length > 0) {
        const filesToRemoveSet = new Set(filesToRemove);
        updatedFiles = updatedFiles.filter(file => {
          if (filesToRemoveSet.has(file)) {
            // Delete physical file - convert URL path to absolute path
            // File path might be like /uploads/patient_files/Admin/123/file.jpg
            const absolutePath = uploadConfig.getAbsolutePath(file.replace(/^\//, ''));
            if (fs.existsSync(absolutePath)) {
              try {
                fs.unlinkSync(absolutePath);
              } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
              }
            }
            return false;
          }
          return true;
        });
      }

      // Update or create record
      let patientFile;
      if (existing) {
        patientFile = await PatientFile.update(existing.id, {
          attachment: updatedFiles,
          user_id: userId
        });
      } else if (newFiles.length > 0) {
        patientFile = await PatientFile.create({
          patient_id: patientIdInt,
          attachment: updatedFiles,
          user_id: userId
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'No files to update'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Files updated successfully',
        data: {
          files: updatedFiles,
          record: patientFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Update patient files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete specific file
  static async deletePatientFile(req, res) {
    try {
      const { patient_id, file_path } = req.params;
      const patientIdInt = parseInt(patient_id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Get existing record
      const existing = await PatientFile.findByPatientId(patientIdInt);
      if (!existing || !existing.attachment.includes(file_path)) {
        return res.status(404).json({
          success: false,
          message: 'File not found in patient record'
        });
      }

      // Check permissions
      if (!canEditDelete(req.user, existing)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this file. You can only delete files you uploaded.'
        });
      }

      // Delete physical file - convert URL path to absolute path using config
      const absolutePath = uploadConfig.getAbsolutePath(file_path.replace(/^\//, ''));
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      // Remove from database
      const updatedFiles = existing.attachment.filter(f => f !== file_path);
      const userId = parseInt(req.user?.id, 10);
      const patientFile = await PatientFile.update(existing.id, {
        attachment: updatedFiles,
        user_id: userId
      });

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        data: {
          files: updatedFiles,
          record: patientFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Delete patient file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get file upload statistics
  static async getFileStats(req, res) {
    try {
      const stats = await PatientFile.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Get file stats error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to get file statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = PatientFileController;