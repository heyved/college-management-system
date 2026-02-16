const jwt = require('jsonwebtoken');

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE,
  
  generateToken: (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      issuer: 'hexaware-cms',
      audience: 'cms-users'
    });
  },

  generateRefreshToken: (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshExpiresIn,
      issuer: 'hexaware-cms',
      audience: 'cms-users'
    });
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, jwtConfig.secret, {
        issuer: 'hexaware-cms',
        audience: 'cms-users'
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
};

module.exports = jwtConfig;