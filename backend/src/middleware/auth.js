const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[auth] Missing or malformed Authorization header:', authHeader)
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  if (!token || token === 'undefined' || token === 'null') {
    console.log('[auth] Token is empty/undefined string')
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.supporterId = decoded.id
    next()
  } catch (err) {
    console.log('[auth] JWT verify failed:', err.message)
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = { protect }
