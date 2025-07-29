const { pool } = require("../config/db")

// Get all instructeurs met uitgebreide info
const getAllInstructeurs = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.*,
        u.naam as user_naam,
        u.email as user_email,
        (SELECT COUNT(*) FROM students WHERE instructeur_id = i.id) as aantal_studenten,
        (SELECT COUNT(*) FROM lessons WHERE instructeur_id = i.id AND datum >= CURRENT_DATE) as komende_lessen
      FROM instructeurs i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
    `
    const result = await pool.query(query)
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error("Get all instructeurs error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen instructeurs" 
    })
  }
}

// Get instructeur by ID met alle gerelateerde data
const getInstructeurById = async (req, res) => {
  try {
    const { id } = req.params

    // Get instructeur with user info
    const instructeurQuery = `
      SELECT 
        i.*,
        u.naam as user_naam,
        u.email as user_email,
        u.actief as user_actief
      FROM instructeurs i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.id = $1
    `
    const instructeurResult = await pool.query(instructeurQuery, [id])
    
    if (instructeurResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Instructeur niet gevonden!" 
      })
    }

    const instructeur = instructeurResult.rows[0]

    // Get students van deze instructeur
    const studentsQuery = `
      SELECT id, naam, email, status, created_at
      FROM students 
      WHERE instructeur_id = $1
      ORDER BY naam
    `
    const studentsResult = await pool.query(studentsQuery, [id])

    // Get vehicles van deze instructeur
    const vehiclesQuery = `
      SELECT id, merk, model, kenteken, status
      FROM vehicles 
      WHERE instructeur_id = $1
      ORDER BY merk, model
    `
    const vehiclesResult = await pool.query(vehiclesQuery, [id])

    // Get recente lessen
    const lessonsQuery = `
      SELECT 
        l.id, l.datum, l.tijd, l.duur, l.type, l.status,
        s.naam as student_naam
      FROM lessons l
      JOIN students s ON l.student_id = s.id
      WHERE l.instructeur_id = $1
      ORDER BY l.datum DESC, l.tijd DESC
      LIMIT 10
    `
    const lessonsResult = await pool.query(lessonsQuery, [id])

    res.json({
      success: true,
      data: {
        ...instructeur,
        students: studentsResult.rows,
        vehicles: vehiclesResult.rows,
        recente_lessen: lessonsResult.rows
      }
    })

  } catch (error) {
    console.error("Get instructeur by ID error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen instructeur" 
    })
  }
}

// Create nieuwe instructeur
const createInstructeur = async (req, res) => {
  try {
    const { naam, email, telefoon, rijbewijs_type = ['B'], status = 'Actief' } = req.body
    
    // Input validatie
    if (!naam || !email) {
      return res.status(400).json({ 
        success: false,
        message: "Naam en email zijn verplicht!" 
      })
    }

    // Check if email already exists
    const existingQuery = 'SELECT id FROM instructeurs WHERE email = $1'
    const existing = await pool.query(existingQuery, [email.toLowerCase()])
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Instructeur met dit email bestaat al!" 
      })
    }
    
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
    
    res.status(201).json({
      success: true,
      message: "Instructeur succesvol aangemaakt!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Create instructeur error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij aanmaken instructeur" 
    })
  }
}

// Update instructeur
const updateInstructeur = async (req, res) => {
  try {
    const { id } = req.params
    const { naam, email, telefoon, rijbewijs_type, status } = req.body
    
    // Check if instructeur exists
    const existingQuery = 'SELECT * FROM instructeurs WHERE id = $1'
    const existing = await pool.query(existingQuery, [id])
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Instructeur niet gevonden!" 
      })
    }

    // Check email uniqueness (exclude current record)
    if (email) {
      const emailCheckQuery = 'SELECT id FROM instructeurs WHERE email = $1 AND id != $2'
      const emailCheck = await pool.query(emailCheckQuery, [email.toLowerCase(), id])
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: "Email is al in gebruik door andere instructeur!" 
        })
      }
    }
    
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
    
    res.json({
      success: true,
      message: "Instructeur succesvol bijgewerkt!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Update instructeur error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij bijwerken instructeur" 
    })
  }
}

// Delete instructeur
const deleteInstructeur = async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if instructeur exists
    const existingQuery = 'SELECT * FROM instructeurs WHERE id = $1'
    const existing = await pool.query(existingQuery, [id])
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Instructeur niet gevonden!" 
      })
    }

    // Check if instructeur has active students or lessons
    const studentsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM students WHERE instructeur_id = $1', 
      [id]
    )
    const lessonsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM lessons WHERE instructeur_id = $1 AND datum >= CURRENT_DATE', 
      [id]
    )

    if (studentsCheck.rows[0].count > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Kan instructeur niet verwijderen: heeft nog actieve studenten!" 
      })
    }

    if (lessonsCheck.rows[0].count > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Kan instructeur niet verwijderen: heeft nog geplande lessen!" 
      })
    }
    
    const deleteQuery = 'DELETE FROM instructeurs WHERE id = $1 RETURNING *'
    const result = await pool.query(deleteQuery, [id])
    
    res.json({
      success: true,
      message: "Instructeur succesvol verwijderd!",
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Delete instructeur error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij verwijderen instructeur" 
    })
  }
}

// Get planning van instructeur
const getInstructeurPlanning = async (req, res) => {
  try {
    const { id } = req.params
    const { startDatum, eindDatum } = req.query

    let dateFilter = ''
    let queryParams = [id]
    
    if (startDatum && eindDatum) {
      dateFilter = 'AND l.datum BETWEEN $2 AND $3'
      queryParams.push(startDatum, eindDatum)
    } else {
      dateFilter = 'AND l.datum >= CURRENT_DATE'
    }

    const planningQuery = `
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
    
    const result = await pool.query(planningQuery, queryParams)
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })

  } catch (error) {
    console.error("Get instructeur planning error:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij ophalen planning" 
    })
  }
}

module.exports = {
  getAllInstructeurs,
  getInstructeurById,
  createInstructeur,
  updateInstructeur,
  deleteInstructeur,
  getInstructeurPlanning
}