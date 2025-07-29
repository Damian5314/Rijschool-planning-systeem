const { pool } = require('../config/db')

// Get all lessons with filters and pagination
const getAllLessen = async (filters = {}) => {
  const { 
    startDatum, eindDatum, instructeur_id, student_id, status, type,
    page = 1, limit = 50 
  } = filters
  
  let whereConditions = []
  let queryParams = []
  let paramCount = 0

  // Date range filter
  if (startDatum) {
    paramCount++
    whereConditions.push(`l.datum >= $${paramCount}`)
    queryParams.push(startDatum)
  }
  
  if (eindDatum) {
    paramCount++
    whereConditions.push(`l.datum <= $${paramCount}`)
    queryParams.push(eindDatum)
  }

  // Instructeur filter
  if (instructeur_id) {
    paramCount++
    whereConditions.push(`l.instructeur_id = $${paramCount}`)
    queryParams.push(instructeur_id)
  }

  // Student filter
  if (student_id) {
    paramCount++
    whereConditions.push(`l.student_id = $${paramCount}`)
    queryParams.push(student_id)
  }

  // Status filter
  if (status) {
    paramCount++
    whereConditions.push(`l.status = $${paramCount}`)
    queryParams.push(status)
  }

  // Type filter
  if (type) {
    paramCount++
    whereConditions.push(`l.type = $${paramCount}`)
    queryParams.push(type)
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
      l.*,
      s.naam as student_naam,
      s.email as student_email,
      s.telefoon as student_telefoon,
      i.naam as instructeur_naam,
      i.email as instructeur_email,
      v.merk as vehicle_merk,
      v.model as vehicle_model,
      v.kenteken as vehicle_kenteken
    FROM lessons l
    JOIN students s ON l.student_id = s.id
    JOIN instructeurs i ON l.instructeur_id = i.id
    LEFT JOIN vehicles v ON l.vehicle_id = v.id
    ${whereClause}
    ORDER BY l.datum DESC, l.tijd DESC
    ${limitClause} ${offsetClause}
  `
  
  const result = await pool.query(query, queryParams)
  
  // Get total count for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM lessons l
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

// Create new lesson
const createLes = async (data) => {
  const { 
    datum, tijd, duur = 60, student_id, instructeur_id, vehicle_id,
    type = 'Rijles', status = 'Gepland', opmerkingen, prijs 
  } = data
  
  const insertQuery = `
    INSERT INTO lessons (
      datum, tijd, duur, student_id, instructeur_id, vehicle_id,
      type, status, opmerkingen, prijs
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
    RETURNING *
  `
  
  const result = await pool.query(insertQuery, [
    datum, tijd, duur, student_id, instructeur_id, vehicle_id,
    type, status, opmerkingen, prijs
  ])
  
  return result.rows[0]
}

// Get lesson by ID with full details
const getLesById = async (id) => {
  const query = `
    SELECT 
      l.*,
      s.naam as student_naam,
      s.email as student_email,
      s.telefoon as student_telefoon,
      i.naam as instructeur_naam,
      i.email as instructeur_email,
      i.telefoon as instructeur_telefoon,
      v.merk as vehicle_merk,
      v.model as vehicle_model,
      v.kenteken as vehicle_kenteken
    FROM lessons l
    JOIN students s ON l.student_id = s.id
    JOIN instructeurs i ON l.instructeur_id = i.id
    LEFT JOIN vehicles v ON l.vehicle_id = v.id
    WHERE l.id = $1
  `
  const result = await pool.query(query, [id])
  return result.rows[0] || null
}

// Update lesson by ID
const updateLesById = async (id, data) => {
  // First get current lesson for history tracking
  const currentLesson = await getLesById(id)
  if (!currentLesson) {
    return null
  }

  // If updating to completed status, add to lesson history
  if (data.status === 'Voltooid' && currentLesson.status !== 'Voltooid') {
    const historyQuery = `
      INSERT INTO les_geschiedenis (student_id, lesson_id, datum, duur, opmerkingen)
      VALUES ($1, $2, $3, $4, $5)
    `
    await pool.query(historyQuery, [
      currentLesson.student_id,
      id,
      currentLesson.datum,
      data.duur || currentLesson.duur,
      data.opmerkingen || currentLesson.opmerkingen
    ])
  }

  const allowedFields = [
    'datum', 'tijd', 'duur', 'student_id', 'instructeur_id', 'vehicle_id',
    'type', 'status', 'opmerkingen', 'prijs'
  ]
  
  const updatePairs = []
  const queryParams = []
  let paramCount = 0

  Object.keys(data).forEach(field => {
    if (allowedFields.includes(field) && data[field] !== undefined) {
      paramCount++
      updatePairs.push(`${field} = $${paramCount}`)
      queryParams.push(data[field])
    }
  })

  if (updatePairs.length === 0) {
    throw new Error('Geen geldige velden om bij te werken!')
  }

  paramCount++
  queryParams.push(id)

  const updateQuery = `
    UPDATE lessons 
    SET ${updatePairs.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING *
  `
  
  const result = await pool.query(updateQuery, queryParams)
  return result.rows[0] || null
}

// Delete lesson by ID
const deleteLesById = async (id) => {
  const deleteQuery = 'DELETE FROM lessons WHERE id = $1 RETURNING *'
  const result = await pool.query(deleteQuery, [id])
  return result.rows[0] || null
}

// Check for scheduling conflicts
const checkConflicts = async (datum, tijd, instructeur_id, vehicle_id, excludeLessonId = null) => {
  let query = `
    SELECT id FROM lessons 
    WHERE datum = $1 AND tijd = $2 
    AND (instructeur_id = $3 OR (vehicle_id = $4 AND $4 IS NOT NULL))
    AND status NOT IN ('Geannuleerd')
  `
  let params = [datum, tijd, instructeur_id, vehicle_id]
  
  if (excludeLessonId) {
    query += ' AND id != $5'
    params.push(excludeLessonId)
  }
  
  const result = await pool.query(query, params)
  return result.rows.length > 0
}

// Get lessons for specific student
const getLessenByStudent = async (studentId) => {
  const query = `
    SELECT 
      l.*,
      i.naam as instructeur_naam,
      v.merk as vehicle_merk,
      v.model as vehicle_model,
      v.kenteken as vehicle_kenteken
    FROM lessons l
    JOIN instructeurs i ON l.instructeur_id = i.id
    LEFT JOIN vehicles v ON l.vehicle_id = v.id
    WHERE l.student_id = $1
    ORDER BY l.datum DESC, l.tijd DESC
  `
  const result = await pool.query(query, [studentId])
  return result.rows
}

// Get lessons for specific instructeur
const getLessenByInstructeur = async (instructeurId, startDatum = null, eindDatum = null) => {
  let dateFilter = ''
  let params = [instructeurId]
  
  if (startDatum && eindDatum) {
    dateFilter = 'AND l.datum BETWEEN $2 AND $3'
    params.push(startDatum, eindDatum)
  } else if (startDatum) {
    dateFilter = 'AND l.datum >= $2'
    params.push(startDatum)
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
  
  const result = await pool.query(query, params)
  return result.rows
}

// Check if lesson exists
const lessonExists = async (id) => {
  const query = 'SELECT id FROM lessons WHERE id = $1'
  const result = await pool.query(query, [id])
  return result.rows.length > 0
}

module.exports = {
  getAllLessen,
  createLes,
  getLesById,
  updateLesById,
  deleteLesById,
  checkConflicts,
  getLessenByStudent,
  getLessenByInstructeur,
  lessonExists
}