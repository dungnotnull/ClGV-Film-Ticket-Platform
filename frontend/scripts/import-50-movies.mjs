import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

// Mảng 50 bộ phim mẫu (Sample Data)
const SAMPLE_MOVIES = Array.from({ length: 50 }).map((_, index) => {
  const isNowShowing = Math.random() > 0.5;
  const genresList = ['Hành động', 'Khoa học viễn tưởng', 'Hài hước', 'Kinh dị', 'Tâm lý', 'Tình cảm', 'Phiêu lưu', 'Hoạt hình'];
  const shuffledGenres = genresList.sort(() => 0.5 - Math.random()).slice(0, 2);
  
  return {
    title: `Phim Điện Ảnh Mẫu ${index + 1}`,
    titleOriginal: `Sample Movie ${index + 1} (2025)`,
    director: 'Đạo Diễn Mẫu ' + (index % 5 + 1),
    cast: 'Diễn Viên A, Diễn Viên B, Diễn Viên C',
    genres: shuffledGenres,
    durationMinutes: Math.floor(Math.random() * 60) + 90, // 90 to 150 mins
    releaseDate: new Date(Date.now() + (isNowShowing ? -1 : 1) * Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    posterUrl: `https://picsum.photos/seed/movie${index + 1}/300/450`,
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ageRating: ['P', 'T13', 'T16', 'T18'][Math.floor(Math.random() * 4)],
    languageType: Math.random() > 0.5 ? 'SUB' : 'DUB',
    status: isNowShowing ? 'NOW_SHOWING' : 'COMING_SOON',
    description: `Đây là mô tả tự động cho bộ phim điện ảnh số ${index + 1}. Một siêu phẩm đáng chờ đợi với sự góp mặt của các diễn viên nổi tiếng. Hành trình đầy cảm xúc và kịch tính.`,
  };
});

async function runImport() {
  console.log('🚀 Bắt đầu quá trình import 50 bộ phim...');

  try {
    // 1. Đăng nhập để lấy Token Admin
    console.log('🔑 Đang đăng nhập tài khoản Admin...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@clgv.vn',
      password: 'AdminPassword123!'
    });

    if (!loginRes.data.success) {
      throw new Error('Đăng nhập thất bại!');
    }

    const token = loginRes.data.data.accessToken;
    console.log('✅ Đăng nhập thành công! Bắt đầu đẩy dữ liệu...');

    // 2. Lặp và gọi API tạo phim
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < SAMPLE_MOVIES.length; i++) {
      try {
        const movie = SAMPLE_MOVIES[i];
        await axios.post(`${BASE_URL}/admin/movies`, movie, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        successCount++;
        process.stdout.write(`\rTiến trình: ${i + 1}/${SAMPLE_MOVIES.length} - Thành công: ${successCount} - Thất bại: ${failCount}`);
      } catch (error) {
        failCount++;
      }
      
      // Delay nhỏ để tránh spam API quá nhanh
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n\n🎉 Quá trình import hoàn tất!');
    console.log(`📊 Tổng kết: ${successCount} thành công, ${failCount} thất bại.`);
    
  } catch (error) {
    console.error('❌ Lỗi hệ thống:', error.message);
  }
}

runImport();
