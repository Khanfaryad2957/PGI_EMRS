-- Migration: Create patient_files table
-- Description: Stores patient file attachments with support for multiple files per patient
-- Date: 2025-01-XX

-- Create patient_files table
CREATE TABLE IF NOT EXISTS patient_files (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    attachment TEXT[] NOT NULL DEFAULT '{}',
    role JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_files_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES registered_patient(id) 
        ON DELETE CASCADE
);

-- Create index on patient_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_patient_files_patient_id 
    ON patient_files(patient_id);

-- Create GIN index on role JSONB for efficient queries
CREATE INDEX IF NOT EXISTS idx_patient_files_role 
    ON patient_files USING GIN (role);

-- Create index on created_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_patient_files_created_at 
    ON patient_files(created_at);

-- Add comment to table
COMMENT ON TABLE patient_files IS 'Stores file attachments for patients. Each record can contain multiple file paths in the attachment array.';

-- Add comments to columns
COMMENT ON COLUMN patient_files.id IS 'Primary key';
COMMENT ON COLUMN patient_files.patient_id IS 'Foreign key to registered_patient table';
COMMENT ON COLUMN patient_files.attachment IS 'Array of file paths stored in uploads/patient_files/{patient_id}/';
COMMENT ON COLUMN patient_files.role IS 'JSONB array of user IDs who uploaded/updated files, format: [{ id: 1 }, { id: 2 }]';
COMMENT ON COLUMN patient_files.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN patient_files.updated_at IS 'Timestamp when record was last updated';

