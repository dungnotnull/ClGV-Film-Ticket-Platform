const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const showtime = await prisma.showtime.findFirst({
    include: { seats: true }
  });
  if (showtime) {
    console.log("First seat:", showtime.seats[0]);
  } else {
    console.log("No showtimes found in DB.");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
