require('dotenv').config()
const { pool } = require('../config/db')

async function fixStudentConstraints() {
  const client = await pool.connect()
  
  try {
    console.log('🔧 Fixing student status constraints...')
    
    // Drop the old constraint
    await client.query('ALTER TABLE students DROP CONSTRAINT IF EXISTS students_status_check')
    console.log('✅ Old student status constraint removed')
    
    // Add the new constraint with 'Examen' status included
    await client.query(`
      ALTER TABLE students ADD CONSTRAINT students_status_check 
      CHECK (status IN ('Actief', 'Inactief', 'Gepauzeerd', 'Afgestudeerd', 'Examen'))
    `)
    console.log('✅ New student status constraint added (includes Examen)')
    
    console.log('🎉 Student constraints updated successfully!')
    
  } catch (error) {
    console.error('❌ Error fixing student constraints:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run the script
if (require.main === module) {
  fixStudentConstraints()
    .then(() => {
      console.log('✅ Student constraint fix completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Student constraint fix failed:', error)
      process.exit(1)
    })
}

module.exports = { fixStudentConstraints }