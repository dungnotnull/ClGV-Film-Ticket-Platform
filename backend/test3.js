const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const movies = await prisma.movie.findMany({
    where: {
      showtimes: { some: {} }
    },
    select: { title: true }
  });
  console.log("Movies with showtimes:");
  movies.forEach(m => console.log("- " + m.title));
}
main().catch(console.error).finally(() => prisma.$disconnect());
