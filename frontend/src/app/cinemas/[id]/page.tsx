import { notFound } from 'next/navigation';
import { MapPin, Phone, Monitor, Popcorn, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

async function getCinema(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/cinemas/${id}`, { next: { revalidate: 0 } });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch cinema');
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function CinemaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cinema = await getCinema(id);

  if (!cinema) {
    notFound();
  }

  const getIconForAmenity = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('imax') || lower.includes('4dx')) return <Monitor className="w-5 h-5" />;
    if (lower.includes('parking') || lower.includes('đỗ xe')) return <Car className="w-5 h-5" />;
    if (lower.includes('popcorn') || lower.includes('bắp')) return <Popcorn className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Cinema Header */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl mb-12">
          <div className="h-64 bg-muted relative">
            <img 
              src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Cinema Background"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-8">
              <h1 className="text-4xl font-bold text-white mb-2">{cinema.name}</h1>
              <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {cinema.address}</span>
                <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {cinema.phone || cinema.hotline || '1900 6017'}</span>
              </div>
            </div>
          </div>
          
          {/* Amenities */}
          <div className="p-8 border-t border-border/50 bg-card/50">
            <h3 className="text-lg font-bold mb-4 uppercase">Cơ sở vật chất</h3>
            <div className="flex flex-wrap gap-4">
              {cinema.amenities && cinema.amenities.map((amenity: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full border border-border">
                  {getIconForAmenity(amenity)}
                  <span className="text-sm font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Halls Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold border-l-4 border-primary pl-4 uppercase">Hệ Thống Phòng Chiếu</h2>
          
          {cinema.halls && cinema.halls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cinema.halls.map((hall: any) => (
                <Card key={hall.id} className="bg-card/40 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <Monitor className="w-12 h-12 mx-auto mb-4 text-primary opacity-80" />
                    <h3 className="text-2xl font-bold mb-2 text-white">{hall.name}</h3>
                    <div className="inline-block px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-bold uppercase tracking-wider mt-2">
                      {hall.screenType}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground">
              Rạp này chưa cấu hình phòng chiếu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
