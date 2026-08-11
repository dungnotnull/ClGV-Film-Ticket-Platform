const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApi() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found");
      return;
    }
    console.log("User ID:", user.id);

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, 'clgv_jwt_super_secret_key_2026');

    const stRes = await fetch('http://localhost:4000/api/v1/showtimes');
    const stData = await stRes.json();
    const showtimeId = stData.data[0].id;
    console.log("Got showtime:", showtimeId);

    const holdRes = await fetch('http://localhost:4000/api/v1/bookings/hold-seat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ showtimeId, seatIds: ['A1'] })
    });
    const holdData = await holdRes.json();
    console.log("Hold seat status:", holdRes.status);
    console.log("Hold seat response:", holdData);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
testApi();
