const { pool } = require("../config/db")

// Get all lessons met filters en pagination
const getAllLessen = async (req, res) => {
  try {
    const { 
      startDatum, eindDatum, instructeur_id, student_id, status, type,
      page = 1, limit = 50 
    } = req.query
    
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
    const totalCount = parseInt(countResult.rows[0].total)
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Get all lessons error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen lessen" 
    })
  }
}

// Get lesson by ID
const getLesById = async (req, res) => {
  try {
    const { id } = req.params

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
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Les niet gevonden!" 
      })
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error("Get lesson by ID error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen les" 
    })
  }
}

// Create nieuwe les
const createLes = async (req, res) => {
  try {
    const { 
      datum, tijd, duur = 60, student_id, instructeur_id, vehicle_id,
      type = 'Rijles', status = 'Gepland', opmerkingen, prijs 
    } = req.body
    
    // Input validatie
    if (!datum || !tijd || !student_id || !instructeur_id) {
      return res.status(400).json({ 
        success: false,
        message: "Datum, tijd, student en instructeur zijn verplicht!" 
      })
    }

    // Validate student exists and is active
    const studentCheck = await pool.query(
      'SELECT id, status FROM students WHERE id = $1',
      [student_id]
    )
    
    if (studentCheck.rows.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Student niet gevonden!" 
      })
    }

    if (studentCheck.rows[0].status === 'Inactief') {
      return res.status(400).json({ 
        success: false,
        message: "Student is inactief!" 
      })
    }

    // Validate instructeur exists and is active
    const instructeurCheck = await pool.query(
      'SELECT id, status FROM instructeurs WHERE id = $1',
      [instructeur_id]
    )
    
    if (instructeurCheck.rows.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Instructeur niet gevonden!" 
      })
    }

    if (instructeurCheck.rows[0].status === 'Inactief') {
      return res.status(400).json({ 
        success: false,
        message: "Instructeur is inactief!" 
      })
    }

    // Validate vehicle if provided
    if (vehicle_id) {
      const vehicleCheck = await pool.query(
        'SELECT id, status FROM vehicles WHERE id = $1',
        [vehicle_id]
      )
      
      if (vehicleCheck.rows.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Voertuig niet gevonden!" 
        })
      }

      if (vehicleCheck.rows[0].status !== 'beschikbaar') {
        return res.status(400).json({ 
          success: false,
          message: "Voertuig is niet beschikbaar!" 
        })
      }
    }

    // Check for conflicts - same instructeur or vehicle at same time
    const conflictQuery = `
      SELECT id FROM lessons 
      WHERE datum = $1 AND tijd = $2 
      AND (instructeur_id = $3 OR (vehicle_id = $4 AND $4 IS NOT NULL))
      AND status NOT IN ('Geannuleerd')
    `
    const conflictCheck = await pool.query(conflictQuery, [datum, tijd, instructeur_id, vehicle_id])
    
    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Instructeur of voertuig is al ingepland op dit tijdstip!" 
      })
    }

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
    
    res.status(201).json({
      success: true,
      message: "Les succesvol aangemaakt!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Create lesson error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij aanmaken les" 
    })
  }
}

