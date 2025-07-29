require('dotenv').config()
const { pool, createTables } = require('../config/db')
const bcrypt = require('bcryptjs')

async function seedDatabase() {
  try {
    console.log('🌱 Database seeding gestart...')
    
    const client = await pool.connect()
    
    // Eerst tabellen maken (via createTables uit db.js)
    await createTables(client)
    
    // Check of er al data is
    const userCheck = await client.query('SELECT COUNT(*) FROM users')
    if (parseInt(userCheck.rows[0].count) > 0) {
      console.log('✅ Database bevat al data, seeding overgeslagen')
      client.release()
      return
    }
    
    console.log('📦 Demo data toevoegen...')
    
    // Seed users (passwords: admin123, instructor123, user123)
    const hashedAdminPassword = await bcrypt.hash('admin123', 12)
    const hashedInstructorPassword = await bcrypt.hash('instructor123', 12)
    const hashedUserPassword = await bcrypt.hash('user123', 12)
    
    await client.query(`
      INSERT INTO users (naam, email, wachtwoord, rol) VALUES 
      ('Admin Gebruiker', 'admin@rijschool.nl', $1, 'admin'),
      ('Jan Janssen', 'jan@rijschool.nl', $2, 'instructeur'),
      ('Piet Peters', 'piet@rijschool.nl', $2, 'instructeur'),
      ('Test Gebruiker', 'test@rijschool.nl', $3, 'gebruiker')
    `, [hashedAdminPassword, hashedInstructorPassword, hashedUserPassword])
    
    // Seed instructeurs
    await client.query(`
      INSERT INTO instructeurs (naam, email, telefoon, rijbewijs_type, status, user_id) VALUES 
      ('Jan Janssen', 'jan@rijschool.nl', '06-12345678', ARRAY['B', 'A'], 'Actief', 2),
      ('Piet Peters', 'piet@rijschool.nl', '06-87654321', ARRAY['B', 'C'], 'Actief', 3)
    `)
    
    // Seed vehicles
    await client.query(`
      INSERT INTO vehicles (merk, model, bouwjaar, kenteken, transmissie, brandstof, kilometerstand, status, instructeur_id) VALUES 
      ('Volkswagen', 'Golf', 2020, '1ABC123', 'Handgeschakeld', 'benzine', 45000, 'beschikbaar', 1),
      ('Toyota', 'Yaris', 2021, '2DEF456', 'Automaat', 'hybride', 32000, 'beschikbaar', 2),
      ('Ford', 'Fiesta', 2019, '3GHI789', 'Handgeschakeld', 'benzine', 67000, 'beschikbaar', 1)
    `)
    
    // Seed students
    await client.query(`
      INSERT INTO students (naam, email, telefoon, adres, postcode, plaats, geboortedatum, rijbewijs_type, transmissie, status, instructeur_id, tegoed) VALUES 
      ('Emma de Vries', 'emma@example.com', '06-11111111', 'Hoofdstraat 1', '1234AB', 'Amsterdam', '2000-01-15', 'B', 'Handgeschakeld', 'Actief', 1, 500.00),
      ('Lucas Bakker', 'lucas@example.com', '06-22222222', 'Kerkstraat 25', '5678CD', 'Utrecht', '1999-05-20', 'B', 'Automaat', 'Actief', 2, 750.00),
      ('Sophie Smit', 'sophie@example.com', '06-33333333', 'Dorpsplein 8', '9012EF', 'Rotterdam', '2001-03-10', 'B', 'Handgeschakeld', 'Actief', 1, 300.00),
      ('Max van Dam', 'max@example.com', '06-44444444', 'Schoollaan 12', '3456GH', 'Den Haag', '2000-11-30', 'B', 'Automaat', 'Gepauzeerd', 2, 150.00)
    `)
    
    // Seed lessons (komende lessen)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    await client.query(`
      INSERT INTO lessons (datum, tijd, duur, student_id, instructeur_id, vehicle_id, type, status, prijs) VALUES 
      ($1, '10:00', 60, 1, 1, 1, 'Rijles', 'Gepland', 45.00),
      ($1, '14:00', 90, 2, 2, 2, 'Rijles', 'Bevestigd', 67.50),
      ($2, '09:00', 60, 3, 1, 1, 'Rijles', 'Gepland', 45.00),
      ($2, '16:00', 60, 4, 2, 2, 'Rijles', 'Gepland', 45.00),
      ($3, '11:00', 120, 1, 1, 1, 'Examen', 'Gepland', 200.00)
    `, [
      tomorrow.toISOString().split('T')[0],
      tomorrow.toISOString().split('T')[0], 
      nextWeek.toISOString().split('T')[0]
    ])
    
    // Seed transacties
    await client.query(`
      INSERT INTO transacties (student_id, bedrag, type, beschrijving, datum) VALUES 
      (1, 500.00, 'betaling', 'Eerste storting', CURRENT_DATE - INTERVAL '5 days'),
      (2, 750.00, 'betaling', 'Pakket rijlessen', CURRENT_DATE - INTERVAL '3 days'),
      (3, 300.00, 'betaling', 'Bijstorting tegoed', CURRENT_DATE - INTERVAL '1 day'),
      (1, -45.00, 'factuur', 'Rijles 15-01-2024', CURRENT_DATE),
      (2, -67.50, 'factuur', 'Rijles 15-01-2024', CURRENT_DATE)
    `)
    
    // Seed examens
    await client.query(`
      INSERT INTO examens (student_id, datum, type, resultaat, opmerkingen) VALUES 
      (1, $1, 'Theorie-examen', 'Geslaagd', 'Eerste poging geslaagd'),
      (2, $2, 'Praktijkexamen', 'Gezakt', 'Inparkeren ging niet goed'),
      (3, $3, 'Theorie-examen', 'Gepland', 'Examen gepland')
    `, [
      new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dagen geleden
      new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 dagen geleden
      new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]   // 7 dagen vooruit
    ])
    
    client.release()
    
    console.log('✅ Database seeding voltooid!')
    console.log('📊 Demo data toegevoegd:')
    console.log('   - 4 gebruikers (admin@rijschool.nl/admin123, jan@rijschool.nl/instructor123)')
    console.log('   - 2 instructeurs')
    console.log('   - 3 voertuigen')
    console.log('   - 4 studenten')
    console.log('   - 5 lessen')
    console.log('   - Financiële transacties')
    console.log('   - Examen resultaten')
    
  } catch (error) {
    console.error('❌ Database seeding fout:', error)
    process.exit(1)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

// Start seeding if called directly
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }