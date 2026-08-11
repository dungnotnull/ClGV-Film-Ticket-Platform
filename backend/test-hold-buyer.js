const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function testApi() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'buyer@gmail.com' } });
    if (!user) {
      console.log("No buyer@gmail.com found");
      return;
    }
    console.log("User ID:", user.id);

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, 'clgv_jwt_super_secret_key_2026');

    const showtimeId = 'aa9df5cf-5acb-455f-bbf7-f5e3a3a8fbb5';
    console.log("Testing showtime:", showtimeId);

    const holdRes = await fetch('http://localhost:4000/api/v1/bookings/hold-seat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ showtimeId, seatIds: ['A2'] })
    });
    
    console.log("Hold seat status:", holdRes.status);
    const text = await holdRes.text();
    console.log("Hold seat response:", text);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
testApi();
