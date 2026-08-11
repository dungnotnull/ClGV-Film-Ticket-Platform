const Redis = require('ioredis');
const client = new Redis();

async function test() {
  const key = 'test:lock';
  const userId = '123';
  const res = await client.set(key, userId, 'EX', 600, 'NX');
  console.log('SET NX result:', res);
  
  const current = await client.get(key);
  console.log('Current value:', current);
  
  const res2 = await client.set(key, '456', 'EX', 600, 'NX');
  console.log('SET NX second time:', res2);

  await client.del(key);
  client.disconnect();
}
test().catch(console.error);