// Update les
const updateLes = async (req, res) => {
  try {
    const { id } = req.params
    const updateFields = req.body
    
    // Check if lesson exists
    const existingQuery = 'SELECT * FROM lessons WHERE id = $1'
    const existing = await pool.query(existingQuery, [id])
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Les niet gevonden!" 
      })
    }

    const currentLesson = existing.rows[0]

    // If updating to completed status, add to lesson history
    if (updateFields.status === 'Voltooid' && currentLesson.status !== 'Voltooid') {
      const historyQuery = `
        INSERT INTO les_geschiedenis (student_id, lesson_id, datum, duur, opmerkingen)
        VALUES ($1, $2, $3, $4, $5)
      `
      await pool.query(historyQuery, [
        currentLesson.student_id,
        id,
        currentLesson.datum,
        updateFields.duur || currentLesson.duur,
        updateFields.opmerkingen || currentLesson.opmerkingen
      ])
    }

    // Validate conflicts if datetime is being changed
    if (updateFields.datum || updateFields.tijd) {
      const newDatum = updateFields.datum || currentLesson.datum
      const newTijd = updateFields.tijd || currentLesson.tijd
      const instructeur_id = updateFields.instructeur_id || currentLesson.instructeur_id
      const vehicle_id = updateFields.vehicle_id || currentLesson.vehicle_id

      const conflictQuery = `
        SELECT id FROM lessons 
        WHERE datum = $1 AND tijd = $2 
        AND (instructeur_id = $3 OR (vehicle_id = $4 AND $4 IS NOT NULL))
        AND status NOT IN ('Geannuleerd')
        AND id != $5
      `
      const conflictCheck = await pool.query(conflictQuery, [
        newDatum, newTijd, instructeur_id, vehicle_id, id
      ])
      
      if (conflictCheck.rows.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: "Instructeur of voertuig is al ingepland op dit tijdstip!" 
        })
      }
    }

    // Build dynamic update query
    const allowedFields = [
      'datum', 'tijd', 'duur', 'student_id', 'instructeur_id', 'vehicle_id',
      'type', 'status', 'opmerkingen', 'prijs'
    ]
    
    const updatePairs = []
    const queryParams = []
    let paramCount = 0

    Object.keys(updateFields).forEach(field => {
      if (allowedFields.includes(field) && updateFields[field] !== undefined) {
        paramCount++
        updatePairs.push(`${field} = ${paramCount}`)
        queryParams.push(updateFields[field])
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
      UPDATE lessons 
      SET ${updatePairs.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${paramCount}
      RETURNING *
    `
    
    const result = await pool.query(updateQuery, queryParams)
    
    res.json({
      success: true,
      message: "Les succesvol bijgewerkt!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Update lesson error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij bijwerken les" 
    })
  }
}

// Delete les
const deleteLes = async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if lesson exists
    const existingQuery = 'SELECT * FROM lessons WHERE id = $1'
    const existing = await pool.query(existingQuery, [id])
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Les niet gevonden!" 
      })
    }

    const lesson = existing.rows[0]

    // Don't allow deletion of completed lessons
    if (lesson.status === 'Voltooid') {
      return res.status(400).json({ 
        success: false,
        message: "Voltooide lessen kunnen niet worden verwijderd!" 
      })
    }

    // Check if lesson is in the past
    const lessonDate = new Date(lesson.datum)
    const today = new Date()
    if (lessonDate < today && lesson.status === 'Bevestigd') {
      return res.status(400).json({ 
        success: false,
        message: "Bevestigde lessen in het verleden kunnen niet worden verwijderd!" 
      })
    }
    
    const deleteQuery = 'DELETE FROM lessons WHERE id = $1 RETURNING *'
    const result = await pool.query(deleteQuery, [id])
    
    res.json({
      success: true,
      message: "Les succesvol verwijderd!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Delete lesson error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij verwijderen les" 
    })
  }
}

// Get today's lessons
const getTodayLessons = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.*,
        s.naam as student_naam,
        s.telefoon as student_telefoon,
        i.naam as instructeur_naam,
        v.merk, v.model, v.kenteken
      FROM lessons l
      JOIN students s ON l.student_id = s.id
      JOIN instructeurs i ON l.instructeur_id = i.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      WHERE l.datum = CURRENT_DATE
      ORDER BY l.tijd
    `
    
    const result = await pool.query(query)
    
    res.json({
      success: true,
      data: result.rows
    })
    
  } catch (error) {
    console.error("Get today lessons error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen lessen van vandaag" 
    })
  }
}

// Get week lessons
const getWeekLessons = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.*,
        s.naam as student_naam,
        i.naam as instructeur_naam,
        v.merk, v.model, v.kenteken
      FROM lessons l
      JOIN students s ON l.student_id = s.id
      JOIN instructeurs i ON l.instructeur_id = i.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      WHERE l.datum >= CURRENT_DATE 
        AND l.datum <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY l.datum, l.tijd
    `
    
    const result = await pool.query(query)
    
    res.json({
      success: true,
      data: result.rows
    })
    
  } catch (error) {
    console.error("Get week lessons error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen lessen van deze week" 
    })
  }
}

// Get month lessons
const getMonthLessons = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.*,
        s.naam as student_naam,
        i.naam as instructeur_naam,
        v.merk, v.model, v.kenteken
      FROM lessons l
      JOIN students s ON l.student_id = s.id
      JOIN instructeurs i ON l.instructeur_id = i.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      WHERE l.datum >= CURRENT_DATE 
        AND l.datum <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY l.datum, l.tijd
    `
    
    const result = await pool.query(query)
    
    res.json({
      success: true,
      data: result.rows
    })
    
  } catch (error) {
    console.error("Get month lessons error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen lessen van deze maand" 
    })
  }
}

