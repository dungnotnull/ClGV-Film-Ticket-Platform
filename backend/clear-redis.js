const Redis = require('ioredis');
const client = new Redis();

async function clear() {
  await client.flushall();
  console.log("Redis cache cleared!");
  client.disconnect();
}
clear().catch(console.error);
