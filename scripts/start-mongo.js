
const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log(uri);
  // Keep it running
  process.stdin.resume();
}

start();
