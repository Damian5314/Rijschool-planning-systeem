const { body, param, query, validationResult } = require('express-validator')

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validatie fouten gevonden",
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    })
  }
  next()
}

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .withMessage('Ongeldig email formaat')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email mag maximaal 255 karakters zijn'),
    
  password: body('wachtwoord')
    .isLength({ min: 6, max: 128 })
    .withMessage('Wachtwoord moet tussen 6 en 128 karakters zijn')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Wachtwoord moet minimaal 1 kleine letter, 1 hoofdletter en 1 cijfer bevatten'),
    
  naam: body('naam')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Naam moet tussen 2 en 255 karakters zijn')
    .matches(/^[a-zA-Z\s\-'\.À-ž]+$/)
    .withMessage('Naam mag alleen letters, spaties, streepjes en apostrofes bevatten'),
    
  telefoon: body('telefoon')
    .optional()
    .isMobilePhone('nl-NL')
    .withMessage('Ongeldig Nederlands telefoonnummer'),
    
  postcode: body('postcode')
    .optional()
    .matches(/^[1-9][0-9]{3} ?[A-Z]{2}$/i)
    .withMessage('Ongeldig Nederlandse postcode (bijv. 1234AB)')
    .customSanitizer(value => value ? value.toUpperCase().replace(/\s/g, '') : value),
    
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID moet een positief getal zijn'),
    
  page: query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Pagina moet tussen 1 en 1000 zijn'),
    
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit moet tussen 1 en 100 zijn')
}

// Auth validation
const validateSignup = [
  commonValidations.naam,
  commonValidations.email,
  commonValidations.password,
  body('rol')
    .optional()
    .isIn(['gebruiker', 'admin', 'instructeur'])
    .withMessage('Rol moet gebruiker, admin of instructeur zijn'),
  handleValidationErrors
]

const validateSignin = [
  commonValidations.email,
  body('wachtwoord')
    .notEmpty()
    .withMessage('Wachtwoord is verplicht'),
  handleValidationErrors
]

const validateChangePassword = [
  body('huidigWachtwoord')
    .notEmpty()
    .withMessage('Huidig wachtwoord is verplicht'),
  commonValidations.password,
  handleValidationErrors
]

// Student validation
const validateCreateStudent = [
  commonValidations.naam,
  commonValidations.email,
  commonValidations.telefoon,
  body('adres')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Adres mag maximaal 500 karakters zijn'),
  commonValidations.postcode,
  body('plaats')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Plaats mag maximaal 100 karakters zijn'),
  body('geboortedatum')
    .optional()
    .isISO8601()
    .withMessage('Ongeldige geboortedatum')
    .custom(value => {
      if (value) {
        const birthDate = new Date(value)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        if (age < 16 || age > 100) {
          throw new Error('Leeftijd moet tussen 16 en 100 jaar zijn')
        }
      }
      return true
    }),
  body('rijbewijs_type')
    .optional()
    .isIn(['B', 'A', 'C'])
    .withMessage('Rijbewijs type moet B, A of C zijn'),
  body('transmissie')
    .optional()
    .isIn(['Handgeschakeld', 'Automaat'])
    .withMessage('Transmissie moet Handgeschakeld of Automaat zijn'),
  body('status')
    .optional()
    .isIn(['Actief', 'Inactief', 'Gepauzeerd', 'Afgestudeerd'])
    .withMessage('Status moet Actief, Inactief, Gepauzeerd of Afgestudeerd zijn'),
  body('instructeur_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Instructeur ID moet een positief getal zijn'),
  body('tegoed')
    .optional()
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Tegoed moet tussen 0 en 9999.99 zijn'),
  body('openstaand_bedrag')
    .optional()
    .isFloat({ min: 0, max: 99999.99 })
    .withMessage('Openstaand bedrag moet tussen 0 en 99999.99 zijn'),
  handleValidationErrors
]

const validateUpdateStudent = [
  commonValidations.id,
  body('naam').optional(),
  body('email').optional(),
  body('telefoon').optional(),
  body('adres').optional(),
  body('postcode').optional(),
  body('plaats').optional(),
  body('geboortedatum').optional(),
  body('rijbewijs_type').optional(),
  body('transmissie').optional(),
  body('status').optional(),
  body('instructeur_id').optional(),
  body('tegoed').optional(),
  body('openstaand_bedrag').optional(),
  ...validateCreateStudent.slice(1, -1), // Gebruik dezelfde validaties maar als optional
  handleValidationErrors
]

// Instructeur validation
const validateCreateInstructeur = [
  commonValidations.naam,
  commonValidations.email,
  commonValidations.telefoon,
  body('rijbewijs_type')
    .optional()
    .isArray()
    .withMessage('Rijbewijs types moet een array zijn')
    .custom(value => {
      if (value && value.some(type => !['B', 'A', 'C', 'D', 'E'].includes(type))) {
        throw new Error('Ongeldige rijbewijs types')
      }
      return true
    }),
  body('status')
    .optional()
    .isIn(['Actief', 'Inactief'])
    .withMessage('Status moet Actief of Inactief zijn'),
  handleValidationErrors
]

const validateUpdateInstructeur = [
  commonValidations.id,
  ...validateCreateInstructeur.slice(0, -1).map(validation => {
    if (validation.builder) {
      return validation.optional()
    }
    return validation
  }),
  handleValidationErrors
]

// Les validation
const validateCreateLes = [
  body('datum')
    .isISO8601()
    .withMessage('Ongeldige datum')
    .custom(value => {
      const lesDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (lesDate < today) {
        throw new Error('Les datum mag niet in het verleden zijn')
      }
      return true
    }),
  body('tijd')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Ongeldige tijd (gebruik HH:MM formaat)'),
  body('duur')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duur moet tussen 15 en 480 minuten zijn'),
  body('student_id')
    .isInt({ min: 1 })
    .withMessage('Student ID is verplicht en moet een positief getal zijn'),
  body('instructeur_id')
    .isInt({ min: 1 })
    .withMessage('Instructeur ID is verplicht en moet een positief getal zijn'),
  body('vehicle_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Vehicle ID moet een positief getal zijn'),
  body('type')
    .optional()
    .isIn(['Rijles', 'Examen', 'Intake', 'Anders'])
    .withMessage('Type moet Rijles, Examen, Intake of Anders zijn'),
  body('status')
    .optional()
    .isIn(['Gepland', 'Bevestigd', 'Voltooid', 'Geannuleerd'])
    .withMessage('Status moet Gepland, Bevestigd, Voltooid of Geannuleerd zijn'),
  body('opmerkingen')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Opmerkingen mogen maximaal 1000 karakters zijn'),
  body('prijs')
    .optional()
    .isFloat({ min: 0, max: 999.99 })
    .withMessage('Prijs moet tussen 0 en 999.99 zijn'),
  handleValidationErrors
]

const validateUpdateLes = [
  commonValidations.id,
  ...validateCreateLes.slice(0, -1).map(validation => {
    if (validation.builder) {
      return validation.optional()
    }
    return validation
  }),
  handleValidationErrors
]

// Vehicle validation
const validateCreateVehicle = [
  body('merk')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Merk moet tussen 2 en 100 karakters zijn'),
  body('model')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model moet tussen 1 en 100 karakters zijn'),
  body('bouwjaar')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage(`Bouwjaar moet tussen 1990 en ${new Date().getFullYear() + 1} zijn`),
  body('kenteken')
    .trim()
    .matches(/^[A-Z0-9]{6}$|^[0-9]{1,3}-[A-Z]{1,3}-[0-9]{1,3}$|^[A-Z]{1,3}-[0-9]{1,3}-[A-Z]{1,3}$/i)
    .withMessage('Ongeldig Nederlands kenteken formaat')
    .customSanitizer(value => value.toUpperCase().replace(/[-\s]/g, '')),
  body('transmissie')
    .isIn(['Handgeschakeld', 'Automaat'])
    .withMessage('Transmissie moet Handgeschakeld of Automaat zijn'),
  body('brandstof')
    .isIn(['benzine', 'diesel', 'elektrisch', 'hybride'])
    .withMessage('Brandstof moet benzine, diesel, elektrisch of hybride zijn'),
  body('kilometerstand')
    .optional()
    .isInt({ min: 0, max: 9999999 })
    .withMessage('Kilometerstand moet tussen 0 en 9999999 zijn'),
  body('laatste_onderhoud')
    .optional()
    .isISO8601()
    .withMessage('Ongeldige laatste onderhoud datum'),
  body('volgende_onderhoud')
    .optional()
    .isISO8601()
    .withMessage('Ongeldige volgende onderhoud datum'),
  body('apk_datum')
    .optional()
    .isISO8601()
    .withMessage('Ongeldige APK datum'),
  body('status')
    .optional()
    .isIn(['beschikbaar', 'onderhoud', 'defect'])
    .withMessage('Status moet beschikbaar, onderhoud of defect zijn'),
  body('instructeur_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Instructeur ID moet een positief getal zijn'),
  handleValidationErrors
]

const validateUpdateVehicle = [
  commonValidations.id,
  ...validateCreateVehicle.slice(0, -1).map(validation => {
    if (validation.builder) {
      return validation.optional()
    }
    return validation
  }),
  handleValidationErrors
]

// Transaction validation
const validateTransaction = [
  commonValidations.id,
  body('bedrag')
    .isFloat({ min: -99999.99, max: 99999.99 })
    .withMessage('Bedrag moet tussen -99999.99 en 99999.99 zijn'),
  body('type')
    .isIn(['betaling', 'factuur', 'korting'])
    .withMessage('Type moet betaling, factuur of korting zijn'),
  body('beschrijving')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Beschrijving mag maximaal 500 karakters zijn'),
  handleValidationErrors
]

// Query validation for pagination and filtering
const validatePagination = [
  commonValidations.page,
  commonValidations.limit,
  handleValidationErrors
]

const validateDateRange = [
  query('startDatum')
    .optional()
    .isISO8601()
    .withMessage('Ongeldige start datum'),
  query('eindDatum')
    .optional()
    .isISO8601()
    .withMessage('Ongeldige eind datum')
    .custom((value, { req }) => {
      if (value && req.query.startDatum) {
        const start = new Date(req.query.startDatum)
        const end = new Date(value)
        if (end <= start) {
          throw new Error('Eind datum moet na start datum zijn')
        }
      }
      return true
    }),
  handleValidationErrors
]

module.exports = {
  // Auth validations
  validateSignup,
  validateSignin,
  validateChangePassword,
  
  // Student validations
  validateCreateStudent,
  validateUpdateStudent,
  
  // Instructeur validations
  validateCreateInstructeur,
  validateUpdateInstructeur,
  
  // Les validations
  validateCreateLes,
  validateUpdateLes,
  
  // Vehicle validations
  validateCreateVehicle,
  validateUpdateVehicle,
  
  // Transaction validation
  validateTransaction,
  
  // Query validations
  validatePagination,
  validateDateRange,
  
  // Common validations
  validateId: [commonValidations.id, handleValidationErrors],
  
  // Helper
  handleValidationErrors
}