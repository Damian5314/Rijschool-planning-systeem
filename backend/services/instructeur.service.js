const { pool } = require('../config/db')

// Get all instructeurs
const getAllInstructeurs = async () => {
  const query = `
    SELECT 
      i.*,
      (SELECT COUNT(*) FROM students WHERE instructeur_id = i.id) as aantal_studenten,
      (SELECT COUNT(*) FROM lessons WHERE instructeur_id = i.id AND datum >= CURRENT_DATE) as komende_lessen
    FROM instructeurs i
    ORDER BY i.created_at DESC
  `
  const result = await pool.query(query)
  return result.rows
}

// Create new instructeur
const createInstructeur = async (data) => {
  const { naam, email, telefoon, rijbewijs_type = ['B'], status = 'Actief' } = data
  
  const insertQuery = `
    INSERT INTO instructeurs (naam, email, telefoon, rijbewijs_type, status) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *
  `
  
  const result = await pool.query(insertQuery, [
    naam, 
    email.toLowerCase(), 
    telefoon, 
    rijbewijs_type, 
    status
  ])
  
  return result.rows[0]
}

// Get instructeur by ID
const getInstructeurById = async (id) => {
  const query = `
    SELECT 
      i.*,
      (SELECT COUNT(*) FROM students WHERE instructeur_id = i.id) as aantal_studenten,
      (SELECT COUNT(*) FROM lessons WHERE instructeur_id = i.id AND datum >= CURRENT_DATE) as komende_lessen
    FROM instructeurs i
    WHERE i.id = $1
  `
  const result = await pool.query(query, [id])
  return result.rows[0] || null
}

// Update instructeur by ID
const updateInstructeurById = async (id, data) => {
  const { naam, email, telefoon, rijbewijs_type, status } = data
  
  const updateQuery = `
    UPDATE instructeurs 
    SET naam = COALESCE($1, naam),
        email = COALESCE($2, email),
        telefoon = COALESCE($3, telefoon),
        rijbewijs_type = COALESCE($4, rijbewijs_type),
        status = COALESCE($5, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6 
    RETURNING *
  `
  
  const result = await pool.query(updateQuery, [
    naam, 
    email?.toLowerCase(), 
    telefoon, 
    rijbewijs_type, 
    status, 
    id
  ])
  
  return result.rows[0] || null
}

// Delete instructeur by ID
const deleteInstructeurById = async (id) => {
  const deleteQuery = 'DELETE FROM instructeurs WHERE id = $1 RETURNING *'
  const result = await pool.query(deleteQuery, [id])
  return result.rows[0] || null
}

// Get instructeur students
const getInstructeurStudents = async (id) => {
  const query = `
    SELECT id, naam, email, status, created_at
    FROM students 
    WHERE instructeur_id = $1
    ORDER BY naam
  `
  const result = await pool.query(query, [id])
  return result.rows
}

// Get instructeur planning
const getInstructeurPlanning = async (id, startDatum, eindDatum) => {
  let dateFilter = ''
  let queryParams = [id]
  
  if (startDatum && eindDatum) {
    dateFilter = 'AND l.datum BETWEEN $2 AND $3'
    queryParams.push(startDatum, eindDatum)
  } else {
    dateFilter = 'AND l.datum >= CURRENT_DATE'
  }

  const query = `
    SELECT 
      l.*,
      s.naam as student_naam,
      s.telefoon as student_telefoon,
      v.merk as vehicle_merk,
      v.model as vehicle_model,
      v.kenteken as vehicle_kenteken
    FROM lessons l
    JOIN students s ON l.student_id = s.id
    LEFT JOIN vehicles v ON l.vehicle_id = v.id
    WHERE l.instructeur_id = $1 ${dateFilter}
    ORDER BY l.datum, l.tijd
  `
  
  const result = await pool.query(query, queryParams)
  return result.rows
}

module.exports = {
  getAllInstructeurs,
  createInstructeur,
  getInstructeurById,
  updateInstructeurById,
  deleteInstructeurById,
  getInstructeurStudents,
  getInstructeurPlanning
}