const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

async function startServer() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log(uri);
}

startServer();
