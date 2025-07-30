require('dotenv').config()
const { pool } = require('../config/db')
const bcrypt = require('bcryptjs')

async function insertTestData() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Starting test data insertion...')
    
    // Begin transaction
    await client.query('BEGIN')
    
    // 1. Insert Users
    console.log('👥 Inserting users...')
    const hashedPassword = await bcrypt.hash('test123', 12)
    const eigenaarPassword = await bcrypt.hash('eigenaar123', 12)
    const instructeurPassword = await bcrypt.hash('instructeur123', 12)
    
    const userInsertQuery = `
      INSERT INTO users (naam, email, wachtwoord, rol, actief) VALUES 
      ('Willes van der Berg', 'eigenaar@rijschool.nl', $1, 'eigenaar', true),
      ('Jan Bakker', 'jan.bakker@rijschool.nl', $2, 'instructeur', true),
      ('Lisa de Vries', 'lisa.devries@rijschool.nl', $2, 'instructeur', true),
      ('Mark Peters', 'mark.peters@rijschool.nl', $2, 'instructeur', true),
      ('Sandra Jansen', 'sandra.jansen@rijschool.nl', $2, 'instructeur', true),
      ('Emma van der Berg', 'emma.vandenberg@email.com', $3, 'gebruiker', true),
      ('Tom Jansen', 'tom.jansen@email.com', $3, 'gebruiker', true),
      ('Sophie Willems', 'sophie.willems@email.com', $3, 'gebruiker', true),
      ('David Smit', 'david.smit@email.com', $3, 'gebruiker', true),
      ('Maria Garcia', 'maria.garcia@email.com', $3, 'gebruiker', true),
      ('Peter Visser', 'peter.visser@email.com', $3, 'gebruiker', true),
      ('Anna de Jong', 'anna.dejong@email.com', $3, 'gebruiker', true),
      ('Rick van Dijk', 'rick.vandijk@email.com', $3, 'gebruiker', true)
      ON CONFLICT (email) DO NOTHING
    `
    
    await client.query(userInsertQuery, [eigenaarPassword, instructeurPassword, hashedPassword])
    console.log('✅ Users inserted')
    
    // 2. Insert Instructeurs
    console.log('🚗 Inserting instructeurs...')
    const instructeurInsertQuery = `
      INSERT INTO instructeurs (naam, email, telefoon, rijbewijs_type, status, user_id) VALUES 
      ('Jan Bakker', 'jan.bakker@rijschool.nl', '06-12345678', ARRAY['B', 'A'], 'Actief', 
        (SELECT id FROM users WHERE email = 'jan.bakker@rijschool.nl')),
      ('Lisa de Vries', 'lisa.devries@rijschool.nl', '06-87654321', ARRAY['B'], 'Actief', 
        (SELECT id FROM users WHERE email = 'lisa.devries@rijschool.nl')),
      ('Mark Peters', 'mark.peters@rijschool.nl', '06-11223344', ARRAY['B', 'C'], 'Actief', 
        (SELECT id FROM users WHERE email = 'mark.peters@rijschool.nl')),
      ('Sandra Jansen', 'sandra.jansen@rijschool.nl', '06-55667788', ARRAY['B'], 'Actief', 
        (SELECT id FROM users WHERE email = 'sandra.jansen@rijschool.nl'))
      ON CONFLICT (email) DO NOTHING
    `
    
    await client.query(instructeurInsertQuery)
    console.log('✅ Instructeurs inserted')
    
    // 3. Insert Students
    console.log('👨‍🎓 Inserting students...')
    const studentInsertQuery = `
      INSERT INTO students (naam, email, telefoon, adres, postcode, plaats, geboortedatum, 
                           rijbewijs_type, transmissie, status, instructeur_id, tegoed, 
                           openstaand_bedrag, laatste_betaling, user_id) VALUES 
      ('Emma van der Berg', 'emma.vandenberg@email.com', '06-12345678', 'Hoofdstraat 123', 
       '1234 AB', 'Amsterdam', '2005-03-15', 'B', 'Automaat', 'Actief', 
       (SELECT id FROM instructeurs WHERE naam = 'Jan Bakker'), 150.00, 0.00, '2024-07-20',
       (SELECT id FROM users WHERE email = 'emma.vandenberg@email.com')),
      
      ('Tom Jansen', 'tom.jansen@email.com', '06-87654321', 'Kerkstraat 45', 
       '5678 CD', 'Rotterdam', '2004-11-22', 'B', 'Handgeschakeld', 'Examen', 
       (SELECT id FROM instructeurs WHERE naam = 'Lisa de Vries'), 75.50, 25.00, '2024-06-15',
       (SELECT id FROM users WHERE email = 'tom.jansen@email.com')),
      
      ('Sophie Willems', 'sophie.willems@email.com', '06-11223344', 'Dorpsstraat 67', 
       '9012 EF', 'Utrecht', '2005-08-10', 'B', 'Automaat', 'Actief', 
       (SELECT id FROM instructeurs WHERE naam = 'Mark Peters'), 200.00, 0.00, '2024-07-25',
       (SELECT id FROM users WHERE email = 'sophie.willems@email.com')),
      
      ('David Smit', 'david.smit@email.com', '06-55667788', 'Schoolstraat 89', 
       '3456 GH', 'Den Haag', '2003-12-05', 'B', 'Handgeschakeld', 'Afgestudeerd', 
       (SELECT id FROM instructeurs WHERE naam = 'Jan Bakker'), 0.00, 0.00, '2024-05-20',
       (SELECT id FROM users WHERE email = 'david.smit@email.com')),
      
      ('Maria Garcia', 'maria.garcia@email.com', '06-99887766', 'Lindelaan 234', 
       '2468 XY', 'Haarlem', '2006-01-20', 'B', 'Automaat', 'Actief', 
       (SELECT id FROM instructeurs WHERE naam = 'Sandra Jansen'), 125.75, 0.00, '2024-07-18',
       (SELECT id FROM users WHERE email = 'maria.garcia@email.com')),
      
      ('Peter Visser', 'peter.visser@email.com', '06-44556677', 'Eikenlaan 56', 
       '7890 QR', 'Eindhoven', '2004-06-08', 'B', 'Handgeschakeld', 'Actief', 
       (SELECT id FROM instructeurs WHERE naam = 'Lisa de Vries'), 87.25, 12.50, '2024-07-10',
       (SELECT id FROM users WHERE email = 'peter.visser@email.com')),
      
      ('Anna de Jong', 'anna.dejong@email.com', '06-33221100', 'Rozenlaan 78', 
       '1357 ST', 'Groningen', '2005-09-14', 'B', 'Automaat', 'Gepauzeerd', 
       (SELECT id FROM instructeurs WHERE naam = 'Mark Peters'), 45.00, 35.00, '2024-06-02',
       (SELECT id FROM users WHERE email = 'anna.dejong@email.com')),
      
      ('Rick van Dijk', 'rick.vandijk@email.com', '06-77889900', 'Molenlaan 101', 
       '2468 UV', 'Tilburg', '2003-04-25', 'B', 'Handgeschakeld', 'Actief', 
       (SELECT id FROM instructeurs WHERE naam = 'Sandra Jansen'), 95.50, 0.00, '2024-07-22',
       (SELECT id FROM users WHERE email = 'rick.vandijk@email.com'))
      ON CONFLICT (email) DO NOTHING
    `
    
    await client.query(studentInsertQuery)
    console.log('✅ Students inserted')
    
    // 4. Insert Vehicles
    console.log('🚙 Inserting vehicles...')
    const vehicleInsertQuery = `
      INSERT INTO vehicles (merk, model, bouwjaar, kenteken, transmissie, brandstof, 
                           kilometerstand, laatste_onderhoud, volgende_onderhoud, apk_datum, 
                           status, instructeur_id) VALUES 
      ('Volkswagen', 'Polo', 2022, '1-ABC-23', 'Handgeschakeld', 'benzine', 
       15420, '2024-06-15', '2024-12-15', '2025-03-20', 'beschikbaar', 
       (SELECT id FROM instructeurs WHERE naam = 'Jan Bakker')),
      
      ('Toyota', 'Yaris', 2021, '2-DEF-45', 'Automaat', 'hybride', 
       28750, '2024-05-20', '2024-11-20', '2025-01-15', 'beschikbaar', 
       (SELECT id FROM instructeurs WHERE naam = 'Lisa de Vries')),
      
      ('Ford', 'Fiesta', 2023, '3-GHI-67', 'Handgeschakeld', 'benzine', 
       8930, '2024-07-10', '2025-01-10', '2025-08-12', 'beschikbaar', 
       (SELECT id FROM instructeurs WHERE naam = 'Mark Peters')),
      
      ('Opel', 'Corsa', 2020, '4-JKL-89', 'Automaat', 'benzine', 
       45230, '2024-04-25', '2024-10-25', '2024-12-18', 'onderhoud', 
       (SELECT id FROM instructeurs WHERE naam = 'Sandra Jansen')),
      
      ('Renault', 'Clio', 2022, '5-MNO-12', 'Handgeschakeld', 'diesel', 
       22100, '2024-06-30', '2024-12-30', '2025-04-22', 'beschikbaar', NULL),
      
      ('Peugeot', '208', 2021, '6-PQR-34', 'Automaat', 'elektrisch', 
       18650, '2024-07-05', '2025-01-05', '2025-02-28', 'beschikbaar', NULL)
    `
    
    await client.query(vehicleInsertQuery)
    console.log('✅ Vehicles inserted')
    
    // 5. Insert Lessons
    console.log('📚 Inserting lessons...')
    const lessonInsertQuery = `
      INSERT INTO lessons (datum, tijd, duur, student_id, instructeur_id, vehicle_id, 
                          type, status, opmerkingen, prijs) VALUES 
      -- Emma's lessen
      ('2024-07-15', '09:00', 60, 
       (SELECT id FROM students WHERE naam = 'Emma van der Berg'),
       (SELECT id FROM instructeurs WHERE naam = 'Jan Bakker'),
       (SELECT id FROM vehicles WHERE kenteken = '1-ABC-23'),
       'Rijles', 'Voltooid', 'Goed geoefend met parkeren', 45.00),
      
      ('2024-07-22', '10:00', 60, 
       (SELECT id FROM students WHERE naam = 'Emma van der Berg'),
       (SELECT id FROM instructeurs WHERE naam = 'Jan Bakker'),
       (SELECT id FROM vehicles WHERE kenteken = '1-ABC-23'),
       'Rijles', 'Voltooid', 'Voorrangsregels doorgenomen', 45.00),
      
      ('2024-07-29', '14:00', 60, 
       (SELECT id FROM students WHERE naam = 'Emma van der Berg'),
       (SELECT id FROM instructeurs WHERE naam = 'Jan Bakker'),
       (SELECT id FROM vehicles WHERE kenteken = '1-ABC-23'),
       'Rijles', 'Gepland', NULL, 45.00),
      
      -- Tom's lessen
      ('2024-07-18', '11:00', 90, 
       (SELECT id FROM students WHERE naam = 'Tom Jansen'),
       (SELECT id FROM instructeurs WHERE naam = 'Lisa de Vries'),
       (SELECT id FROM vehicles WHERE kenteken = '2-DEF-45'),
       'Examen', 'Voltooid', 'Examen simulatie - goed gegaan', 65.00),
      
      ('2024-07-25', '13:00', 60, 
       (SELECT id FROM students WHERE naam = 'Tom Jansen'),
       (SELECT id FROM instructeurs WHERE naam = 'Lisa de Vries'),
       (SELECT id FROM vehicles WHERE kenteken = '2-DEF-45'),
       'Rijles', 'Voltooid', 'Laatste voorbereiding voor examen', 45.00),
      
      -- Sophie's lessen
      ('2024-07-20', '15:00', 60, 
       (SELECT id FROM students WHERE naam = 'Sophie Willems'),
       (SELECT id FROM instructeurs WHERE naam = 'Mark Peters'),
       (SELECT id FROM vehicles WHERE kenteken = '3-GHI-67'),
       'Rijles', 'Voltooid', 'Eerste les - basis controles', 45.00),
      
      ('2024-07-27', '16:00', 60, 
       (SELECT id FROM students WHERE naam = 'Sophie Willems'),
       (SELECT id FROM instructeurs WHERE naam = 'Mark Peters'),
       (SELECT id FROM vehicles WHERE kenteken = '3-GHI-67'),
       'Rijles', 'Gepland', NULL, 45.00),
      
      -- Maria's lessen
      ('2024-07-19', '09:30', 60, 
       (SELECT id FROM students WHERE naam = 'Maria Garcia'),
       (SELECT id FROM instructeurs WHERE naam = 'Sandra Jansen'),
       (SELECT id FROM vehicles WHERE kenteken = '4-JKL-89'),
       'Intake', 'Voltooid', 'Kennismaking en intake gesprek', 35.00),
      
      -- Peter's lessen
      ('2024-07-21', '14:30', 60, 
       (SELECT id FROM students WHERE naam = 'Peter Visser'),
       (SELECT id FROM instructeurs WHERE naam = 'Lisa de Vries'),
       (SELECT id FROM vehicles WHERE kenteken = '2-DEF-45'),
       'Rijles', 'Voltooid', 'Rotonde rijden geoefend', 45.00),
      
      -- Rick's lessen
      ('2024-07-23', '11:30', 60, 
       (SELECT id FROM students WHERE naam = 'Rick van Dijk'),
       (SELECT id FROM instructeurs WHERE naam = 'Sandra Jansen'),
       (SELECT id FROM vehicles WHERE kenteken = '5-MNO-12'),
       'Rijles', 'Voltooid', 'Snelweg rijden voor het eerst', 45.00),
      
      -- Toekomstige lessen
      ('2024-08-05', '10:00', 60, 
       (SELECT id FROM students WHERE naam = 'Emma van der Berg'),
       (SELECT id FROM instructeurs WHERE naam = 'Jan Bakker'),
       (SELECT id FROM vehicles WHERE kenteken = '1-ABC-23'),
       'Rijles', 'Gepland', NULL, 45.00),
      
      ('2024-08-05', '14:00', 60, 
       (SELECT id FROM students WHERE naam = 'Sophie Willems'),
       (SELECT id FROM instructeurs WHERE naam = 'Mark Peters'),
       (SELECT id FROM vehicles WHERE kenteken = '3-GHI-67'),
       'Rijles', 'Gepland', NULL, 45.00)
    `
    
    await client.query(lessonInsertQuery)
    console.log('✅ Lessons inserted')
    
    // 6. Insert Examens
    console.log('🎓 Inserting examens...')
    const examenInsertQuery = `
      INSERT INTO examens (student_id, datum, type, resultaat, opmerkingen) VALUES 
      ((SELECT id FROM students WHERE naam = 'David Smit'), 
       '2024-05-15', 'Praktijkexamen', 'Geslaagd', 'Uitstekend gereden, geen fouten'),
      
      ((SELECT id FROM students WHERE naam = 'Tom Jansen'), 
       '2024-08-10', 'Praktijkexamen', 'Gepland', 'Eerste examenpoging'),
      
      ((SELECT id FROM students WHERE naam = 'Anna de Jong'), 
       '2024-06-20', 'Praktijkexamen', 'Gezakt', 'Problemen met parkeren en voorrang - 8 foutpunten')
    `
    
    await client.query(examenInsertQuery)
    console.log('✅ Examens inserted')
    
    // 7. Insert Les Geschiedenis
    console.log('📖 Inserting les geschiedenis...')
    const lesGeschiedenisQuery = `
      INSERT INTO les_geschiedenis (student_id, lesson_id, datum, duur, opmerkingen) VALUES 
      ((SELECT id FROM students WHERE naam = 'Emma van der Berg'), 
       (SELECT id FROM lessons WHERE datum = '2024-07-15' AND tijd = '09:00'), 
       '2024-07-15', 60, 'Eerste echte rijles - goed begin'),
      
      ((SELECT id FROM students WHERE naam = 'Tom Jansen'), 
       (SELECT id FROM lessons WHERE datum = '2024-07-18' AND tijd = '11:00'), 
       '2024-07-18', 90, 'Examen simulatie succesvol afgerond'),
      
      ((SELECT id FROM students WHERE naam = 'David Smit'), 
       NULL, '2024-05-10', 60, 'Laatste les voor het examen - alles onder controle')
    `
    
    await client.query(lesGeschiedenisQuery)
    console.log('✅ Les geschiedenis inserted')
    
    // 8. Insert Transacties
    console.log('💰 Inserting transacties...')
    const transactieInsertQuery = `
      INSERT INTO transacties (student_id, bedrag, type, beschrijving, datum) VALUES 
      -- Emma's transacties
      ((SELECT id FROM students WHERE naam = 'Emma van der Berg'), 
       200.00, 'betaling', 'Startpakket - 4 rijlessen', '2024-07-10'),
      ((SELECT id FROM students WHERE naam = 'Emma van der Berg'), 
       -45.00, 'factuur', 'Rijles 15 juli 2024', '2024-07-15'),
      ((SELECT id FROM students WHERE naam = 'Emma van der Berg'), 
       -45.00, 'factuur', 'Rijles 22 juli 2024', '2024-07-22'),
      
      -- Tom's transacties
      ((SELECT id FROM students WHERE naam = 'Tom Jansen'), 
       150.00, 'betaling', 'Bijbetaling tegoed', '2024-06-15'),
      ((SELECT id FROM students WHERE naam = 'Tom Jansen'), 
       -65.00, 'factuur', 'Examen simulatie', '2024-07-18'),
      ((SELECT id FROM students WHERE naam = 'Tom Jansen'), 
       -45.00, 'factuur', 'Rijles 25 juli 2024', '2024-07-25'),
      
      -- Sophie's transacties
      ((SELECT id FROM students WHERE naam = 'Sophie Willems'), 
       250.00, 'betaling', 'Startpakket - 5 rijlessen', '2024-07-15'),
      ((SELECT id FROM students WHERE naam = 'Sophie Willems'), 
       -45.00, 'factuur', 'Eerste rijles', '2024-07-20'),
      
      -- Maria's transacties
      ((SELECT id FROM students WHERE naam = 'Maria Garcia'), 
       160.00, 'betaling', 'Intake + 3 rijlessen', '2024-07-18'),
      ((SELECT id FROM students WHERE naam = 'Maria Garcia'), 
       -35.00, 'factuur', 'Intake gesprek', '2024-07-19'),
      
      -- Peter's transacties
      ((SELECT id FROM students WHERE naam = 'Peter Visser'), 
       135.00, 'betaling', '3 rijlessen', '2024-07-10'),
      ((SELECT id FROM students WHERE naam = 'Peter Visser'), 
       -45.00, 'factuur', 'Rijles 21 juli 2024', '2024-07-21'),
      
      -- Rick's transacties
      ((SELECT id FROM students WHERE naam = 'Rick van Dijk'), 
       140.00, 'betaling', 'Startpakket', '2024-07-22'),
      ((SELECT id FROM students WHERE naam = 'Rick van Dijk'), 
       -45.00, 'factuur', 'Rijles 23 juli 2024', '2024-07-23'),
      
      -- Anna's transacties (met openstaand bedrag)
      ((SELECT id FROM students WHERE naam = 'Anna de Jong'), 
       80.00, 'betaling', 'Gedeeltelijke betaling', '2024-06-02'),
      ((SELECT id FROM students WHERE naam = 'Anna de Jong'), 
       -45.00, 'factuur', 'Rijles voor examen', '2024-06-18'),
      ((SELECT id FROM students WHERE naam = 'Anna de Jong'), 
       -35.00, 'factuur', 'Administratiekosten examen', '2024-06-20')
    `
    
    await client.query(transactieInsertQuery)
    console.log('✅ Transacties inserted')
    
    // Commit transaction
    await client.query('COMMIT')
    
    console.log('🎉 Test data insertion completed successfully!')
    console.log('')
    console.log('📊 Summary:')
    console.log('👥 Users: 13 (1 eigenaar, 4 instructeurs, 8 studenten)')
    console.log('🚗 Instructeurs: 4')
    console.log('👨‍🎓 Students: 8')
    console.log('🚙 Vehicles: 6')
    console.log('📚 Lessons: 12')
    console.log('🎓 Examens: 3')
    console.log('📖 Les geschiedenis: 3')
    console.log('💰 Transacties: 17')
    console.log('')
    console.log('🔐 Login credentials:')
    console.log('Eigenaar: eigenaar@rijschool.nl / eigenaar123')
    console.log('Instructeur: jan.bakker@rijschool.nl / instructeur123')
    console.log('Student: emma.vandenberg@email.com / test123')
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error inserting test data:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run the script
if (require.main === module) {
  insertTestData()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}

module.exports = { insertTestData }