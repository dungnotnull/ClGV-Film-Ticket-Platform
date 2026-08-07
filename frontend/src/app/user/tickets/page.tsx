"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function MyTicketsPage() {
  const { isAuthenticated } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets/my-tickets');
        if (res.success) {
          setTickets(res.data.tickets || []);
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Đang tải danh sách vé...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 border-l-4 border-primary pl-4">Vé Của Tôi</h1>
      
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket: any) => (
            <Card key={ticket.id} className="overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors">
              <div className="bg-primary/10 px-6 py-3 border-b border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-primary">{ticket.movieTitle}</span>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    {ticket.status === 'PAID' ? 'ĐÃ THANH TOÁN' : ticket.status}
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{ticket.cinemaName} - {ticket.screenName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{ticket.showDate ? format(new Date(ticket.showDate), 'dd/MM/yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{ticket.startTime} - {ticket.endTime}</span>
                  </div>
                  <div className="pt-2 border-t border-border mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-foreground">Ghế:</span>
                      <span className="text-primary">{ticket.seats?.join(', ')}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => setSelectedTicket(ticket)}
                  variant="outline"
                >
                  Xem Mã QR
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground mb-4">Bạn chưa có vé nào.</p>
          <a href="/movies" className={buttonVariants()}>Đặt vé ngay</a>
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8">
          <DialogHeader>
            <DialogTitle className="text-center text-xl mb-4 text-primary">
              Mã QR Soát Vé
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="bg-white p-4 rounded-xl shadow-inner border border-zinc-200">
              <QRCodeSVG 
                value={selectedTicket.qrCodeData || selectedTicket.id} 
                size={200}
                level="Q"
                includeMargin={true}
              />
            </div>
          )}
          
          <div className="mt-6 text-center space-y-1">
            <p className="font-bold text-lg">{selectedTicket?.movieTitle}</p>
            <p className="text-sm text-muted-foreground">Ghế: {selectedTicket?.seats?.join(', ')}</p>
            <p className="text-xs text-destructive mt-4 font-medium uppercase tracking-wider">
              Vui lòng đưa mã này cho nhân viên soát vé
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
