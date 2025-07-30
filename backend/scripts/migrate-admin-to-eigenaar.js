require('dotenv').config()
const { pool } = require('../config/db')

async function migrateAdminToEigenaar() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 Migrating admin users to eigenaar...')
    
    // First, check what users exist
    const existingUsers = await client.query('SELECT id, naam, email, rol FROM users')
    console.log('📋 Current users:')
    existingUsers.rows.forEach(user => {
      console.log(`  - ${user.naam} (${user.email}) - ${user.rol}`)
    })
    
    // Update any admin users to eigenaar
    const updateResult = await client.query(`
      UPDATE users SET rol = 'eigenaar' WHERE rol = 'admin'
    `)
    console.log(`✅ Updated ${updateResult.rowCount} admin users to eigenaar`)
    
    // Now add the constraint
    await client.query(`
      ALTER TABLE users ADD CONSTRAINT users_rol_check 
      CHECK (rol IN ('gebruiker', 'eigenaar', 'instructeur'))
    `)
    console.log('✅ New constraint added')
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run the script
if (require.main === module) {
  migrateAdminToEigenaar()
    .then(() => {
      console.log('✅ Migration completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateAdminToEigenaar }