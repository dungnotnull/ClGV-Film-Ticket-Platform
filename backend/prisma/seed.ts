import { PrismaClient, Role, MovieStatus, AgeRating, ScreenType, BannerStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Admin & Customer Users
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const customerPassword = await bcrypt.hash('CustomerPassword123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@clgv.vn' },
    update: {},
    create: {
      email: 'admin@clgv.vn',
      password: adminPassword,
      fullName: 'Quản Trị Viên ClGV',
      phone: '0900000001',
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@clgv.vn' },
    update: {},
    create: {
      email: 'customer@clgv.vn',
      password: customerPassword,
      fullName: 'Nguyễn Văn Khách',
      phone: '0909999999',
      role: Role.CUSTOMER,
    },
  });

  console.log('✅ Users seeded:', { admin: admin.email, customer: customer.email });

  // 2. Seed Cities
  const cityHCM = await prisma.city.upsert({
    where: { code: 'HCM' },
    update: {},
    create: {
      name: 'TP. Hồ Chí Minh',
      code: 'HCM',
      displayOrder: 1,
    },
  });

  const cityHN = await prisma.city.upsert({
    where: { code: 'HN' },
    update: {},
    create: {
      name: 'Hà Nội',
      code: 'HN',
      displayOrder: 2,
    },
  });

  const cityDN = await prisma.city.upsert({
    where: { code: 'DN' },
    update: {},
    create: {
      name: 'Đà Nẵng',
      code: 'DN',
      displayOrder: 3,
    },
  });

  console.log('✅ Cities seeded:', [cityHCM.name, cityHN.name, cityDN.name]);

  // 3. Seed Cinema Clusters
  const cgvVincomHCM = await prisma.cinema.create({
    data: {
      cityId: cityHCM.id,
      name: 'CGV Vincom Đồng Khởi',
      address: '72 Lê Thánh Tôn, Q.1, TP.HCM',
      phone: '1900 6017',
      amenities: ['Bãi đậu xe', 'Popcorn Bar', 'L\'Amour Bed', 'IMAX Screen'],
    },
  });

  const cgvCrescentMall = await prisma.cinema.create({
    data: {
      cityId: cityHCM.id,
      name: 'CGV Crescent Mall',
      address: '101 Tôn Dật Tiên, Q.7, TP.HCM',
      phone: '1900 6017',
      amenities: ['Bãi đậu xe', 'Popcorn Bar', 'Gold Class'],
    },
  });

  const cgvBaTrieuHN = await prisma.cinema.create({
    data: {
      cityId: cityHN.id,
      name: 'CGV Vincom Bà Triệu',
      address: '191 Bà Triệu, Q.Hai Bà Trưng, Hà Nội',
      phone: '1900 6017',
      amenities: ['Bãi đậu xe', 'Popcorn Bar', '4DX Screen'],
    },
  });

  console.log('✅ Cinemas seeded:', [cgvVincomHCM.name, cgvCrescentMall.name, cgvBaTrieuHN.name]);

  // Sample Room Matrix Layout
  const sampleMatrixJSON = {
    dimensions: { rows: 8, cols: 12 },
    aisles: { vertical: [4, 8], horizontal: [4] },
    grid: [
      [
        { id: 'A1', row: 'A', col: 1, type: 'STANDARD', priceModifier: 1.0, isBlocked: false },
        { id: 'A2', row: 'A', col: 2, type: 'STANDARD', priceModifier: 1.0, isBlocked: false },
        { id: 'A3', row: 'A', col: 3, type: 'STANDARD', priceModifier: 1.0, isBlocked: false },
        { id: 'A4', row: 'A', col: 4, type: 'STANDARD', priceModifier: 1.0, isBlocked: false },
        { id: 'A5', row: 'A', col: 5, type: 'STANDARD', priceModifier: 1.0, isBlocked: false },
        { id: 'A6', row: 'A', col: 6, type: 'STANDARD', priceModifier: 1.0, isBlocked: false },
        { id: 'A7', row: 'A', col: 7, type: 'STANDARD', priceModifier: 1.0, isBlocked: false },
        { id: 'A8', row: 'A', col: 8, type: 'STANDARD', priceModifier: 1.0, isBlocked: false },
        { id: 'A9', row: 'A', col: 9, type: 'STANDARD', priceModifier: 1.0, isBlocked: false },
        { id: 'A10', row: 'A', col: 10, type: 'STANDARD', priceModifier: 1.0, isBlocked: false },
      ],
      [
        { id: 'B1', row: 'B', col: 1, type: 'VIP', priceModifier: 1.25, isBlocked: false },
        { id: 'B2', row: 'B', col: 2, type: 'VIP', priceModifier: 1.25, isBlocked: false },
        { id: 'B3', row: 'B', col: 3, type: 'VIP', priceModifier: 1.25, isBlocked: false },
        { id: 'B4', row: 'B', col: 4, type: 'VIP', priceModifier: 1.25, isBlocked: false },
        { id: 'B5', row: 'B', col: 5, type: 'VIP', priceModifier: 1.25, isBlocked: false },
        { id: 'B6', row: 'B', col: 6, type: 'VIP', priceModifier: 1.25, isBlocked: false },
        { id: 'B7', row: 'B', col: 7, type: 'VIP', priceModifier: 1.25, isBlocked: false },
        { id: 'B8', row: 'B', col: 8, type: 'VIP', priceModifier: 1.25, isBlocked: false },
        { id: 'B9', row: 'B', col: 9, type: 'VIP', priceModifier: 1.25, isBlocked: false },
        { id: 'B10', row: 'B', col: 10, type: 'VIP', priceModifier: 1.25, isBlocked: false },
      ],
      [
        { id: 'C1', row: 'C', col: 1, type: 'COUPLE', priceModifier: 1.8, isBlocked: false },
        { id: 'C2', row: 'C', col: 2, type: 'COUPLE', priceModifier: 1.8, isBlocked: false },
        { id: 'C3', row: 'C', col: 3, type: 'COUPLE', priceModifier: 1.8, isBlocked: false },
        { id: 'C4', row: 'C', col: 4, type: 'COUPLE', priceModifier: 1.8, isBlocked: false },
        { id: 'C5', row: 'C', col: 5, type: 'COUPLE', priceModifier: 1.8, isBlocked: false },
      ],
    ],
  };

  // 4. Seed Halls
  const hallIMAX = await prisma.hall.create({
    data: {
      cinemaId: cgvVincomHCM.id,
      name: 'Phòng 01 (IMAX Laser)',
      screenType: ScreenType.IMAX,
      roomMatrix: sampleMatrixJSON,
    },
  });

  const hallStandard = await prisma.hall.create({
    data: {
      cinemaId: cgvVincomHCM.id,
      name: 'Phòng 02 (Standard)',
      screenType: ScreenType.STANDARD,
      roomMatrix: sampleMatrixJSON,
    },
  });

  console.log('✅ Halls seeded:', [hallIMAX.name, hallStandard.name]);

  // 5. Seed Movies
  const movieMai = await prisma.movie.create({
    data: {
      title: 'Mai',
      titleOriginal: 'Mai (2024)',
      director: 'Trấn Thành',
      cast: 'Phương Anh Đào, Tuấn Trần, Hồng Đào',
      genres: ['Tâm lý', 'Tình cảm', 'Gia đình'],
      durationMinutes: 131,
      releaseDate: new Date('2024-02-10'),
      posterUrl: 'https://images.cgv.vn/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/m/a/mai_poster.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=HK1k9G6x3z8',
      ageRating: AgeRating.T18,
      languageType: 'SUB',
      status: MovieStatus.NOW_SHOWING,
      description: 'Mai xoay quanh câu chuyện về cuộc đời của một người phụ nữ làm nghề mát-xa tên Mai với nhiều trắc trở...',
    },
  });

  const movieDune = await prisma.movie.create({
    data: {
      title: 'Dune: Hành Tinh Cát - Phần 2',
      titleOriginal: 'Dune: Part Two',
      director: 'Denis Villeneuve',
      cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson',
      genres: ['Hành động', 'Khoa học viễn tưởng'],
      durationMinutes: 166,
      releaseDate: new Date('2024-03-01'),
      posterUrl: 'https://images.cgv.vn/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/d/u/dune_part_two_poster.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      ageRating: AgeRating.T16,
      languageType: 'SUB',
      status: MovieStatus.NOW_SHOWING,
      description: 'Hành trình trả thù của Paul Atreides chống lại những kẻ đã phá hủy gia đình anh...',
    },
  });

  const movieAvatar3 = await prisma.movie.create({
    data: {
      title: 'Avatar: Lửa Và Tro Tàn',
      titleOriginal: 'Avatar: Fire and Ash',
      director: 'James Cameron',
      cast: 'Sam Worthington, Zoe Saldaña, Sigourney Weaver',
      genres: ['Hành động', 'Phiêu lưu', 'Sci-Fi'],
      durationMinutes: 190,
      releaseDate: new Date('2026-12-18'),
      posterUrl: 'https://images.cgv.vn/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/a/v/avatar_3_poster.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=avatar3',
      ageRating: AgeRating.P,
      languageType: 'SUB',
      status: MovieStatus.COMING_SOON,
      description: 'Phần thứ ba trong loạt phim bom tấn Avatar của đạo diễn James Cameron...',
    },
  });

  console.log('✅ Movies seeded:', [movieMai.title, movieDune.title, movieAvatar3.title]);

  // 6. Seed Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Thứ Tư Vui Vẻ - Vé Chỉ Từ 55K',
        imageUrl: 'https://images.cgv.vn/media/banner/happy-wednesday-banner.jpg',
        linkUrl: '/promotions/happy-wednesday',
        displayOrder: 1,
        status: BannerStatus.ACTIVE,
      },
      {
        title: 'Ưu Đãi Hội Viên U22 HSSV',
        imageUrl: 'https://images.cgv.vn/media/banner/u22-student-banner.jpg',
        linkUrl: '/promotions/u22-fanc',
        displayOrder: 2,
        status: BannerStatus.ACTIVE,
      },
    ],
  });

  console.log('✅ Banners seeded');

  // 7. Seed Showtimes
  const now = new Date();
  const startTime1 = new Date(now.getTime() + 2 * 3600 * 1000); // 2 hours from now
  const endTime1 = new Date(startTime1.getTime() + 2 * 3600 * 1000);

  const showtime1 = await prisma.showtime.create({
    data: {
      movieId: movieMai.id,
      cinemaId: cgvVincomHCM.id,
      hallId: hallIMAX.id,
      startTime: startTime1,
      endTime: endTime1,
      basePrice: 130000,
    },
  });

  // Seed seats for showtime1
  await prisma.showtimeSeat.createMany({
    data: [
      { showtimeId: showtime1.id, seatId: 'A1', row: 'A', col: 1, type: 'STANDARD', priceModifier: 1.0 },
      { showtimeId: showtime1.id, seatId: 'A2', row: 'A', col: 2, type: 'STANDARD', priceModifier: 1.0 },
      { showtimeId: showtime1.id, seatId: 'B1', row: 'B', col: 1, type: 'VIP', priceModifier: 1.25 },
      { showtimeId: showtime1.id, seatId: 'B2', row: 'B', col: 2, type: 'VIP', priceModifier: 1.25 },
      { showtimeId: showtime1.id, seatId: 'C1', row: 'C', col: 1, type: 'COUPLE', priceModifier: 1.8 },
    ],
  });

  console.log('✅ Showtimes seeded');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
