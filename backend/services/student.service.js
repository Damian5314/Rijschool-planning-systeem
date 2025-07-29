const { pool } = require('../config/db')

// Get all students
const getAllStudenten = async (filters = {}) => {
  const { status, instructeur_id, page = 1, limit = 50 } = filters
  
  let whereConditions = []
  let queryParams = []
  let paramCount = 0

  // Filter op status
  if (status) {
    paramCount++
    whereConditions.push(`s.status = $${paramCount}`)
    queryParams.push(status)
  }

  // Filter op instructeur
  if (instructeur_id) {
    paramCount++
    whereConditions.push(`s.instructeur_id = $${paramCount}`)
    queryParams.push(instructeur_id)
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
  
  // Pagination
  const offset = (page - 1) * limit
  paramCount++
  const limitClause = `LIMIT $${paramCount}`
  queryParams.push(limit)
  paramCount++
  const offsetClause = `OFFSET $${paramCount}`
  queryParams.push(offset)

  const query = `
    SELECT 
      s.*,
      i.naam as instructeur_naam,
      i.email as instructeur_email,
      (SELECT COUNT(*) FROM lessons WHERE student_id = s.id) as totaal_lessen,
      (SELECT COUNT(*) FROM lessons WHERE student_id = s.id AND datum >= CURRENT_DATE) as komende_lessen,
      (SELECT SUM(prijs) FROM lessons WHERE student_id = s.id AND status = 'Voltooid') as totaal_betaald
    FROM students s
    LEFT JOIN instructeurs i ON s.instructeur_id = i.id
    ${whereClause}
    ORDER BY s.created_at DESC
    ${limitClause} ${offsetClause}
  `
  
  const result = await pool.query(query, queryParams)
  
  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM students s
    ${whereClause}
  `
  const countResult = await pool.query(countQuery, queryParams.slice(0, whereConditions.length))
  
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
    page: parseInt(page),
    limit: parseInt(limit)
  }
}

// Create new student
const createStudent = async (data) => {
  const { 
    naam, email, telefoon, adres, postcode, plaats, geboortedatum,
    rijbewijs_type = 'B', transmissie = 'Handgeschakeld', status = 'Actief',
    instructeur_id, tegoed = 0, openstaand_bedrag = 0
  } = data
  
  const insertQuery = `
    INSERT INTO students (
      naam, email, telefoon, adres, postcode, plaats, geboortedatum,
      rijbewijs_type, transmissie, status, instructeur_id, tegoed, openstaand_bedrag
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
    RETURNING *
  `
  
  const result = await pool.query(insertQuery, [
    naam, email.toLowerCase(), telefoon, adres, postcode, plaats, geboortedatum,
    rijbewijs_type, transmissie, status, instructeur_id, tegoed, openstaand_bedrag
  ])
  
  return result.rows[0]
}

// Get student by ID with full details
const getStudentById = async (id) => {
  // Get student with instructeur info
  const studentQuery = `
    SELECT 
      s.*,
      i.naam as instructeur_naam,
      i.email as instructeur_email,
      i.telefoon as instructeur_telefoon
    FROM students s
    LEFT JOIN instructeurs i ON s.instructeur_id = i.id
    WHERE s.id = $1
  `
  const studentResult = await pool.query(studentQuery, [id])
  
  if (studentResult.rows.length === 0) {
    return null
  }

  const student = studentResult.rows[0]

  // Get les geschiedenis
  const lesGeschiedenisQuery = `
    SELECT 
      lg.*,
      l.type as les_type,
      l.status as les_status
    FROM les_geschiedenis lg
    LEFT JOIN lessons l ON lg.lesson_id = l.id
    WHERE lg.student_id = $1
    ORDER BY lg.datum DESC
  `
  const lesGeschiedenisResult = await pool.query(lesGeschiedenisQuery, [id])

  // Get examens
  const examensQuery = `
    SELECT * FROM examens 
    WHERE student_id = $1 
    ORDER BY datum DESC
  `
  const examensResult = await pool.query(examensQuery, [id])

  // Get financiele transacties
  const transactiesQuery = `
    SELECT * FROM transacties 
    WHERE student_id = $1 
    ORDER BY datum DESC
  `
  const transactiesResult = await pool.query(transactiesQuery, [id])

  // Get komende lessen
  const komendeLessenQuery = `
    SELECT 
      l.*,
      i.naam as instructeur_naam,
      v.merk as vehicle_merk,
      v.model as vehicle_model,
      v.kenteken as vehicle_kenteken
    FROM lessons l
    JOIN instructeurs i ON l.instructeur_id = i.id
    LEFT JOIN vehicles v ON l.vehicle_id = v.id
    WHERE l.student_id = $1 AND l.datum >= CURRENT_DATE
    ORDER BY l.datum, l.tijd
  `
  const komendeLessenResult = await pool.query(komendeLessenQuery, [id])

  return {
    ...student,
    les_geschiedenis: lesGeschiedenisResult.rows,
    examens: examensResult.rows,
    transacties: transactiesResult.rows,
    komende_lessen: komendeLessenResult.rows
  }
}

// Update student by ID
const updateStudentById = async (id, data) => {
  const allowedFields = [
    'naam', 'email', 'telefoon', 'adres', 'postcode', 'plaats', 'geboortedatum',
    'rijbewijs_type', 'transmissie', 'status', 'instructeur_id', 'tegoed', 
    'openstaand_bedrag', 'laatste_betaling'
  ]
  
  const updatePairs = []
  const queryParams = []
  let paramCount = 0

  Object.keys(data).forEach(field => {
    if (allowedFields.includes(field) && data[field] !== undefined) {
      paramCount++
      updatePairs.push(`${field} = $${paramCount}`)
      queryParams.push(field === 'email' ? data[field].toLowerCase() : data[field])
    }
  })

  if (updatePairs.length === 0) {
    throw new Error('Geen geldige velden om bij te werken!')
  }

  paramCount++
  queryParams.push(id)

  const updateQuery = `
    UPDATE students 
    SET ${updatePairs.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING *
  `
  
  const result = await pool.query(updateQuery, queryParams)
  return result.rows[0] || null
}

// Delete student by ID
const deleteStudentById = async (id) => {
  const deleteQuery = 'DELETE FROM students WHERE id = $1 RETURNING *'
  const result = await pool.query(deleteQuery, [id])
  return result.rows[0] || null
}

// Add financial transaction
const addTransactie = async (studentId, transactieData) => {
  const { bedrag, type, beschrijving } = transactieData

  // Insert transaction
  const insertQuery = `
    INSERT INTO transacties (student_id, bedrag, type, beschrijving)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `
  const result = await pool.query(insertQuery, [studentId, bedrag, type, beschrijving])

  // Update student balance based on transaction type
  let balanceUpdate = ''
  if (type === 'betaling') {
    balanceUpdate = `
      UPDATE students 
      SET openstaand_bedrag = openstaand_bedrag - $1,
          laatste_betaling = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `
  } else if (type === 'factuur') {
    balanceUpdate = `
      UPDATE students 
      SET openstaand_bedrag = openstaand_bedrag + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `
  } else if (type === 'korting') {
    balanceUpdate = `
      UPDATE students 
      SET openstaand_bedrag = openstaand_bedrag - $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `
  }

  if (balanceUpdate) {
    await pool.query(balanceUpdate, [Math.abs(bedrag), studentId])
  }

  return result.rows[0]
}

// Check if student exists
const studentExists = async (id) => {
  const query = 'SELECT id FROM students WHERE id = $1'
  const result = await pool.query(query, [id])
  return result.rows.length > 0
}

// Check if email exists (for creation/update)
const emailExists = async (email, excludeId = null) => {
  let query = 'SELECT id FROM students WHERE email = $1'
  let params = [email.toLowerCase()]
  
  if (excludeId) {
    query += ' AND id != $2'
    params.push(excludeId)
  }
  
  const result = await pool.query(query, params)
  return result.rows.length > 0
}

module.exports = {
  getAllStudenten,
  createStudent,
  getStudentById,
  updateStudentById,
  deleteStudentById,
  addTransactie,
  studentExists,
  emailExists
}