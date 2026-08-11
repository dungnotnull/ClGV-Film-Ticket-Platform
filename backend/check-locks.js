const Redis = require('ioredis');
const client = new Redis();

async function checkKeys() {
  const keys = await client.keys('*lock*');
  console.log('Lock keys:', keys);
  for (const key of keys) {
    const value = await client.get(key);
    console.log(`Key ${key}: ${value}`);
  }
  client.disconnect();
}
checkKeys().catch(console.error);
