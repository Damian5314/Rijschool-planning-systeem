require('dotenv').config()
const { pool } = require('../config/db')

async function updateConstraints() {
  const client = await pool.connect()
  
  try {
    console.log('🔧 Updating database constraints...')
    
    // Drop the old constraint
    await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_rol_check')
    console.log('✅ Old constraint removed')
    
    // Add the new constraint with 'eigenaar' instead of 'admin'
    await client.query(`
      ALTER TABLE users ADD CONSTRAINT users_rol_check 
      CHECK (rol IN ('gebruiker', 'eigenaar', 'instructeur'))
    `)
    console.log('✅ New constraint added')
    
    console.log('🎉 Database constraints updated successfully!')
    
  } catch (error) {
    console.error('❌ Error updating constraints:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run the script
if (require.main === module) {
  updateConstraints()
    .then(() => {
      console.log('✅ Constraint update completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Constraint update failed:', error)
      process.exit(1)
    })
}

module.exports = { updateConstraints }