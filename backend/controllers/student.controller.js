const { pool } = require("../config/db")

// Get all students met uitgebreide info
const getAllStudents = async (req, res) => {
  try {
    const { status, instructeur_id, page = 1, limit = 50 } = req.query
    
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
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM students s
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
    console.error("Get all students error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen studenten" 
    })
  }
}

// Get student by ID met alle gerelateerde data
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params

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
      return res.status(404).json({ 
        success: false,
        message: "Student niet gevonden!" 
      })
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

    res.json({
      success: true,
      data: {
        ...student,
        les_geschiedenis: lesGeschiedenisResult.rows,
        examens: examensResult.rows,
        transacties: transactiesResult.rows,
        komende_lessen: komendeLessenResult.rows
      }
    })

  } catch (error) {
    console.error("Get student by ID error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen student" 
    })
  }
}

// Create nieuwe student
const createStudent = async (req, res) => {
  try {
    const { 
      naam, email, telefoon, adres, postcode, plaats, geboortedatum,
      rijbewijs_type = 'B', transmissie = 'Handgeschakeld', status = 'Actief',
      instructeur_id, tegoed = 0, openstaand_bedrag = 0
    } = req.body
    
    // Input validatie
    if (!naam || !email) {
      return res.status(400).json({ 
        success: false,
        message: "Naam en email zijn verplicht!" 
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Ongeldig email formaat!" 
      })
    }

    // Check if email already exists
    const existingQuery = 'SELECT id FROM students WHERE email = $1'
    const existing = await pool.query(existingQuery, [email.toLowerCase()])
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Student met dit email bestaat al!" 
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
    
    res.status(201).json({
      success: true,
      message: "Student succesvol aangemaakt!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Create student error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij aanmaken student" 
    })
  }
}

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params
    const updateFields = req.body
    
    // Check if student exists
    const existingQuery = 'SELECT * FROM students WHERE id = $1'
    const existing = await pool.query(existingQuery, [id])
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Student niet gevonden!" 
      })
    }

    // Check email uniqueness if email is being updated
    if (updateFields.email) {
      const emailCheckQuery = 'SELECT id FROM students WHERE email = $1 AND id != $2'
      const emailCheck = await pool.query(emailCheckQuery, [updateFields.email.toLowerCase(), id])
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: "Email is al in gebruik door andere student!" 
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
      'naam', 'email', 'telefoon', 'adres', 'postcode', 'plaats', 'geboortedatum',
      'rijbewijs_type', 'transmissie', 'status', 'instructeur_id', 'tegoed', 
      'openstaand_bedrag', 'laatste_betaling'
    ]
    
    const updatePairs = []
    const queryParams = []
    let paramCount = 0

    Object.keys(updateFields).forEach(field => {
      if (allowedFields.includes(field) && updateFields[field] !== undefined) {
        paramCount++
        updatePairs.push(`${field} = $${paramCount}`)
        queryParams.push(field === 'email' ? updateFields[field].toLowerCase() : updateFields[field])
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
      UPDATE students 
      SET ${updatePairs.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `
    
    const result = await pool.query(updateQuery, queryParams)
    
    res.json({
      success: true,
      message: "Student succesvol bijgewerkt!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Update student error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij bijwerken student" 
    })
  }
}

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if student exists
    const existingQuery = 'SELECT * FROM students WHERE id = $1'
    const existing = await pool.query(existingQuery, [id])
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Student niet gevonden!" 
      })
    }

    // Check if student has future lessons
    const futureLessonsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM lessons WHERE student_id = $1 AND datum >= CURRENT_DATE', 
      [id]
    )

    if (futureLessonsCheck.rows[0].count > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Kan student niet verwijderen: heeft nog geplande lessen!" 
      })
    }

    // Check outstanding balance
    const student = existing.rows[0]
    if (student.openstaand_bedrag > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Kan student niet verwijderen: heeft nog openstaand bedrag!" 
      })
    }
    
    const deleteQuery = 'DELETE FROM students WHERE id = $1 RETURNING *'
    const result = await pool.query(deleteQuery, [id])
    
    res.json({
      success: true,
      message: "Student succesvol verwijderd!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Delete student error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij verwijderen student" 
    })
  }
}

// Add financial transaction
const addTransactie = async (req, res) => {
  try {
    const { id } = req.params // student_id
    const { bedrag, type, beschrijving } = req.body

    if (!bedrag || !type) {
      return res.status(400).json({ 
        success: false,
        message: "Bedrag en type zijn verplicht!" 
      })
    }

    // Check if student exists
    const studentCheck = await pool.query('SELECT * FROM students WHERE id = $1', [id])
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Student niet gevonden!" 
      })
    }

    // Insert transaction
    const insertQuery = `
      INSERT INTO transacties (student_id, bedrag, type, beschrijving)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const result = await pool.query(insertQuery, [id, bedrag, type, beschrijving])

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
      await pool.query(balanceUpdate, [Math.abs(bedrag), id])
    }

    res.status(201).json({
      success: true,
      message: "Transactie succesvol toegevoegd!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Add transaction error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij toevoegen transactie" 
    })
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  addTransactie
}