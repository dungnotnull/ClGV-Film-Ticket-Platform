import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding City, Cinema and Hall...');
  
  const city = await prisma.city.create({
    data: {
      name: 'Hồ Chí Minh',
      code: 'HCM',
    }
  });

  const cinema = await prisma.cinema.create({
    data: {
      name: 'CGV Vincom Landmark 81',
      address: 'Vincom Landmark 81, 720A Điện Biên Phủ, P.22, Q.Bình Thạnh',
      cityId: city.id,
    }
  });

  // Create a 5x5 grid
  const grid = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    const rowLabel = String.fromCharCode(65 + r); // A, B, C...
    for (let c = 0; c < 5; c++) {
      row.push({
        id: `${rowLabel}${c+1}`,
        row: rowLabel,
        col: c + 1,
        type: 'STANDARD',
        isBlocked: false,
        priceModifier: 1.0
      });
    }
    grid.push(row);
  }

  const hall = await prisma.hall.create({
    data: {
      name: 'IMAX 01',
      cinemaId: cinema.id,
      roomMatrix: {
        grid: grid,
      }
    }
  });

  console.log('✅ Created Cinema and Hall successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
