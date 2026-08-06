import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { BannerSlider } from '@/components/home/banner-slider';

async function getHomeData() {
  try {
    const res = await fetch('http://localhost:4000/api/v1/home', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Failed to fetch home data', error);
    return null;
  }
}

export default async function Home() {
  const data = await getHomeData();

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Không thể tải dữ liệu trang chủ</h1>
        <p className="text-muted-foreground">Vui lòng kiểm tra lại kết nối đến Backend Server.</p>
      </div>
    );
  }

  const nowShowing = data.movies?.nowShowing || [];
  const comingSoon = data.movies?.comingSoon || [];
  const banners = data.banners || [];

  return (
    <div className="min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative w-full h-[400px] md:h-[600px] bg-muted overflow-hidden">
        <BannerSlider banners={banners} />
      </section>

      {/* Movies Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold border-l-4 border-primary pl-4 uppercase">Phim Đang Chiếu</h2>
          <Link href="/movies?status=NOW_SHOWING" className={buttonVariants({ variant: 'link' })}>
            Xem tất cả
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {nowShowing.map((movie: any) => (
            <Link key={movie.id} href={`/movies/${movie.id}`}>
              <Card className="overflow-hidden border-0 bg-transparent group cursor-pointer">
                <CardContent className="p-0 relative">
                  <div className="aspect-[2/3] overflow-hidden rounded-lg">
                    <img 
                      src={movie.posterUrl || 'https://via.placeholder.com/300x450'} 
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {movie.title}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Coming Soon Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold border-l-4 border-primary pl-4 uppercase">Phim Sắp Chiếu</h2>
          <Link href="/movies?status=COMING_SOON" className={buttonVariants({ variant: 'link' })}>
            Xem tất cả
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {comingSoon.map((movie: any) => (
            <Link key={movie.id} href={`/movies/${movie.id}`}>
              <Card className="overflow-hidden border-0 bg-transparent group cursor-pointer">
                <CardContent className="p-0 relative">
                  <div className="aspect-[2/3] overflow-hidden rounded-lg">
                    <img 
                      src={movie.posterUrl || 'https://via.placeholder.com/300x450'} 
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {movie.title}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
