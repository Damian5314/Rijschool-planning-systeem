const { pool } = require('../config/db')

// Get all vehicles with filters
const getAllVehicles = async (filters = {}) => {
  const { status, instructeur_id, transmissie, brandstof } = filters
  
  let whereConditions = []
  let queryParams = []
  let paramCount = 0

  // Filter op status
  if (status) {
    paramCount++
    whereConditions.push(`v.status = $${paramCount}`)
    queryParams.push(status)
  }

  // Filter op instructeur
  if (instructeur_id) {
    paramCount++
    whereConditions.push(`v.instructeur_id = $${paramCount}`)
    queryParams.push(instructeur_id)
  }

  // Filter op transmissie
  if (transmissie) {
    paramCount++
    whereConditions.push(`v.transmissie = $${paramCount}`)
    queryParams.push(transmissie)
  }

  // Filter op brandstof
  if (brandstof) {
    paramCount++
    whereConditions.push(`v.brandstof = $${paramCount}`)
    queryParams.push(brandstof)
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  const query = `
    SELECT 
      v.*,
      i.naam as instructeur_naam,
      i.email as instructeur_email,
      (SELECT COUNT(*) FROM lessons WHERE vehicle_id = v.id) as totaal_lessen,
      (SELECT COUNT(*) FROM lessons WHERE vehicle_id = v.id AND datum >= CURRENT_DATE) as komende_lessen,
      CASE 
        WHEN v.volgende_onderhoud IS NOT NULL AND v.volgende_onderhoud <= CURRENT_DATE + INTERVAL '30 days'
        THEN true
        ELSE false
      END as onderhoud_nodig,
      CASE 
        WHEN v.apk_datum IS NOT NULL AND v.apk_datum <= CURRENT_DATE + INTERVAL '60 days'
        THEN true
        ELSE false
      END as apk_verloopt_binnenkort
    FROM vehicles v
    LEFT JOIN instructeurs i ON v.instructeur_id = i.id
    ${whereClause}
    ORDER BY v.merk, v.model
  `
  
  const result = await pool.query(query, queryParams)
  return result.rows
}

// Create new vehicle
const createVehicle = async (data) => {
  const { 
    merk, model, bouwjaar, kenteken, transmissie, brandstof,
    kilometerstand = 0, laatste_onderhoud, volgende_onderhoud, apk_datum,
    status = 'beschikbaar', instructeur_id
  } = data
  
  const insertQuery = `
    INSERT INTO vehicles (
      merk, model, bouwjaar, kenteken, transmissie, brandstof,
      kilometerstand, laatste_onderhoud, volgende_onderhoud, apk_datum,
      status, instructeur_id
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
    RETURNING *
  `
  
  const result = await pool.query(insertQuery, [
    merk, model, bouwjaar, kenteken.toUpperCase(), transmissie, brandstof,
    kilometerstand, laatste_onderhoud, volgende_onderhoud, apk_datum,
    status, instructeur_id
  ])
  
  return result.rows[0]
}

// Get vehicle by ID with full details
const getVehicleById = async (id) => {
  // Get vehicle with instructeur info
  const vehicleQuery = `
    SELECT 
      v.*,
      i.naam as instructeur_naam,
      i.email as instructeur_email,
      i.telefoon as instructeur_telefoon,
      CASE 
        WHEN v.volgende_onderhoud IS NOT NULL AND v.volgende_onderhoud <= CURRENT_DATE + INTERVAL '30 days'
        THEN true
        ELSE false
      END as onderhoud_nodig,
      CASE 
        WHEN v.apk_datum IS NOT NULL AND v.apk_datum <= CURRENT_DATE + INTERVAL '60 days'
        THEN true
        ELSE false
      END as apk_verloopt_binnenkort
    FROM vehicles v
    LEFT JOIN instructeurs i ON v.instructeur_id = i.id
    WHERE v.id = $1
  `
  const vehicleResult = await pool.query(vehicleQuery, [id])
  
  if (vehicleResult.rows.length === 0) {
    return null
  }

  const vehicle = vehicleResult.rows[0]

  // Get recente lessen met dit voertuig
  const lessonsQuery = `
    SELECT 
      l.id, l.datum, l.tijd, l.duur, l.type, l.status,
      s.naam as student_naam,
      i.naam as instructeur_naam
    FROM lessons l
    JOIN students s ON l.student_id = s.id
    JOIN instructeurs i ON l.instructeur_id = i.id
    WHERE l.vehicle_id = $1
    ORDER BY l.datum DESC, l.tijd DESC
    LIMIT 20
  `
  const lessonsResult = await pool.query(lessonsQuery, [id])

  // Get planning voor komende periode
  const planningQuery = `
    SELECT 
      l.id, l.datum, l.tijd, l.duur, l.type, l.status,
      s.naam as student_naam,
      i.naam as instructeur_naam
    FROM lessons l
    JOIN students s ON l.student_id = s.id
    JOIN instructeurs i ON l.instructeur_id = i.id
    WHERE l.vehicle_id = $1 AND l.datum >= CURRENT_DATE
    ORDER BY l.datum, l.tijd
  `
  const planningResult = await pool.query(planningQuery, [id])

  return {
    ...vehicle,
    recente_lessen: lessonsResult.rows,
    komende_planning: planningResult.rows
  }
}

// Update vehicle by ID
const updateVehicleById = async (id, data) => {
  const allowedFields = [
    'merk', 'model', 'bouwjaar', 'kenteken', 'transmissie', 'brandstof',
    'kilometerstand', 'laatste_onderhoud', 'volgende_onderhoud', 'apk_datum',
    'status', 'instructeur_id'
  ]
  
  const updatePairs = []
  const queryParams = []
  let paramCount = 0

  Object.keys(data).forEach(field => {
    if (allowedFields.includes(field) && data[field] !== undefined) {
      paramCount++
      updatePairs.push(`${field} = ${paramCount}`)
      queryParams.push(field === 'kenteken' ? data[field].toUpperCase() : data[field])
    }
  })

  if (updatePairs.length === 0) {
    throw new Error('Geen geldige velden om bij te werken!')
  }

  paramCount++
  queryParams.push(id)

  const updateQuery = `
    UPDATE vehicles 
    SET ${updatePairs.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${paramCount}
    RETURNING *
  `
  
  const result = await pool.query(updateQuery, queryParams)
  return result.rows[0] || null
}

// Delete vehicle by ID
const deleteVehicleById = async (id) => {
  const deleteQuery = 'DELETE FROM vehicles WHERE id = $1 RETURNING *'
  const result = await pool.query(deleteQuery, [id])
  return result.rows[0] || null
}

// Get maintenance alerts
const getMaintenanceAlerts = async () => {
  const query = `
    SELECT 
      id, merk, model, kenteken, laatste_onderhoud, volgende_onderhoud, apk_datum,
      CASE 
        WHEN volgende_onderhoud IS NOT NULL AND volgende_onderhoud <= CURRENT_DATE
        THEN 'URGENT_ONDERHOUD'
        WHEN volgende_onderhoud IS NOT NULL AND volgende_onderhoud <= CURRENT_DATE + INTERVAL '7 days'
        THEN 'ONDERHOUD_DEZE_WEEK'
        WHEN volgende_onderhoud IS NOT NULL AND volgende_onderhoud <= CURRENT_DATE + INTERVAL '30 days'
        THEN 'ONDERHOUD_DEZE_MAAND'
        WHEN apk_datum IS NOT NULL AND apk_datum <= CURRENT_DATE
        THEN 'URGENT_APK'
        WHEN apk_datum IS NOT NULL AND apk_datum <= CURRENT_DATE + INTERVAL '30 days'
        THEN 'APK_DEZE_MAAND'
        WHEN apk_datum IS NOT NULL AND apk_datum <= CURRENT_DATE + INTERVAL '60 days'
        THEN 'APK_BINNENKORT'
        ELSE NULL
      END as alert_type
    FROM vehicles
    WHERE status != 'defect'
    AND (
      (volgende_onderhoud IS NOT NULL AND volgende_onderhoud <= CURRENT_DATE + INTERVAL '30 days')
      OR
      (apk_datum IS NOT NULL AND apk_datum <= CURRENT_DATE + INTERVAL '60 days')
    )
    ORDER BY 
      CASE 
        WHEN volgende_onderhoud IS NOT NULL AND volgende_onderhoud <= CURRENT_DATE THEN 1
        WHEN apk_datum IS NOT NULL AND apk_datum <= CURRENT_DATE THEN 2
        WHEN volgende_onderhoud IS NOT NULL AND volgende_onderhoud <= CURRENT_DATE + INTERVAL '7 days' THEN 3
        WHEN apk_datum IS NOT NULL AND apk_datum <= CURRENT_DATE + INTERVAL '30 days' THEN 4
        ELSE 5
      END,
      volgende_onderhoud, apk_datum
  `
  
  const result = await pool.query(query)
  return result.rows
}

// Check if vehicle exists
const vehicleExists = async (id) => {
  const query = 'SELECT id FROM vehicles WHERE id = $1'
  const result = await pool.query(query, [id])
  return result.rows.length > 0
}

// Check if kenteken exists (for creation/update)
const kentekenExists = async (kenteken, excludeId = null) => {
  let query = 'SELECT id FROM vehicles WHERE kenteken = $1'
  let params = [kenteken.toUpperCase()]
  
  if (excludeId) {
    query += ' AND id != $2'
    params.push(excludeId)
  }
  
  const result = await pool.query(query, params)
  return result.rows.length > 0
}

// Get available vehicles for specific date/time
const getAvailableVehicles = async (datum, tijd, excludeLessonId = null) => {
  let conflictQuery = `
    SELECT vehicle_id FROM lessons 
    WHERE datum = $1 AND tijd = $2 
    AND vehicle_id IS NOT NULL
    AND status NOT IN ('Geannuleerd')
  `
  let params = [datum, tijd]
  
  if (excludeLessonId) {
    conflictQuery += ' AND id != $3'
    params.push(excludeLessonId)
  }
  
  const conflictResult = await pool.query(conflictQuery, params)
  const unavailableIds = conflictResult.rows.map(row => row.vehicle_id)
  
  let availableQuery = `
    SELECT v.*, i.naam as instructeur_naam
    FROM vehicles v
    LEFT JOIN instructeurs i ON v.instructeur_id = i.id
    WHERE v.status = 'beschikbaar'
  `
  
  if (unavailableIds.length > 0) {
    const placeholders = unavailableIds.map((_, index) => `${index + 1}`).join(',')
    availableQuery += ` AND v.id NOT IN (${placeholders})`
    const result = await pool.query(availableQuery, unavailableIds)
    return result.rows
  } else {
    const result = await pool.query(availableQuery)
    return result.rows
  }
}

module.exports = {
  getAllVehicles,
  createVehicle,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
  getMaintenanceAlerts,
  vehicleExists,
  kentekenExists,
  getAvailableVehicles
}