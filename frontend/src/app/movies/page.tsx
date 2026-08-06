import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

async function getMovies(status: 'NOW_SHOWING' | 'COMING_SOON') {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/movies?status=${status}&limit=20`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error('Failed to fetch movies', error);
    return [];
  }
}

export default async function MoviesPage() {
  const [nowShowing, comingSoon] = await Promise.all([
    getMovies('NOW_SHOWING'),
    getMovies('COMING_SOON')
  ]);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex items-center justify-center mb-10">
        <h1 className="text-4xl font-bold text-center border-b-4 border-primary pb-2 inline-block uppercase">Phim Tại ClGV</h1>
      </div>

      <Tabs defaultValue="now-showing" className="w-full max-w-5xl mx-auto">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="now-showing" className="text-lg">Đang Chiếu</TabsTrigger>
            <TabsTrigger value="coming-soon" className="text-lg">Sắp Chiếu</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="now-showing">
          {nowShowing.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
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
                      <div className="mt-4 space-y-2">
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {movie.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold border border-primary/30">
                            {movie.ageRating}
                          </span>
                          <span>{movie.duration} phút</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              Không có phim nào đang chiếu.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="coming-soon">
          {comingSoon.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
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
                      <div className="mt-4 space-y-2">
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {movie.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                          <span>Dự kiến khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              Chưa có thông tin phim sắp chiếu.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
