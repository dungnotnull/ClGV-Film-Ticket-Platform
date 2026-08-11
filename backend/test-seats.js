const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const showtime = await prisma.showtime.findFirst({
    include: { hall: true }
  });
  if (showtime) {
    console.log("Showtime ID:", showtime.id);
    const res = await fetch(`http://localhost:4000/api/v1/showtimes/${showtime.id}/seats`);
    const json = await res.json();
    console.log("Response:", JSON.stringify(json).substring(0, 500));
  } else {
    console.log("No showtimes found in DB.");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
