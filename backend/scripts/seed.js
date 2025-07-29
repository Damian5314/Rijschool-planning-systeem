require("dotenv").config()
const { pool } = require("../config/db")
const bcrypt = require("bcryptjs")

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await pool.query('DELETE FROM transacties')
    await pool.query('DELETE FROM examens')
    await pool.query('DELETE FROM les_geschiedenis') 
    await pool.query('DELETE FROM lessons')
    await pool.query('DELETE FROM vehicles')
    await pool.query('DELETE FROM students')
    await pool.query('DELETE FROM instructeurs')
    await pool.query('DELETE FROM users WHERE email != $1', ['admin@rijschool.nl']) // Keep default admin
    console.log('✅ Existing data cleared.')

    // Create test users
    console.log('👥 Creating test users...')
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const userQueries = [
      {
        query: `INSERT INTO users (naam, email, wachtwoord, rol) VALUES ($1, $2, $3, $4) 
                ON CONFLICT (email) DO UPDATE SET 
                naam = EXCLUDED.naam, wachtwoord = EXCLUDED.wachtwoord, rol = EXCLUDED.rol
                RETURNING id`,
        values: ['Beheerder', 'admin@rijschool.nl', await bcrypt.hash('admin123', 12), 'admin']
      },
      {
        query: `INSERT INTO users (naam, email, wachtwoord, rol) VALUES ($1, $2, $3, $4) RETURNING id`,
        values: ['Gewone Gebruiker', 'gebruiker@rijschool.nl', hashedPassword, 'gebruiker']
      },
      {
        query: `INSERT INTO users (naam, email, wachtwoord, rol) VALUES ($1, $2, $3, $4) RETURNING id`,
        values: ['Instructeur User', 'instructeur@rijschool.nl', hashedPassword, 'instructeur']
      }
    ]

    const users = []
    for (const userQuery of userQueries) {
      const result = await pool.query(userQuery.query, userQuery.values)
      users.push(result.rows[0])
    }
    console.log('✅ Test users created.')

    // Create test instructeurs
    console.log('👨‍🏫 Creating test instructeurs...')
    const instructeurQueries = [
      {
        query: `INSERT INTO instructeurs (naam, email, telefoon, rijbewijs_type, status, user_id) 
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        values: ['Jan Bakker', 'jan.bakker@rijschool.nl', '0612345678', ['B', 'A'], 'Actief', users[2].id]
      },
      {
        query: `INSERT INTO instructeurs (naam, email, telefoon, rijbewijs_type, status) 
                VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        values: ['Lisa de Vries', 'lisa.devries@rijschool.nl', '0687654321', ['B'], 'Actief']
      },
      {
        query: `INSERT INTO instructeurs (naam, email, telefoon, rijbewijs_type, status) 
                VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        values: ['Mark Peters', 'mark.peters@rijschool.nl', '0611223344', ['B', 'C'], 'Actief']
      },
      {
        query: `INSERT INTO instructeurs (naam, email, telefoon, rijbewijs_type, status) 
                VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        values: ['Sarah Jansen', 'sarah.jansen@rijschool.nl', '0655443322', ['B'], 'Inactief']
      }
    ]

    const instructeurs = []
    for (const instructeurQuery of instructeurQueries) {
      const result = await pool.query(instructeurQuery.query, instructeurQuery.values)
      instructeurs.push(result.rows[0])
    }
    console.log('✅ Test instructeurs created.')

    // Create test vehicles
    console.log('🚗 Creating test vehicles...')
    const vehicleQueries = [
      {
        query: `INSERT INTO vehicles (merk, model, bouwjaar, kenteken, transmissie, brandstof, 
                kilometerstand, laatste_onderhoud, volgende_onderhoud, apk_datum, status, instructeur_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        values: ['Volkswagen', 'Golf', 2020, 'AB123CD', 'Handgeschakeld', 'benzine', 
                50000, '2024-01-15', '2025-01-15', '2025-03-01', 'beschikbaar', instructeurs[0].id]
      },
      {
        query: `INSERT INTO vehicles (merk, model, bouwjaar, kenteken, transmissie, brandstof, 
                kilometerstand, laatste_onderhoud, volgende_onderhoud, apk_datum, status, instructeur_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        values: ['Toyota', 'Yaris', 2022, 'EF456GH', 'Automaat', 'hybride', 
                15000, '2024-05-20', '2025-05-20', '2026-07-01', 'beschikbaar', instructeurs[1].id]
      },
      {
        query: `INSERT INTO vehicles (merk, model, bouwjaar, kenteken, transmissie, brandstof, 
                kilometerstand, laatste_onderhoud, volgende_onderhoud, apk_datum, status, instructeur_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        values: ['Mercedes-Benz', 'Actros', 2018, 'IJ789KL', 'Automaat', 'diesel', 
                200000, '2024-02-10', '2025-02-10', '2025-04-15', 'onderhoud', instructeurs[2].id]
      },
      {
        query: `INSERT INTO vehicles (merk, model, bouwjaar, kenteken, transmissie, brandstof, 
                kilometerstand, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        values: ['Peugeot', '208', 2021, 'MN012OP', 'Automaat', 'elektrisch', 25000, 'beschikbaar']
      }
    ]

    const vehicles = []
    for (const vehicleQuery of vehicleQueries) {
      const result = await pool.query(vehicleQuery.query, vehicleQuery.values)
      vehicles.push(result.rows[0])
    }
    console.log('✅ Test vehicles created.')

    // Create test students
    console.log('👨‍🎓 Creating test students...')
    const studentQueries = [
      {
        query: `INSERT INTO students (naam, email, telefoon, adres, postcode, plaats, geboortedatum, 
                rijbewijs_type, transmissie, status, instructeur_id, tegoed, openstaand_bedrag, laatste_betaling) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
        values: ['Emma van der Berg', 'emma.vanderberg@example.com', '0611223344', 'Kerkstraat 1', 
                '1000AA', 'Amsterdam', '2005-03-15', 'B', 'Handgeschakeld', 'Actief', 
                instructeurs[0].id, 15.00, 150.00, '2024-06-10']
      },
      {
        query: `INSERT INTO students (naam, email, telefoon, adres, postcode, plaats, geboortedatum, 
                rijbewijs_type, transmissie, status, instructeur_id, tegoed, openstaand_bedrag, laatste_betaling) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
        values: ['Tom Jansen', 'tom.jansen@example.com', '0655667788', 'Stationsplein 5', 
                '3000BB', 'Rotterdam', '2004-11-22', 'B', 'Automaat', 'Actief', 
                instructeurs[1].id, 8.00, 0.00, '2024-06-25']
      },
      {
        query: `INSERT INTO students (naam, email, telefoon, adres, postcode, plaats, geboortedatum, 
                rijbewijs_type, transmissie, status, instructeur_id, tegoed, openstaand_bedrag, laatste_betaling) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
        values: ['Sophie Willems', 'sophie.willems@example.com', '0699887766', 'Dorpsstraat 12', 
                '5000CC', 'Tilburg', '2006-01-01', 'B', 'Handgeschakeld', 'Gepauzeerd', 
                instructeurs[0].id, 5.00, 50.00, '2024-05-01']
      },
      {
        query: `INSERT INTO students (naam, email, telefoon, adres, postcode, plaats, geboortedatum, 
                rijbewijs_type, transmissie, status, instructeur_id, tegoed, openstaand_bedrag) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        values: ['Mike van Dijk', 'mike.vandijk@example.com', '0644556677', 'Hoofdstraat 88', 
                '4000DD', 'Den Haag', '2003-08-12', 'B', 'Automaat', 'Actief', 
                instructeurs[1].id, 12.00, 200.00]
      },
      {
        query: `INSERT INTO students (naam, email, telefoon, adres, postcode, plaats, geboortedatum, 
                rijbewijs_type, transmissie, status, tegoed, openstaand_bedrag) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        values: ['Anna de Boer', 'anna.deboer@example.com', '0633445566', 'Parkweg 33', 
                '6000EE', 'Utrecht', '2005-12-05', 'B', 'Handgeschakeld', 'Afgestudeerd', 
                0.00, 0.00]
      }
    ]

    const students = []
    for (const studentQuery of studentQueries) {
      const result = await pool.query(studentQuery.query, studentQuery.values)
      students.push(result.rows[0])
    }
    console.log('✅ Test students created.')

    // Create test lessons
    console.log('📚 Creating test lessons...')
    const lessonQueries = [
      {
        query: `INSERT INTO lessons (datum, tijd, duur, student_id, instructeur_id, vehicle_id, type, status, opmerkingen, prijs) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        values: ['2024-12-22', '09:00', 60, students[0].id, instructeurs[0].id, vehicles[0].id, 
                'Rijles', 'Gepland', 'Voorbereiding op praktijkexamen', 45.00]
      },
      {
        query: `INSERT INTO lessons (datum, tijd, duur, student_id, instructeur_id, vehicle_id, type, status, opmerkingen, prijs) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        values: ['2024-12-23', '10:30', 90, students[1].id, instructeurs[1].id, vehicles[1].id, 
                'Rijles', 'Bevestigd', 'Snelweg rijden', 65.00]
      },
      {
        query: `INSERT INTO lessons (datum, tijd, duur, student_id, instructeur_id, vehicle_id, type, status, opmerkingen, prijs) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        values: ['2024-12-24', '13:00', 60, students[0].id, instructeurs[0].id, vehicles[0].id, 
                'Rijles', 'Gepland', 'Bijzondere verrichtingen', 45.00]
      },
      {
        query: `INSERT INTO lessons (datum, tijd, duur, student_id, instructeur_id, type, status, opmerkingen, prijs) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        values: ['2024-11-15', '14:00', 60, students[1].id, instructeurs[1].id, 
                'Rijles', 'Voltooid', 'Stadrijden geoefend', 45.00]
      },
      {
        query: `INSERT INTO lessons (datum, tijd, duur, student_id, instructeur_id, type, status, opmerkingen, prijs) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        values: ['2024-11-20', '11:00', 90, students[3].id, instructeurs[1].id, 
                'Examen', 'Voltooid', 'Praktijkexamen geslaagd!', 120.00]
      },
      {
        query: `INSERT INTO lessons (datum, tijd, duur, student_id, instructeur_id, vehicle_id, type, status, opmerkingen, prijs) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        values: ['2025-01-08', '15:30', 60, students[3].id, instructeurs[1].id, vehicles[1].id, 
                'Rijles', 'Gepland', 'Herhalingles na vakantie', 45.00]
      }
    ]

    const lessons = []
    for (const lessonQuery of lessonQueries) {
      const result = await pool.query(lessonQuery.query, lessonQuery.values)
      lessons.push(result.rows[0])
    }
    console.log('✅ Test lessons created.')

    // Create lesson history for completed lessons
    console.log('📝 Creating lesson history...')
    const historyQueries = [
      {
        query: `INSERT INTO les_geschiedenis (student_id, lesson_id, datum, duur, opmerkingen) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[1].id, lessons[3].id, '2024-11-15', 60, 'Stadrijden geoefend']
      },
      {
        query: `INSERT INTO les_geschiedenis (student_id, lesson_id, datum, duur, opmerkingen) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[3].id, lessons[4].id, '2024-11-20', 90, 'Praktijkexamen geslaagd!']
      }
    ]

    for (const historyQuery of historyQueries) {
      await pool.query(historyQuery.query, historyQuery.values)
    }
    console.log('✅ Lesson history created.')

    // Create test examens
    console.log('📋 Creating test examens...')
    const examenQueries = [
      {
        query: `INSERT INTO examens (student_id, datum, type, resultaat, opmerkingen) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[0].id, '2024-07-20', 'Theorie', 'Geslaagd', 'Eerste keer geslaagd']
      },
      {
        query: `INSERT INTO examens (student_id, datum, type, resultaat, opmerkingen) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[1].id, '2024-08-15', 'Theorie', 'Geslaagd', 'Goed voorbereid']
      },
      {
        query: `INSERT INTO examens (student_id, datum, type, resultaat, opmerkingen) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[3].id, '2024-11-20', 'Praktijk', 'Geslaagd', 'Uitstekend gereden']
      },
      {
        query: `INSERT INTO examens (student_id, datum, type, resultaat, opmerkingen) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[4].id, '2024-10-10', 'Praktijk', 'Geslaagd', 'Perfect uitgevoerd']
      },
      {
        query: `INSERT INTO examens (student_id, datum, type, resultaat) 
                VALUES ($1, $2, $3, $4)`,
        values: [students[2].id, '2025-02-15', 'Theorie', 'Gepland']
      }
    ]

    for (const examenQuery of examenQueries) {
      await pool.query(examenQuery.query, examenQuery.values)
    }
    console.log('✅ Test examens created.')

    // Create test financial transactions
    console.log('💰 Creating test transactions...')
    const transactionQueries = [
      {
        query: `INSERT INTO transacties (student_id, bedrag, type, beschrijving, datum) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[0].id, 300.00, 'factuur', 'Lesenpakket 10 lessen', '2024-06-01']
      },
      {
        query: `INSERT INTO transacties (student_id, bedrag, type, beschrijving, datum) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[0].id, -150.00, 'betaling', 'Gedeeltelijke betaling', '2024-06-10']
      },
      {
        query: `INSERT INTO transacties (student_id, bedrag, type, beschrijving, datum) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[1].id, 450.00, 'factuur', 'Lesenpakket 15 lessen', '2024-06-15']
      },
      {
        query: `INSERT INTO transacties (student_id, bedrag, type, beschrijving, datum) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[1].id, -450.00, 'betaling', 'Volledige betaling', '2024-06-25']
      },
      {
        query: `INSERT INTO transacties (student_id, bedrag, type, beschrijving, datum) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[3].id, 250.00, 'factuur', 'Extra lessen voor examen', '2024-11-01']
      },
      {
        query: `INSERT INTO transacties (student_id, bedrag, type, beschrijving, datum) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[3].id, -50.00, 'betaling', 'Gedeeltelijke betaling', '2024-11-05']
      },
      {
        query: `INSERT INTO transacties (student_id, bedrag, type, beschrijving, datum) 
                VALUES ($1, $2, $3, $4, $5)`,
        values: [students[2].id, -25.00, 'korting', 'Studentenkorting', '2024-05-15']
      }
    ]

    for (const transactionQuery of transactionQueries) {
      await pool.query(transactionQuery.query, transactionQuery.values)
    }
    console.log('✅ Test transactions created.')

    // Get statistics
    const stats = await getSeederStats()
    
    console.log('🎉 ===================================')
    console.log('🌱 DATABASE SEEDING COMPLETED!')
    console.log('🎉 ===================================')
    console.log(`👥 Users: ${stats.users}`)
    console.log(`👨‍🏫 Instructeurs: ${stats.instructeurs}`)
    console.log(`👨‍🎓 Students: ${stats.students}`)
    console.log(`🚗 Vehicles: ${stats.vehicles}`)
    console.log(`📚 Lessons: ${stats.lessons}`)
    console.log(`📋 Examens: ${stats.examens}`)
    console.log(`💰 Transactions: ${stats.transactions}`)
    console.log('🎉 ===================================')
    console.log('🔐 Test Accounts:')
    console.log('   Admin: admin@rijschool.nl / admin123')
    console.log('   User: gebruiker@rijschool.nl / password123')
    console.log('   Instructeur: instructeur@rijschool.nl / password123')
    console.log('🎉 ===================================')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Get statistics after seeding
const getSeederStats = async () => {
  try {
    const queries = [
      'SELECT COUNT(*) as count FROM users',
      'SELECT COUNT(*) as count FROM instructeurs', 
      'SELECT COUNT(*) as count FROM students',
      'SELECT COUNT(*) as count FROM vehicles',
      'SELECT COUNT(*) as count FROM lessons',
      'SELECT COUNT(*) as count FROM examens',
      'SELECT COUNT(*) as count FROM transacties'
    ]
    
    const results = await Promise.all(queries.map(query => pool.query(query)))
    
    return {
      users: results[0].rows[0].count,
      instructeurs: results[1].rows[0].count,
      students: results[2].rows[0].count,
      vehicles: results[3].rows[0].count,
      lessons: results[4].rows[0].count,
      examens: results[5].rows[0].count,
      transactions: results[6].rows[0].count
    }
  } catch (error) {
    console.error('Error getting stats:', error)
    return {
      users: '?', instructeurs: '?', students: '?', 
      vehicles: '?', lessons: '?', examens: '?', transactions: '?'
    }
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedData()
}

module.exports = { seedData, getSeederStats }