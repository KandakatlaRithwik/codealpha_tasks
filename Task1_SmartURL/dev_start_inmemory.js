// Dev helper: start an in-memory MongoDB and then start the app
(async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('Started in-memory MongoDB at', uri);

    process.env.MONGO_URI = uri;
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

    require('./server');

    process.on('SIGINT', async () => {
      console.log('Stopping in-memory MongoDB');
      await mongod.stop();
      process.exit(0);
    });
  } catch (err) {
    console.error('Failed to start in-memory DB or server:', err);
    process.exit(1);
  }
})();
