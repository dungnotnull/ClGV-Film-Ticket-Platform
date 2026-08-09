import { PrismaClient, Role, MembershipTier } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning existing database data...');

  // Delete all existing records in correct order to respect foreign key constraints
  await prisma.ticket.deleteMany();
  await prisma.bookingCombo.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.showtimeSeat.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.combo.deleteMany();
  await prisma.userVoucher.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.movieReview.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.cinema.deleteMany();
  await prisma.city.deleteMany();
  await prisma.cGVCardTransaction.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleaned successfully!');

  // 1. Seed Core Accounts Only (Admin & Customer for testing)
  console.log('🌱 Seeding core user accounts...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@clgv.vn',
      password: passwordHash,
      fullName: 'Quản Trị Viên CGV',
      phone: '0900000001',
      role: Role.ADMIN,
      membershipTier: MembershipTier.VVIP,
      points: 0,
      cgvCardBalance: 10000000,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@clgv.vn',
      password: passwordHash,
      fullName: 'Nguyễn Văn Khách',
      phone: '0909999999',
      role: Role.CUSTOMER,
      membershipTier: MembershipTier.MEMBER,
      points: 0,
      cgvCardBalance: 0,
      isU22Verified: false,
    },
  });

  console.log('✅ Core users created:');
  console.log('   - Admin:    admin@clgv.vn / Password123!');
  console.log('   - Customer: customer@clgv.vn / Password123!');
  console.log('🎉 Clean seeding completed! You can now input your own data via the CMS Admin dashboard.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

