/**
 * Encryption Migration Script
 * 
 * This script converts all VARCHAR columns that store encrypted data to TEXT
 * to accommodate the longer encrypted values.
 * 
 * Encrypted data is typically much longer than the original plaintext,
 * so VARCHAR constraints cause "value too long" errors.
 * 
 * Run with: npm run migrate:encryption
 */

const db = require('../config/database');
const encryptionFields = require('../utils/encryptionFields');

// Map of table names to their encrypted fields
// This maps the encryptionFields configuration to actual database table names
const tableFieldMap = {
  'registered_patient': encryptionFields.patient,
  'clinical_proforma': encryptionFields.clinicalProforma,
  'adl_files': encryptionFields.adlFile,
  'prescriptions': encryptionFields.prescription
};

// Field name mappings (API field name -> database column name)
const fieldMappings = {
  'prescriptions': {
    'qty': 'quantity' // API uses 'qty', database uses 'quantity'
  }
};

async function getColumnType(tableName, columnName) {
  try {
    const query = `
      SELECT data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2;
    `;
    const result = await db.query(query, [tableName, columnName]);
    if (result.rows.length === 0) {
      return null;
    }
    return {
      type: result.rows[0].data_type,
      maxLength: result.rows[0].character_maximum_length
    };
  } catch (error) {
    console.error(`Error checking column ${tableName}.${columnName}:`, error.message);
    return null;
  }
}

async function convertColumnToText(tableName, columnName) {
  try {
    // Check if column exists and is VARCHAR
    const columnInfo = await getColumnType(tableName, columnName);
    
    if (!columnInfo) {
      console.log(`⚠️  Column ${tableName}.${columnName} does not exist, skipping...`);
      return false;
    }
    
    if (columnInfo.type === 'text') {
      console.log(`✓   Column ${tableName}.${columnName} is already TEXT, skipping...`);
      return false;
    }
    
    if (columnInfo.type !== 'character varying') {
      console.log(`⚠️  Column ${tableName}.${columnName} is ${columnInfo.type}, not VARCHAR, skipping...`);
      return false;
    }
    
    // Convert VARCHAR to TEXT
    const alterQuery = `
      ALTER TABLE ${tableName}
      ALTER COLUMN ${columnName} TYPE TEXT;
    `;
    
    console.log(`🔄 Converting ${tableName}.${columnName} from VARCHAR(${columnInfo.maxLength}) to TEXT...`);
    await db.query(alterQuery);
    console.log(`✅ Successfully converted ${tableName}.${columnName} to TEXT`);
    return true;
  } catch (error) {
    console.error(`❌ Error converting ${tableName}.${columnName}:`, error.message);
    throw error;
  }
}

async function runMigration() {
  console.log('🚀 Starting encryption migration...\n');
  console.log('This will convert all VARCHAR columns that store encrypted data to TEXT.\n');
  
  let totalConverted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  try {
    // Process each table
    for (const [tableName, encryptedFields] of Object.entries(tableFieldMap)) {
      console.log(`\n📋 Processing table: ${tableName}`);
      console.log(`   Encrypted fields: ${encryptedFields.length}`);
      
      for (const fieldName of encryptedFields) {
        // Get the actual database column name (handle field mappings)
        const mappings = fieldMappings[tableName] || {};
        const dbColumnName = mappings[fieldName] || fieldName;
        
        try {
          const converted = await convertColumnToText(tableName, dbColumnName);
          if (converted) {
            totalConverted++;
          } else {
            totalSkipped++;
          }
        } catch (error) {
          console.error(`   ❌ Failed to process ${tableName}.${dbColumnName}:`, error.message);
          totalErrors++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Converted: ${totalConverted} columns`);
    console.log(`   ⏭️  Skipped: ${totalSkipped} columns`);
    console.log(`   ❌ Errors: ${totalErrors} columns`);
    console.log('='.repeat(60));
    
    if (totalErrors === 0) {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Migration completed with errors. Please review the output above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };

