import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone } from 'lucide-react';

async function getCinemas() {
  try {
    const res = await fetch('http://localhost:4000/api/v1/cinemas', { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error('Failed to fetch cinemas', error);
    return [];
  }
}

export default async function CinemasPage() {
  const cinemas = await getCinemas();

  // Group cinemas by city
  const cinemasByCity = cinemas.reduce((acc: any, cinema: any) => {
    const cityName = (typeof cinema.city === 'object' && cinema.city !== null) 
      ? cinema.city.name 
      : cinema.city || 'Khác';
      
    if (!acc[cityName]) {
      acc[cityName] = [];
    }
    acc[cityName].push(cinema);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pt-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            <h1 className="text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 py-2 leading-relaxed">Hệ Thống Rạp ClGV</h1>
            <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          </div>
        </div>

      {Object.keys(cinemasByCity).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(cinemasByCity).map(([city, cityCinemas]: [string, any]) => (
            <div key={city}>
              <h2 className="text-2xl font-black uppercase tracking-wider text-amber-500 mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                <MapPin className="w-6 h-6" />
                {city}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityCinemas.map((cinema: any) => (
                  <Link key={cinema.id} href={`/cinemas/${cinema.id}`}>
                    <Card className="overflow-hidden border border-white/5 bg-black/40 backdrop-blur-sm group cursor-pointer hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.2)] h-full">
                      <CardContent className="p-6 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
                        <h3 className="font-bold text-xl mb-4 text-amber-500 group-hover:text-amber-400 transition-colors">{cinema.name}</h3>
                        <div className="space-y-3 text-sm text-white/70">
                          <div className="flex items-start gap-3 group-hover:text-white transition-colors">
                            <span className="text-amber-500/50 mt-0.5">📍</span>
                            <span>{cinema.address}</span>
                          </div>
                          <div className="flex items-center gap-3 group-hover:text-white transition-colors">
                            <span className="text-amber-500/50">📞</span>
                            <span>{cinema.hotline || '1900 6017'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          Không có thông tin hệ thống rạp.
        </div>
      )}
      </div>
    </div>
  );
}