// Check conflicts
const checkConflicts = async (req, res) => {
  try {
    const { datum, tijd, instructeur_id, vehicle_id, exclude_lesson_id } = req.query
    
    if (!datum || !tijd || !instructeur_id) {
      return res.status(400).json({ 
        success: false,
        message: "Datum, tijd en instructeur_id zijn verplicht!" 
      })
    }
    
    let conflictQuery = `
      SELECT 
        l.*,
        s.naam as student_naam,
        i.naam as instructeur_naam,
        v.merk, v.model, v.kenteken
      FROM lessons l
      JOIN students s ON l.student_id = s.id
      JOIN instructeurs i ON l.instructeur_id = i.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      WHERE l.datum = $1 AND l.tijd = $2 
      AND (l.instructeur_id = $3 OR (l.vehicle_id = $4 AND $4 IS NOT NULL))
      AND l.status NOT IN ('Geannuleerd')
    `
    
    let params = [datum, tijd, instructeur_id, vehicle_id]
    
    if (exclude_lesson_id) {
      conflictQuery += ' AND l.id != $5'
      params.push(exclude_lesson_id)
    }
    
    const result = await pool.query(conflictQuery, params)
    
    res.json({
      success: true,
      conflicts: result.rows.length > 0,
      data: result.rows
    })
    
  } catch (error) {
    console.error("Check conflicts error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij controleren conflicten" 
    })
  }
}

// Update lesson status only
const updateLesStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({ 
        success: false,
        message: "Status is verplicht!" 
      })
    }
    
    const validStatuses = ['Gepland', 'Bevestigd', 'Voltooid', 'Geannuleerd']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Ongeldige status!" 
      })
    }
    
    const updateQuery = `
      UPDATE lessons 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `
    
    const result = await pool.query(updateQuery, [status, id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Les niet gevonden!" 
      })
    }
    
    res.json({
      success: true,
      message: "Les status succesvol bijgewerkt!",
      data: result.rows[0]
    })
    
  } catch (error) {
    console.error("Update lesson status error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij bijwerken les status" 
    })
  }
}

// Bulk create lessons (placeholder)
const createBulkLessons = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Bulk create functionaliteit nog niet geïmplementeerd"
    })
  } catch (error) {
    console.error("Bulk create lessons error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij bulk aanmaken lessen" 
    })
  }
}

// Bulk update lessons (placeholder)
const updateBulkLessons = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Bulk update functionaliteit nog niet geïmplementeerd"
    })
  } catch (error) {
    console.error("Bulk update lessons error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij bulk bijwerken lessen" 
    })
  }
}

// Bulk delete lessons (placeholder)
const deleteBulkLessons = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Bulk delete functionaliteit nog niet geïmplementeerd"
    })
  } catch (error) {
    console.error("Bulk delete lessons error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij bulk verwijderen lessen" 
    })
  }
}

module.exports = {
  getAllLessen,
  getLesById,
  createLes,
  updateLes,
  deleteLes,
  getTodayLessons,
  getWeekLessons,
  getMonthLessons,
  checkConflicts,
  updateLesStatus,
  createBulkLessons,
  updateBulkLessons,
  deleteBulkLessons
}