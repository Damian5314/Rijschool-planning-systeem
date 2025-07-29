-- Users tabel voor authenticatie
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'gebruiker',
    actief BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students tabel
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instructeurs tabel
CREATE TABLE instructeurs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles tabel
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons tabel
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    instructeur_id INTEGER REFERENCES instructeurs(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    date_time TIMESTAMP NOT NULL,
    duration INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'gepland',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test admin gebruiker (wachtwoord: admin123)
INSERT INTO users (email, password, rol) VALUES 
('admin@rijschool.nl', '$2a$10$N9qo8uLOickgx2ZMRZoMye7pFWQxKKVXnzL5OA0PiLV0AJD/bJeMu', 'admin');