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
    const city = cinema.city || 'Khác';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(cinema);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex items-center justify-center mb-10">
        <h1 className="text-4xl font-bold text-center border-b-4 border-primary pb-2 inline-block uppercase">Hệ Thống Rạp ClGV</h1>
      </div>

      {Object.keys(cinemasByCity).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(cinemasByCity).map(([city, cityCinemas]: [string, any]) => (
            <div key={city}>
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">{city}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityCinemas.map((cinema: any) => (
                  <Link key={cinema.id} href={`/cinemas/${cinema.id}`}>
                    <Card className="hover:border-primary/50 transition-colors h-full">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-2 text-primary">{cinema.name}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{cinema.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 shrink-0" />
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
  );
}
