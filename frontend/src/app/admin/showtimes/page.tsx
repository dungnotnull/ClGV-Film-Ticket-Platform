"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Clock, Film } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminShowtimesPage() {
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [selectedCinemaHalls, setSelectedCinemaHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    movieId: '',
    cinemaId: '',
    hallId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    basePrice: 120000
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stRes, mvRes, cnRes] = await Promise.all([
        api.get('/showtimes'),
        api.get('/movies?limit=100'),
        api.get('/cinemas')
      ]);

      if (stRes.success) setShowtimes(Array.isArray(stRes.data) ? stRes.data : []);
      if (mvRes.success) setMovies(Array.isArray(mvRes.data) ? mvRes.data : []);
      if (cnRes.success) setCinemas(Array.isArray(cnRes.data) ? cnRes.data : []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When cinema changes, update halls dropdown
  useEffect(() => {
    if (formData.cinemaId) {
      const cinema = cinemas.find(c => c.id === formData.cinemaId);
      const halls = cinema?.halls || [];
      setSelectedCinemaHalls(halls);
      if (halls.length > 0) {
        setFormData(prev => ({ ...prev, hallId: halls[0].id }));
      } else {
        setFormData(prev => ({ ...prev, hallId: '' }));
      }
    }
  }, [formData.cinemaId, cinemas]);

  const handleAddShowtime = async () => {
    try {
      // Calculate start and end time (assuming 2 hours duration for simplicity if movie not found)
      const movie = movies.find(m => m.id === formData.movieId);
      const duration = movie?.durationMinutes || 120;
      
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00Z`);
      // Adjust for UTC/Local mismatch in a real app, but for now just construct Date
      
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      const payload = {
        movieId: formData.movieId,
        cinemaId: formData.cinemaId,
        hallId: formData.hallId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        basePrice: Number(formData.basePrice)
      };

      const res = await api.post('/admin/showtimes', payload);
      if (res.success) {
        toast.success('Thêm lịch chiếu thành công');
        setIsAddOpen(false);
        fetchData();
      } else {
        if (res.error?.code === 'SHOWTIME_CONFLICT') {
          toast.error('Xung đột lịch chiếu! Phòng chiếu này đã có phim khác trong khung giờ này.');
        } else {
          toast.error('Có lỗi xảy ra');
        }
      }
    } catch (error: any) {
      if (error.response?.data?.error?.code === 'SHOWTIME_CONFLICT') {
        toast.error('Xung đột lịch chiếu (Thời gian dọn dẹp 15 phút chưa đạt).');
      } else {
        toast.error('Lỗi kết nối Server');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold border-l-4 border-primary pl-4">Quản Lý Lịch Chiếu</h1>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="h-4 w-4" /> Thêm lịch chiếu
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm lịch chiếu mới</DialogTitle>
              <DialogDescription>Chọn phim, rạp và thời gian chiếu. Hệ thống sẽ tự động tính giờ kết thúc.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Phim</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.movieId}
                  onChange={e => setFormData({...formData, movieId: e.target.value})}
                >
                  <option value="">-- Chọn phim --</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Cụm Rạp</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.cinemaId}
                  onChange={e => setFormData({...formData, cinemaId: e.target.value})}
                >
                  <option value="">-- Chọn rạp --</option>
                  {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Phòng chiếu</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                  value={formData.hallId}
                  onChange={e => setFormData({...formData, hallId: e.target.value})}
                  disabled={!formData.cinemaId || selectedCinemaHalls.length === 0}
                >
                  <option value="">-- Chọn phòng --</option>
                  {selectedCinemaHalls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày chiếu</Label>
                  <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Giờ chiếu (HH:mm)</Label>
                  <Input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Giá vé cơ bản (VNĐ)</Label>
                <Input type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
              <Button onClick={handleAddShowtime} disabled={!formData.movieId || !formData.hallId}>Lên lịch</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-lg overflow-hidden shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Phim</TableHead>
              <TableHead>Rạp / Phòng</TableHead>
              <TableHead>Khởi chiếu</TableHead>
              <TableHead>Giá vé</TableHead>
              <TableHead>Tình trạng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Đang tải...</TableCell>
              </TableRow>
            ) : showtimes.length > 0 ? (
              showtimes.map((st: any) => (
                <TableRow key={st.id}>
                  <TableCell className="font-bold flex items-center gap-2">
                    <Film className="w-4 h-4 text-primary" /> {st.movie?.title || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {st.cinema?.name} <span className="text-muted-foreground text-xs block">{st.hall?.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(st.startTime).toLocaleDateString('vi-VN')}</div>
                    <div className="flex items-center gap-1 text-primary text-xs font-bold mt-1"><Clock className="w-3 h-3" /> {new Date(st.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                  </TableCell>
                  <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(st.basePrice)}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500">Mở bán</span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Chưa có lịch chiếu nào</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
