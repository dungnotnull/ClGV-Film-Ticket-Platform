import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Play, Clock, Calendar, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookTicketModal } from '@/components/movie/book-ticket-modal';

async function getMovie(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/movies/${id}`, { next: { revalidate: 0 } });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch movie');
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    notFound();
  }

  // Format Youtube Trailer URL for iframe embed (convert watch?v= to embed/)
  let embedUrl = movie.trailerUrl;
  if (embedUrl && embedUrl.includes('watch?v=')) {
    embedUrl = embedUrl.replace('watch?v=', 'embed/');
  }

  // Group showtimes by Date
  const showtimesByDate: Record<string, any[]> = {};

  if (movie.showtimes && movie.showtimes.length > 0) {
    movie.showtimes.forEach((st: any) => {
      const dateStr = new Date(st.startTime).toLocaleDateString('vi-VN');
      if (!showtimesByDate[dateStr]) showtimesByDate[dateStr] = [];
      showtimesByDate[dateStr].push(st);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner Section */}
      <div className="relative w-full h-[40vh] md:h-[60vh] bg-muted">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm opacity-30" 
          style={{ backgroundImage: `url(${movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-end pb-10">
          <div className="flex flex-col md:flex-row gap-8 items-end md:items-start">
            <div className="w-48 md:w-64 shrink-0 rounded-lg overflow-hidden shadow-2xl border-4 border-card transform translate-y-20">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-auto object-cover" />
            </div>
            <div className="flex-1 space-y-4 pt-10 md:pt-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">{movie.title}</h1>
              <h2 className="text-xl text-muted-foreground">{movie.titleOriginal}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded border border-primary/30">
                  {movie.ageRating}
                </span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {movie.durationMinutes} phút</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
                <span className="flex items-center gap-1"><Film className="w-4 h-4" /> {movie.genres?.join(', ')}</span>
              </div>
              <div className="pt-2">
                <BookTicketModal movie={movie} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-24 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Details & Trailer */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h3 className="text-2xl font-bold border-l-4 border-primary pl-4 mb-4">Nội Dung Phim</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {movie.description || 'Chưa có thông tin mô tả cho phim này.'}
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold border-l-4 border-primary pl-4 mb-4">Đạo Diễn & Diễn Viên</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Đạo diễn</p>
                  <p className="font-bold">{movie.director || 'Đang cập nhật'}</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Diễn viên</p>
                  <p className="font-bold">{movie.cast || 'Đang cập nhật'}</p>
                </div>
              </div>
            </section>

            {embedUrl && (
              <section>
                <h3 className="text-2xl font-bold border-l-4 border-primary pl-4 mb-4">Trailer</h3>
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-border">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={embedUrl} 
                    title="Trailer" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Showtimes */}
          <div id="showtimes-section" className="lg:col-span-1 space-y-6">
            <h3 className="text-2xl font-bold border-l-4 border-primary pl-4 mb-4 uppercase">Lịch Chiếu</h3>
            
            {Object.keys(showtimesByDate).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(showtimesByDate).map(([date, showtimes]) => (
                  <div key={date} className="bg-card/50 border border-border rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-4 text-primary">{date}</h4>
                    
                    {/* Group by Cinema inside this date */}
                    {(() => {
                      const byCinema: Record<string, any[]> = {};
                      showtimes.forEach(st => {
                        const cName = st.cinema?.name || 'Rạp Khác';
                        if (!byCinema[cName]) byCinema[cName] = [];
                        byCinema[cName].push(st);
                      });

                      return Object.entries(byCinema).map(([cinemaName, stList]) => (
                        <div key={cinemaName} className="mb-4 last:mb-0">
                          <h5 className="font-semibold text-sm mb-2 text-white">{cinemaName}</h5>
                          <div className="flex flex-wrap gap-2">
                            {stList.map((st: any) => {
                              const isPast = new Date(st.startTime).getTime() < new Date().getTime();
                              return (
                                <Link 
                                  key={st.id} 
                                  href={isPast ? '#' : `/booking/seats?showtimeId=${st.id}`}
                                  className={isPast ? 'pointer-events-none' : ''}
                                >
                                  <Button 
                                    variant="outline" 
                                    className={`border-primary/50 transition-colors ${
                                      isPast 
                                        ? 'opacity-50 cursor-not-allowed bg-black text-gray-500 border-gray-800' 
                                        : 'hover:bg-primary hover:text-white'
                                    }`}
                                    disabled={isPast}
                                  >
                                    {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                  </Button>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Hiện chưa có lịch chiếu cho phim này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
