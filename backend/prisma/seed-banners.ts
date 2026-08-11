import { PrismaClient, BannerStatus } from '@prisma/client';

const prisma = new PrismaClient();

const banners = [
  {
    title: "Trải Nghiệm IMAX Cực Đỉnh - Sống Cùng Từng Khung Hình",
    imageUrl: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=2069&auto=format&fit=crop",
    linkUrl: "/movies",
    displayOrder: 1
  },
  {
    title: "Happy Wednesday - Đồng Giá 50K Thứ 4 Hàng Tuần",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop",
    linkUrl: "/promotions",
    displayOrder: 2
  },
  {
    title: "Đặc Quyền U22 - Giá Vé Chỉ 45K Cho Học Sinh Sinh Viên",
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
    linkUrl: "/promotions/u22",
    displayOrder: 3
  },
  {
    title: "Quà Tặng Sinh Nhật - Nhận Ngay Combo Bắp Nước Miễn Phí",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop",
    linkUrl: "/promotions/birthday",
    displayOrder: 4
  },
  {
    title: "Phim Bom Tấn Mới - Đặt Vé Ngay Hôm Nay",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
    linkUrl: "/movies",
    displayOrder: 5
  }
];

async function main() {
  console.log('🌱 Starting banners seeding...');

  // Xóa rác cũ
  await prisma.banner.deleteMany();

  for (const item of banners) {
    await prisma.banner.create({
      data: {
        title: item.title,
        imageUrl: item.imageUrl,
        linkUrl: item.linkUrl,
        displayOrder: item.displayOrder,
        status: BannerStatus.ACTIVE
      },
    });
  }

  console.log('✅ Successfully seeded 5 promotional banners!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding banners:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
