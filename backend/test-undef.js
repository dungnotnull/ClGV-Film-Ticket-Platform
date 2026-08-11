const Redis = require('ioredis');
const client = new Redis();

async function test() {
  try {
    const key = 'test:undef';
    const res = await client.set(key, undefined, 'EX', 600, 'NX');
    console.log('Result:', res);
  } catch(e) {
    console.log('Error:', e.message);
  }
  client.disconnect();
}
test();
