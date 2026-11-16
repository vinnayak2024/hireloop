const app = require('./app');
const config = require('./config/env');
const prisma = require('./utils/prisma');

const server = app.listen(config.PORT, () => {
  console.log(`HireLoop server running on port ${config.PORT} [${config.NODE_ENV}]`);
});

// Graceful shutdown handling
const shutdown = async () => {
  console.log('\nShutting down server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database connection closed. Process exited.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
