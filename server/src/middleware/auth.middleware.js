const { verifyToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

// Authenticates JWT from Authorization: Bearer <token>
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Authentication required: missing or invalid Bearer token'
      }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User belonging to this token no longer exists'
        }
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        message: 'Invalid or expired authentication token'
      }
    });
  }
};

// Enforces role-based access control (RBAC)
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        error: {
          message: `Access denied: requires ${role} role`
        }
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole
};
