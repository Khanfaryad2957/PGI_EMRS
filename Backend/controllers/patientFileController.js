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
      console.log('[createPatientFiles] Request received');
      console.log('[createPatientFiles] req.body:', req.body);
      console.log('[createPatientFiles] req.files:', req.files ? (Array.isArray(req.files) ? req.files.length : Object.keys(req.files).length) : 'no files');
      console.log('[createPatientFiles] req.user:', req.user ? { id: req.user.id, role: req.user.role } : 'no user');
      
      const { patient_id, user_id } = req.body;
      const patientIdInt = parseInt(patient_id, 10);
      const userId = parseInt(user_id || req.user?.id, 10);
      
      console.log('[createPatientFiles] Parsed patient_id:', patientIdInt, 'user_id:', userId);

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
      const roleFolder = userRole.replace(/\s+/g, '_'); // Replace spaces with underscores for folder name
      
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
      console.log('[createPatientFiles] Creating directory:', patientFilesDir);
      if (!fs.existsSync(patientFilesDir)) {
        fs.mkdirSync(patientFilesDir, { recursive: true });
        console.log('[createPatientFiles] Directory created successfully');
      } else {
        console.log('[createPatientFiles] Directory already exists');
      }

      // Move files to role-based directory and build file paths
      const filePaths = [];
      let fileIndex = 0;
      for (const file of files) {
        console.log('[createPatientFiles] Processing file:', file.originalname, 'Temp path:', file.path);
        
        // Get file extension
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const ext = path.extname(originalName);
        
        // Generate filename: {file_record_id}_{role}{ext}
        // Use record ID + index to ensure uniqueness if multiple files
        const uniqueFilename = `${fileRecordId}_${roleFolder}${fileIndex > 0 ? `_${fileIndex}` : ''}${ext}`;
        const newPath = path.join(patientFilesDir, uniqueFilename);
        
        console.log('[createPatientFiles] Moving file to:', newPath);
        
        // Move file from temp location to role-based directory
        if (file.path && fs.existsSync(file.path)) {
          try {
            fs.renameSync(file.path, newPath);
            console.log('[createPatientFiles] File moved successfully');
          } catch (moveError) {
            console.error('[createPatientFiles] Error moving file:', moveError);
            // Try copying instead if rename fails
            try {
              fs.copyFileSync(file.path, newPath);
              fs.unlinkSync(file.path); // Delete temp file after copy
              console.log('[createPatientFiles] File copied successfully');
            } catch (copyError) {
              console.error('[createPatientFiles] Error copying file:', copyError);
              throw new Error(`Failed to save file: ${copyError.message}`);
            }
          }
        } else {
          console.error('[createPatientFiles] File path does not exist:', file.path);
          throw new Error(`File not found at temporary location: ${file.path}`);
        }
        
        // Store relative URL path for database using config
        const relativePath = uploadConfig.getPatientFileUrl(newPath, userRole);
        console.log('[createPatientFiles] File saved with URL path:', relativePath);
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
      console.log('[updatePatientFiles] Request received');
      console.log('[updatePatientFiles] req.params:', req.params);
      console.log('[updatePatientFiles] req.body:', req.body);
      console.log('[updatePatientFiles] req.files:', req.files ? (Array.isArray(req.files) ? req.files.length : Object.keys(req.files).length) : 'no files');
      console.log('[updatePatientFiles] req.user:', req.user ? { id: req.user.id, role: req.user.role } : 'no user');
      
      const { patient_id } = req.params;
      // Handle both files_to_remove and files_to_remove[] formats (FormData can send arrays differently)
      let files_to_remove = req.body.files_to_remove || req.body['files_to_remove[]'] || [];
      if (!Array.isArray(files_to_remove)) {
        if (typeof files_to_remove === 'string') {
          try {
            files_to_remove = JSON.parse(files_to_remove);
          } catch (e) {
            files_to_remove = [files_to_remove];
          }
        } else {
          files_to_remove = [];
        }
      }
      
      const patientIdInt = parseInt(patient_id, 10);
      const userId = parseInt(req.user?.id, 10);
      
      console.log('[updatePatientFiles] Parsed patient_id:', patientIdInt, 'user_id:', userId, 'files_to_remove:', files_to_remove);

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
      const filesToRemove = files_to_remove; // Already parsed above

      // Get user role for folder structure
      const userRole = req.user?.role?.trim() || 'Admin';
      const roleFolder = userRole.replace(/\s+/g, '_'); // Replace spaces with underscores for folder name

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
        console.log('[updatePatientFiles] Processing', files.length, 'new file(s)');
        
        // Create role-based directory structure using config
        const patientFilesDir = uploadConfig.getPatientFilesDir(patientIdInt, userRole);
        console.log('[updatePatientFiles] Target directory:', patientFilesDir);
        
        if (!fs.existsSync(patientFilesDir)) {
          fs.mkdirSync(patientFilesDir, { recursive: true });
          console.log('[updatePatientFiles] Directory created');
        }

        // Count existing files to append index for uniqueness
        const existingFileCount = (currentRecord.attachment || []).length;
        let fileIndex = 0;

        // Move files to role-based directory
        for (const file of files) {
          console.log('[updatePatientFiles] Processing file:', file.originalname, 'Temp path:', file.path);
          
          // Get file extension
          const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          const ext = path.extname(originalName);
          
          // Generate filename: {file_record_id}_{role}{ext} or {file_record_id}_{role}_{index}{ext} for multiple files
          const uniqueFilename = `${recordId}_${roleFolder}${fileIndex > 0 || existingFileCount > 0 ? `_${existingFileCount + fileIndex}` : ''}${ext}`;
          const newPath = path.join(patientFilesDir, uniqueFilename);
          
          console.log('[updatePatientFiles] Moving file to:', newPath);
          
          if (file.path && fs.existsSync(file.path)) {
            try {
              fs.renameSync(file.path, newPath);
              console.log('[updatePatientFiles] File moved successfully');
            } catch (moveError) {
              console.error('[updatePatientFiles] Error moving file:', moveError);
              // Try copying instead if rename fails
              try {
                fs.copyFileSync(file.path, newPath);
                fs.unlinkSync(file.path); // Delete temp file after copy
                console.log('[updatePatientFiles] File copied successfully');
              } catch (copyError) {
                console.error('[updatePatientFiles] Error copying file:', copyError);
                throw new Error(`Failed to save file: ${copyError.message}`);
              }
            }
          } else {
            console.error('[updatePatientFiles] File path does not exist:', file.path);
            throw new Error(`File not found at temporary location: ${file.path}`);
          }
          
          // Store relative URL path for database using config
          const relativePath = uploadConfig.getPatientFileUrl(newPath, userRole);
          console.log('[updatePatientFiles] File saved with URL path:', relativePath);
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
        console.log('[updatePatientFiles] Removing', filesToRemove.length, 'file(s)');
        const filesToRemoveSet = new Set(filesToRemove);
        updatedFiles = updatedFiles.filter(file => {
          if (filesToRemoveSet.has(file)) {
            console.log('[updatePatientFiles] Deleting file:', file);
            // Delete physical file - convert URL path to absolute path
            // File path might be like /uploads/patient_files/Admin/123/file.jpg
            const absolutePath = uploadConfig.getAbsolutePath(file.replace(/^\//, ''));
            console.log('[updatePatientFiles] Absolute path for deletion:', absolutePath);
            if (fs.existsSync(absolutePath)) {
              try {
                fs.unlinkSync(absolutePath);
                console.log('[updatePatientFiles] File deleted successfully');
              } catch (unlinkError) {
                console.error('[updatePatientFiles] Error deleting file:', unlinkError);
              }
            } else {
              console.warn('[updatePatientFiles] File not found at path:', absolutePath);
            }
            return false;
          }
          return true;
        });
      }

      // Update or create record
      console.log('[updatePatientFiles] Final file count:', updatedFiles.length);
      console.log('[updatePatientFiles] New files added:', newFiles.length);
      console.log('[updatePatientFiles] Files removed:', filesToRemove.length);
      
      let patientFile;
      if (existing) {
        console.log('[updatePatientFiles] Updating existing record ID:', existing.id);
        patientFile = await PatientFile.update(existing.id, {
          attachment: updatedFiles,
          user_id: userId
        });
        console.log('[updatePatientFiles] Record updated successfully');
      } else if (newFiles.length > 0 || updatedFiles.length > 0) {
        console.log('[updatePatientFiles] Creating new record');
        patientFile = await PatientFile.create({
          patient_id: patientIdInt,
          attachment: updatedFiles,
          user_id: userId
        });
        console.log('[updatePatientFiles] Record created successfully');
      } else {
        console.log('[updatePatientFiles] No files to update');
        return res.status(400).json({
          success: false,
          message: 'No files to update'
        });
      }

      console.log('[updatePatientFiles] Operation completed successfully');
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