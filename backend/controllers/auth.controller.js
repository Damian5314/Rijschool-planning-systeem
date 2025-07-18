const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.login = async (req, res) => {
  const { email, wachtwoord } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Gebruiker niet gevonden' });

    const isMatch = await user.comparePassword(wachtwoord);
    if (!isMatch) return res.status(400).json({ message: 'Ongeldig wachtwoord' });

    const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, naam: user.naam, email: user.email, rol: user.rol } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};