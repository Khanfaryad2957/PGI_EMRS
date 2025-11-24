const path = require('path');

/**
 * Upload Configuration
 * 
 * This file centralizes all upload directory paths.
 * To change upload locations, modify the values below.
 * 
 * All paths are relative to the project root unless specified as absolute paths.
 * Use forward slashes (/) for cross-platform compatibility.
 */

// Base upload directory (relative to project root)
// Change this to modify where all uploads are stored
const UPLOAD_BASE_PATH = process.env.UPLOAD_BASE_PATH || 'uploads';

// Patient file uploads directory
// This is where patient files (documents, images) are stored
const PATIENT_FILES_PATH = process.env.PATIENT_FILES_PATH || `${UPLOAD_BASE_PATH}/patient_files`;

// Legacy patient uploads (for backward compatibility)
const PATIENT_UPLOADS_PATH = process.env.PATIENT_UPLOADS_PATH || `${UPLOAD_BASE_PATH}/patients`;

// Get absolute path for a relative path
const getAbsolutePath = (relativePath) => {
  // If already absolute, return as-is
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  // Otherwise, resolve relative to project root
  return path.join(__dirname, '..', relativePath);
};

// Get relative URL path for serving files
const getUrlPath = (filePath) => {
  // Convert absolute path to relative URL path
  // Remove project root and normalize slashes
  const projectRoot = path.join(__dirname, '..');
  const relativePath = path.relative(projectRoot, filePath);
  // Use forward slashes for URLs
  return '/' + relativePath.replace(/\\/g, '/');
};

module.exports = {
  // Base paths (relative to project root)
  UPLOAD_BASE_PATH,
  PATIENT_FILES_PATH,
  PATIENT_UPLOADS_PATH,
  
  // Absolute paths (for file system operations)
  getAbsolutePath,
  getPatientFilesDir: (patientId, role = null) => {
    const baseDir = getAbsolutePath(PATIENT_FILES_PATH);
    if (role) {
      // Role-based directory structure: patient_files/{role}/{patient_id}/
      const roleFolder = role.replace(/\s+/g, '_');
      return path.join(baseDir, roleFolder, String(patientId));
    }
    // Default structure: patient_files/{patient_id}/
    return path.join(baseDir, String(patientId));
  },
  
  getPatientUploadsDir: (patientId) => {
    return path.join(getAbsolutePath(PATIENT_UPLOADS_PATH), String(patientId));
  },
  
  // URL paths (for serving files)
  getUrlPath,
  getPatientFileUrl: (filePath, role = null) => {
    // If filePath is already a URL path, return as-is
    if (filePath.startsWith('/')) {
      return filePath;
    }
    // Otherwise, convert to URL path
    return getUrlPath(filePath);
  },
  
  // Helper to get base URL path for patient files
  getPatientFilesBaseUrl: (role = null) => {
    if (role) {
      const roleFolder = role.replace(/\s+/g, '_');
      return `/${PATIENT_FILES_PATH}/${roleFolder}`;
    }
    return `/${PATIENT_FILES_PATH}`;
  }
};

