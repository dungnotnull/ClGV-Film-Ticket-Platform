import { PrismaClient, Role, MovieStatus, AgeRating, ScreenType, BannerStatus, SeatStatus, BookingStatus, TicketStatus, MembershipTier } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Clear existing data cleanly in correct order
  await prisma.ticket.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.showtimeSeat.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.movieReview.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.cinema.deleteMany();
  await prisma.city.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users (Admin, VIP, U22, Members)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@clgv.vn',
      password: passwordHash,
      fullName: 'Quản Trị Viên CGV',
      phone: '0900000001',
      role: Role.ADMIN,
      membershipTier: MembershipTier.VVIP,
      points: 2500,
      cgvCardBalance: 5000000,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@clgv.vn',
      password: passwordHash,
      fullName: 'Nguyễn Văn Khách',
      phone: '0909999999',
      role: Role.CUSTOMER,
      membershipTier: MembershipTier.VIP,
      points: 450,
      cgvCardBalance: 750000,
      isU22Verified: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'u22.student@clgv.vn',
      password: passwordHash,
      fullName: 'Trần Thị Học Sinh (U22)',
      phone: '0912345678',
      role: Role.CUSTOMER,
      membershipTier: MembershipTier.U22_FANC,
      points: 120,
      cgvCardBalance: 300000,
      isU22Verified: true,
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'vvip.member@clgv.vn',
      password: passwordHash,
      fullName: 'Lê Hoàng VIP',
      phone: '0988888888',
      role: Role.CUSTOMER,
      membershipTier: MembershipTier.VVIP,
      points: 1800,
      cgvCardBalance: 2500000,
    },
  });

  console.log('✅ Users seeded successfully!');

  // 2. Seed Cities
  const cityHCM = await prisma.city.create({
    data: { name: 'TP. Hồ Chí Minh', code: 'HCM', displayOrder: 1 },
  });
  const cityHN = await prisma.city.create({
    data: { name: 'Hà Nội', code: 'HN', displayOrder: 2 },
  });
  const cityDN = await prisma.city.create({
    data: { name: 'Đà Nẵng', code: 'DN', displayOrder: 3 },
  });
  const cityCT = await prisma.city.create({
    data: { name: 'Cần Thơ', code: 'CT', displayOrder: 4 },
  });

  console.log('✅ Cities seeded:', [cityHCM.name, cityHN.name, cityDN.name, cityCT.name]);

  // 3. Seed Cinema Clusters
  const cgvVincomHCM = await prisma.cinema.create({
    data: {
      cityId: cityHCM.id,
      name: 'CGV Vincom Đồng Khởi',
      address: 'Tầng 3, Vincom Center, 72 Lê Thánh Tôn, Q.1, TP.HCM',
      phone: '1900 6017',
      amenities: ['Bãi đậu xe', 'Popcorn Bar', 'L\'Amour Bed', 'IMAX Laser', 'Gold Class'],
    },
  });

  const cgvCrescentMall = await prisma.cinema.create({
    data: {
      cityId: cityHCM.id,
      name: 'CGV Crescent Mall',
      address: 'Tầng 5, Crescent Mall, 101 Tôn Dật Tiên, Q.7, TP.HCM',
      phone: '1900 6017',
      amenities: ['Bãi đậu xe', 'Popcorn Bar', '4DX Screen'],
    },
  });

  const cgvBaTrieuHN = await prisma.cinema.create({
    data: {
      cityId: cityHN.id,
      name: 'CGV Vincom Bà Triệu',
      address: 'Tầng 6, Vincom Center, 191 Bà Triệu, Q.Hai Bà Trưng, Hà Nội',
      phone: '1900 6017',
      amenities: ['Bãi đậu xe', 'Popcorn Bar', 'IMAX Screen'],
    },
  });

  const cgvVinhTrungDN = await prisma.cinema.create({
    data: {
      cityId: cityDN.id,
      name: 'CGV Vĩnh Trung Plaza',
      address: '255-257 Hùng Vương, Q.Thanh Khê, Đà Nẵng',
      phone: '1900 6017',
      amenities: ['Bãi đậu xe', 'Popcorn Bar'],
    },
  });

  console.log('✅ Cinemas seeded');

  // Room Matrix JSON Template (8 rows x 10 cols = 80 seats)
  const generateMatrix = () => {
    const grid: any[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (let r = 0; r < rows.length; r++) {
      const rowName = rows[r];
      const rowSeats: any[] = [];
      let type = 'STANDARD';
      let priceModifier = 1.0;

      if (['D', 'E', 'F'].includes(rowName)) {
        type = 'VIP';
        priceModifier = 1.25;
      } else if (rowName === 'H') {
        type = 'COUPLE';
        priceModifier = 1.8;
      }

      for (let c = 1; c <= 10; c++) {
        rowSeats.push({
          id: `${rowName}${c}`,
          row: rowName,
          col: c,
          type,
          priceModifier,
          isBlocked: false,
        });
      }
      grid.push(rowSeats);
    }

    return {
      dimensions: { rows: 8, cols: 10 },
      aisles: { vertical: [3, 7], horizontal: [4] },
      grid,
    };
  };

  const matrixData = generateMatrix();

  // 4. Seed Halls
  const hallIMAX_HCM = await prisma.hall.create({
    data: {
      cinemaId: cgvVincomHCM.id,
      name: 'Phòng 01 (IMAX Laser)',
      screenType: ScreenType.IMAX,
      roomMatrix: matrixData,
    },
  });

  const hall4DX_HCM = await prisma.hall.create({
    data: {
      cinemaId: cgvVincomHCM.id,
      name: 'Phòng 02 (4DX)',
      screenType: ScreenType.FOUR_DX,
      roomMatrix: matrixData,
    },
  });

  const hallStandard_HN = await prisma.hall.create({
    data: {
      cinemaId: cgvBaTrieuHN.id,
      name: 'Phòng 01 (Standard 2D)',
      screenType: ScreenType.STANDARD,
      roomMatrix: matrixData,
    },
  });

  console.log('✅ Halls seeded');

  // 5. Seed Movies
  const movieMai = await prisma.movie.create({
    data: {
      title: 'Mai',
      titleOriginal: 'Mai (2024)',
      director: 'Trấn Thành',
      cast: 'Phương Anh Đào, Tuấn Trần, Hồng Đào, Quốc Khánh',
      genres: ['Tâm lý', 'Tình cảm', 'Gia đình'],
      durationMinutes: 131,
      releaseDate: new Date('2024-02-10'),
      posterUrl: 'https://images.cgv.vn/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/m/a/mai_poster.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=HK1k9G6x3z8',
      ageRating: AgeRating.T18,
      languageType: 'SUB',
      status: MovieStatus.NOW_SHOWING,
      description: 'Mai xoay quanh câu chuyện về cuộc đời của một người phụ nữ làm nghề mát-xa tên Mai với nhiều trắc trở và bi kịch gia đình...',
    },
  });

  const movieDune = await prisma.movie.create({
    data: {
      title: 'Dune: Hành Tinh Cát - Phần 2',
      titleOriginal: 'Dune: Part Two',
      director: 'Denis Villeneuve',
      cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem',
      genres: ['Hành động', 'Khoa học viễn tưởng', 'Phiêu lưu'],
      durationMinutes: 166,
      releaseDate: new Date('2024-03-01'),
      posterUrl: 'https://images.cgv.vn/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/d/u/dune_part_two_poster.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      ageRating: AgeRating.T16,
      languageType: 'SUB',
      status: MovieStatus.NOW_SHOWING,
      description: 'Hành trình trả thù của Paul Atreides chống lại những kẻ đã phá hủy gia đình anh và định mệnh định đoạt tương lai vũ trụ...',
    },
  });

  const movieDeadpool = await prisma.movie.create({
    data: {
      title: 'Deadpool & Wolverine',
      titleOriginal: 'Deadpool & Wolverine',
      director: 'Shawn Levy',
      cast: 'Ryan Reynolds, Hugh Jackman, Emma Corrin',
      genres: ['Hành động', 'Hài hước', 'Sci-Fi'],
      durationMinutes: 128,
      releaseDate: new Date('2024-07-26'),
      posterUrl: 'https://images.cgv.vn/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/d/p/deadpool_wolverine_poster.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
      ageRating: AgeRating.T18,
      languageType: 'SUB',
      status: MovieStatus.NOW_SHOWING,
      description: 'Sự kết hợp bùng nổ giữa Thánh Bựa Deadpool và Người Sói Wolverine trong vũ trụ điện ảnh Marvel...',
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
      description: 'Phần thứ ba trong loạt phim bom tấn vĩ đại Avatar khám phá tộc người Tro Tàn (Ash People) nguy hiểm trên hành tinh Pandora...',
    },
  });

  console.log('✅ Movies seeded:', [movieMai.title, movieDune.title, movieDeadpool.title, movieAvatar3.title]);

  // 6. Seed Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Thứ Tư Vui Vẻ - Vé Đồng Giá Chỉ 55.000 VNĐ',
        imageUrl: 'https://images.cgv.vn/media/banner/happy-wednesday-banner.jpg',
        linkUrl: '/promotions/happy-wednesday',
        displayOrder: 1,
        status: BannerStatus.ACTIVE,
      },
      {
        title: 'Ưu Đãi Hội Viên U22 HSSV - Vé Chỉ 45.000 VNĐ',
        imageUrl: 'https://images.cgv.vn/media/banner/u22-student-banner.jpg',
        linkUrl: '/promotions/u22-fanc',
        displayOrder: 2,
        status: BannerStatus.ACTIVE,
      },
      {
        title: 'Trải Nghiệm Công Nghệ IMAX Laser Đỉnh Cao Tại CGV Vincom Đồng Khởi',
        imageUrl: 'https://images.cgv.vn/media/banner/imax-laser-banner.jpg',
        linkUrl: '/cinemas',
        displayOrder: 3,
        status: BannerStatus.ACTIVE,
      },
    ],
  });

  console.log('✅ Banners seeded');

  // 7. Seed Showtimes & ShowtimeSeats
  const today = new Date();
  const showtimeTime1 = new Date(today.getTime() + 2 * 3600 * 1000); // 2 hours from now
  const showtimeTime2 = new Date(today.getTime() + 5 * 3600 * 1000); // 5 hours from now
  const showtimeTime3 = new Date(today.getTime() + 24 * 3600 * 1000); // Tomorrow

  const st1 = await prisma.showtime.create({
    data: {
      movieId: movieMai.id,
      cinemaId: cgvVincomHCM.id,
      hallId: hallIMAX_HCM.id,
      startTime: showtimeTime1,
      endTime: new Date(showtimeTime1.getTime() + 131 * 60 * 1000),
      basePrice: 130000,
    },
  });

  const st2 = await prisma.showtime.create({
    data: {
      movieId: movieDune.id,
      cinemaId: cgvVincomHCM.id,
      hallId: hall4DX_HCM.id,
      startTime: showtimeTime2,
      endTime: new Date(showtimeTime2.getTime() + 166 * 60 * 1000),
      basePrice: 160000,
    },
  });

  const st3 = await prisma.showtime.create({
    data: {
      movieId: movieDeadpool.id,
      cinemaId: cgvBaTrieuHN.id,
      hallId: hallStandard_HN.id,
      startTime: showtimeTime3,
      endTime: new Date(showtimeTime3.getTime() + 128 * 60 * 1000),
      basePrice: 110000,
    },
  });

  // Seed ShowtimeSeats for st1
  const seatsToCreate: any[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  for (const r of rows) {
    for (let c = 1; c <= 10; c++) {
      let status: SeatStatus = SeatStatus.AVAILABLE;
      if (r === 'D' && (c === 4 || c === 5)) {
        status = SeatStatus.SOLD;
      }
      seatsToCreate.push({
        showtimeId: st1.id,
        seatId: `${r}${c}`,
        row: r,
        col: c,
        type: ['D', 'E', 'F'].includes(r) ? 'VIP' : r === 'H' ? 'COUPLE' : 'STANDARD',
        status,
        priceModifier: ['D', 'E', 'F'].includes(r) ? 1.25 : r === 'H' ? 1.8 : 1.0,
      });
    }
  }
  await prisma.showtimeSeat.createMany({ data: seatsToCreate });

  console.log('✅ Showtimes & Seats seeded');

  // 8. Seed Bookings & Tickets (Paid & Completed)
  const booking1 = await prisma.booking.create({
    data: {
      userId: customer1.id,
      showtimeId: st1.id,
      totalAmount: 325000, // 2 VIP seats
      status: BookingStatus.PAID,
      paymentMethod: 'VNPAY',
      tickets: {
        create: [
          {
            seatId: 'D4',
            qrToken: 'HMAC_TOKEN_D4_PAID_CHECKED_IN',
            status: TicketStatus.CHECKED_IN,
          },
          {
            seatId: 'D5',
            qrToken: 'HMAC_TOKEN_D5_PAID_UNUSED',
            status: TicketStatus.UNUSED,
          },
        ],
      },
    },
  });

  console.log('✅ Bookings & E-Tickets seeded');

  // 9. Seed Reviews
  await prisma.movieReview.createMany({
    data: [
      {
        movieId: movieMai.id,
        userId: customer1.id,
        rating: 5,
        comment: 'Phim rất xúc động và chân thực! Diễn xuất của Phương Anh Đào xuất sắc.',
      },
      {
        movieId: movieDune.id,
        userId: customer2.id,
        rating: 5,
        comment: 'Hình ảnh âm thanh hoành tráng đỉnh cao! Xứng đáng xem IMAX.',
      },
    ],
  });

  console.log('✅ Movie Reviews seeded');
  console.log('🎉 Comprehensive Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
