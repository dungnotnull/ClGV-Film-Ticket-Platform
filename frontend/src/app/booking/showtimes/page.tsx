import Link from 'next/link';
import { Clock, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Example fetching function (in a real app, this would use fetch with filters)
async function getShowtimes() {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/showtimes`, { next: { revalidate: 0 } });
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function ShowtimesPage({
  searchParams,
}: {
  searchParams: { movieId?: string; cinemaId?: string; date?: string };
}) {
  const showtimes = await getShowtimes();
  
  // Group showtimes by movie and cinema for display
  const grouped = showtimes.reduce((acc: any, st: any) => {
    const movieTitle = st.movie?.title || 'Phim Chưa Rõ';
    const cinemaName = st.cinema?.name || 'Rạp Khác';
    if (!acc[movieTitle]) acc[movieTitle] = {};
    if (!acc[movieTitle][cinemaName]) acc[movieTitle][cinemaName] = [];
    acc[movieTitle][cinemaName].push(st);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold uppercase tracking-tight text-primary">Lịch Chiếu Phim</h1>
        <p className="text-muted-foreground">Chọn lịch chiếu để bắt đầu đặt vé</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-card rounded-lg border border-border">
          Không tìm thấy suất chiếu nào phù hợp.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([movieTitle, cinemas]: [string, any]) => (
            <Card key={movieTitle} className="bg-card border-border overflow-hidden">
              <div className="bg-primary/10 border-b border-border p-4">
                <h2 className="text-2xl font-bold text-white">{movieTitle}</h2>
              </div>
              <CardContent className="p-0">
                {Object.entries(cinemas).map(([cinemaName, stList]: [string, any], index: number) => (
                  <div key={cinemaName} className={`p-6 ${index !== Object.keys(cinemas).length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-white">{cinemaName}</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 pl-7">
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
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
