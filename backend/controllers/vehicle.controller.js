const { pool } = require("../config/db")

// Get all vehicles met uitgebreide info
const getAllVehicles = async (req, res) => {
  try {
    const { status, instructeur_id, transmissie, brandstof } = req.query
    
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
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error("Get all vehicles error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen voertuigen" 
    })
  }
}

// Get vehicle by ID met alle gerelateerde data
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params

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
      return res.status(404).json({ 
        success: false,
        message: "Voertuig niet gevonden!" 
      })
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

    res.json({
      success: true,
      data: {
        ...vehicle,
        recente_lessen: lessonsResult.rows,
        komende_planning: planningResult.rows
      }
    })

  } catch (error) {
    console.error("Get vehicle by ID error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen voertuig" 
    })
  }
}

// Create nieuw voertuig
const createVehicle = async (req, res) => {
  try {
    const { 
      merk, model, bouwjaar, kenteken, transmissie, brandstof,
      kilometerstand = 0, laatste_onderhoud, volgende_onderhoud, apk_datum,
      status = 'beschikbaar', instructeur_id
    } = req.body
    
    // Input validatie
    if (!merk || !model || !bouwjaar || !kenteken || !transmissie || !brandstof) {
      return res.status(400).json({ 
        success: false,
        message: "Merk, model, bouwjaar, kenteken, transmissie en brandstof zijn verplicht!" 
      })
    }

    // Validate kenteken format (basic Dutch license plate validation)
    const kentekenRegex = /^[A-Z0-9]{6}$/
    if (!kentekenRegex.test(kenteken.replace(/[-\s]/g, ''))) {
      return res.status(400).json({ 
        success: false,
        message: "Ongeldig kenteken formaat!" 
      })
    }

    // Check if kenteken already exists
    const existingQuery = 'SELECT id FROM vehicles WHERE kenteken = $1'
    const existing = await pool.query(existingQuery, [kenteken.toUpperCase()])
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Voertuig met dit kenteken bestaat al!" 
      })
    }

    // Validate instructeur if provided
    if (instructeur_id) {
      const instructeurCheck = await pool.query(
        'SELECT id FROM instructeurs WHERE id = $1 AND status = $2',
        [instructeur_id, 'Actief']
      )
      
      if (instructeurCheck.rows.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Opgegeven instructeur bestaat niet of is niet actief!" 
        })
      }
    }

    // Validate year
    const currentYear = new Date().getFullYear()
    if (bouwjaar < 1990 || bouwjaar > currentYear + 1) {
      return res.status(400).json({ 
        success: false,
        message: "Ongeldig bouwjaar!" 
      })
    }
    
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
    
    res.status(201).json({
      success: true,
      message: "Voertuig succesvol aangemaakt!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Create vehicle error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij aanmaken voertuig" 
    })
  }
}

// Update voertuig
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params
    const updateFields = req.body
    
    // Check if vehicle exists
    const existingQuery = 'SELECT * FROM vehicles WHERE id = $1'
    const existing = await pool.query(existingQuery, [id])
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Voertuig niet gevonden!" 
      })
    }

    // Check kenteken uniqueness if being updated
    if (updateFields.kenteken) {
      const kentekenCheckQuery = 'SELECT id FROM vehicles WHERE kenteken = $1 AND id != $2'
      const kentekenCheck = await pool.query(kentekenCheckQuery, [updateFields.kenteken.toUpperCase(), id])
      
      if (kentekenCheck.rows.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: "Kenteken is al in gebruik door ander voertuig!" 
        })
      }
    }

    // Validate instructeur if being updated
    if (updateFields.instructeur_id) {
      const instructeurCheck = await pool.query(
        'SELECT id FROM instructeurs WHERE id = $1 AND status = $2',
        [updateFields.instructeur_id, 'Actief']
      )
      
      if (instructeurCheck.rows.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Opgegeven instructeur bestaat niet of is niet actief!" 
        })
      }
    }

    // Build dynamic update query
    const allowedFields = [
      'merk', 'model', 'bouwjaar', 'kenteken', 'transmissie', 'brandstof',
      'kilometerstand', 'laatste_onderhoud', 'volgende_onderhoud', 'apk_datum',
      'status', 'instructeur_id'
    ]
    
    const updatePairs = []
    const queryParams = []
    let paramCount = 0

    Object.keys(updateFields).forEach(field => {
      if (allowedFields.includes(field) && updateFields[field] !== undefined) {
        paramCount++
        updatePairs.push(`${field} = $${paramCount}`)
        queryParams.push(field === 'kenteken' ? updateFields[field].toUpperCase() : updateFields[field])
      }
    })

    if (updatePairs.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Geen geldige velden om bij te werken!" 
      })
    }

    paramCount++
    queryParams.push(id)

    const updateQuery = `
      UPDATE vehicles 
      SET ${updatePairs.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `
    
    const result = await pool.query(updateQuery, queryParams)
    
    res.json({
      success: true,
      message: "Voertuig succesvol bijgewerkt!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Update vehicle error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij bijwerken voertuig" 
    })
  }
}

// Delete voertuig
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if vehicle exists
    const existingQuery = 'SELECT * FROM vehicles WHERE id = $1'
    const existing = await pool.query(existingQuery, [id])
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Voertuig niet gevonden!" 
      })
    }

    // Check if vehicle has future lessons
    const futureLessonsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM lessons WHERE vehicle_id = $1 AND datum >= CURRENT_DATE', 
      [id]
    )

    if (futureLessonsCheck.rows[0].count > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Kan voertuig niet verwijderen: heeft nog geplande lessen!" 
      })
    }
    
    const deleteQuery = 'DELETE FROM vehicles WHERE id = $1 RETURNING *'
    const result = await pool.query(deleteQuery, [id])
    
    res.json({
      success: true,
      message: "Voertuig succesvol verwijderd!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Delete vehicle error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij verwijderen voertuig" 
    })
  }
}

// Get vehicle maintenance alerts
const getMaintenanceAlerts = async (req, res) => {
  try {
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
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })

  } catch (error) {
    console.error("Get maintenance alerts error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen onderhoudsmeldingen" 
    })
  }
}

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getMaintenanceAlerts
}