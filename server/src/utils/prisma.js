const { PrismaClient } = require('@prisma/client');

// Singleton PrismaClient instance to avoid connection exhaustion in dev/testing
const prisma = new PrismaClient();

module.exports = prisma;
