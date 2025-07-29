require('dotenv').config()
const { Pool } = require('pg')

// Maak connection pool voor Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // maximum aantal verbindingen in de pool
  idleTimeoutMillis: 30000, // hoe lang een verbinding idle mag zijn
  connectionTimeoutMillis: 2000, // hoe lang wachten op een verbinding
})

// Test database connectie en maak tabellen als ze niet bestaan
async function testConnection() {
  try {
    const client = await pool.connect()
    console.log('✅ Verbonden met Neon PostgreSQL database')
    
    // Test query
    const result = await client.query('SELECT NOW()')
    console.log('Database tijd:', result.rows[0].now)
    
    // Controleer of tabellen bestaan, zo niet maak ze aan
    await createTablesIfNotExist(client)
    
    client.release()
  } catch (err) {
    console.error('❌ Database verbinding fout:', err.message)
    console.warn('⚠️ Server draait zonder database verbinding - controleer DATABASE_URL in .env')
    // Continue without database for now
  }
}

// Automatisch tabellen aanmaken als ze niet bestaan
async function createTablesIfNotExist(client) {
  try {
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `)
    
    if (!tableCheck.rows[0].exists) {
      console.log('📋 Creëren van database tabellen...')
      await createTables(client)
      console.log('✅ Database tabellen succesvol aangemaakt!')
    }
  } catch (err) {
    console.error('❌ Error bij tabel creatie:', err.message)
  }
}

// SQL queries om alle tabellen aan te maken
async function createTables(client) {
  const createTablesQuery = `
    -- Users tabel voor authenticatie
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      naam VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      wachtwoord VARCHAR(255) NOT NULL,
      rol VARCHAR(50) DEFAULT 'gebruiker' CHECK (rol IN ('gebruiker', 'admin', 'instructeur')),
      actief BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Instructeurs tabel
    CREATE TABLE IF NOT EXISTS instructeurs (
      id SERIAL PRIMARY KEY,
      naam VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      telefoon VARCHAR(20),
      rijbewijs_type TEXT[] DEFAULT ARRAY['B'], -- PostgreSQL array voor meerdere types
      status VARCHAR(50) DEFAULT 'Actief' CHECK (status IN ('Actief', 'Inactief')),
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Students tabel (uitgebreid)
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      naam VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      telefoon VARCHAR(20),
      adres TEXT,
      postcode VARCHAR(10),
      plaats VARCHAR(100),
      geboortedatum DATE,
      rijbewijs_type VARCHAR(10) DEFAULT 'B' CHECK (rijbewijs_type IN ('B', 'A', 'C')),
      transmissie VARCHAR(20) DEFAULT 'Handgeschakeld' CHECK (transmissie IN ('Handgeschakeld', 'Automaat')),
      status VARCHAR(20) DEFAULT 'Actief' CHECK (status IN ('Actief', 'Inactief', 'Gepauzeerd', 'Afgestudeerd')),
      instructeur_id INTEGER REFERENCES instructeurs(id) ON DELETE SET NULL,
      tegoed DECIMAL(10,2) DEFAULT 0.00,
      openstaand_bedrag DECIMAL(10,2) DEFAULT 0.00,
      laatste_betaling DATE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Vehicles tabel (uitgebreid)
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      merk VARCHAR(100) NOT NULL,
      model VARCHAR(100) NOT NULL,
      bouwjaar INTEGER NOT NULL,
      kenteken VARCHAR(20) UNIQUE NOT NULL,
      transmissie VARCHAR(20) NOT NULL CHECK (transmissie IN ('Handgeschakeld', 'Automaat')),
      brandstof VARCHAR(20) NOT NULL CHECK (brandstof IN ('benzine', 'diesel', 'elektrisch', 'hybride')),
      kilometerstand INTEGER DEFAULT 0,
      laatste_onderhoud DATE,
      volgende_onderhoud DATE,
      apk_datum DATE,
      status VARCHAR(20) DEFAULT 'beschikbaar' CHECK (status IN ('beschikbaar', 'onderhoud', 'defect')),
      instructeur_id INTEGER REFERENCES instructeurs(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Lessons tabel (uitgebreid)
    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      datum DATE NOT NULL,
      tijd TIME NOT NULL,
      duur INTEGER NOT NULL DEFAULT 60, -- in minuten
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      instructeur_id INTEGER NOT NULL REFERENCES instructeurs(id) ON DELETE CASCADE,
      vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
      type VARCHAR(20) DEFAULT 'Rijles' CHECK (type IN ('Rijles', 'Examen', 'Intake', 'Anders')),
      status VARCHAR(20) DEFAULT 'Gepland' CHECK (status IN ('Gepland', 'Bevestigd', 'Voltooid', 'Geannuleerd')),
      opmerkingen TEXT,
      prijs DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Les geschiedenis tabel (aparte tabel voor betere normalisatie)
    CREATE TABLE IF NOT EXISTS les_geschiedenis (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
      datum DATE NOT NULL,
      duur INTEGER NOT NULL,
      opmerkingen TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Examens tabel (aparte tabel)
    CREATE TABLE IF NOT EXISTS examens (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      datum DATE NOT NULL,
      type VARCHAR(50) NOT NULL,
      resultaat VARCHAR(20) CHECK (resultaat IN ('Geslaagd', 'Gezakt', 'Gepland')),
      opmerkingen TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Financiele transacties tabel
    CREATE TABLE IF NOT EXISTS transacties (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      bedrag DECIMAL(10,2) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('betaling', 'factuur', 'korting')),
      beschrijving TEXT,
      datum DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexen voor betere performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
    CREATE INDEX IF NOT EXISTS idx_instructeurs_email ON instructeurs(email);
    CREATE INDEX IF NOT EXISTS idx_lessons_datum ON lessons(datum);
    CREATE INDEX IF NOT EXISTS idx_lessons_student ON lessons(student_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_instructeur ON lessons(instructeur_id);

    -- Triggers voor updated_at automatisch bijwerken
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_instructeurs_updated_at BEFORE UPDATE ON instructeurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Insert test admin user (wachtwoord: admin123)
    INSERT INTO users (naam, email, wachtwoord, rol) VALUES 
    ('Admin User', 'admin@rijschool.nl', '$2a$10$N9qo8uLOickgx2ZMRZoMye7pFWQxKKVXnzL5OA0PiLV0AJD/bJeMu', 'admin')
    ON CONFLICT (email) DO NOTHING;
  `
  
  await client.query(createTablesQuery)
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Server wordt afgesloten...')
  pool.end(() => {
    console.log('✅ Database verbindingen gesloten')
    process.exit(0)
  })
})

module.exports = { pool, testConnection, createTables }