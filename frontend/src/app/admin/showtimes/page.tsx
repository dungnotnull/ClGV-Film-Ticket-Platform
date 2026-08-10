"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Clock, Film, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminShowtimesPage() {
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [selectedCinemaHalls, setSelectedCinemaHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedMovies, setExpandedMovies] = useState<string[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

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

  const toggleExpand = (movieId: string) => {
    setExpandedMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

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
      
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
      
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      // Client-side validation for 30-minute cleaning buffer
      const hallShowtimes = showtimes.filter(st => st.hallId === formData.hallId);
      const newStart = startDateTime.getTime();
      const newEnd = endDateTime.getTime();
      const cleaningTime = 30 * 60000; // 30 mins

      for (const st of hallShowtimes) {
        const existingStart = new Date(st.startTime).getTime();
        const existingEnd = new Date(st.endTime).getTime();
        
        if (newStart < existingEnd + cleaningTime && newEnd + cleaningTime > existingStart) {
           const title = st.movie?.title || 'Unknown';
           const sTime = new Date(st.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', hour12: false});
           const eTime = new Date(st.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', hour12: false});
           toast.error(`Lỗi: Bị trùng lịch với phim "${title}" (${sTime} - ${eTime}). Vui lòng chọn giờ khác để đảm bảo khoảng nghỉ 30 phút dọn rạp!`, { duration: 6000 });
           return;
        }
      }

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
          toast.error('Xung đột lịch chiếu! Vui lòng chọn giờ chiếu khác cách ít nhất 30 phút so với các suất chiếu hiện tại.');
        } else {
          toast.error(res.error?.message || res.message || 'Có lỗi xảy ra');
        }
      }
    } catch (error: any) {
      if (error.response?.data?.error?.code === 'SHOWTIME_CONFLICT') {
        toast.error('Lỗi: Khoảng cách giữa các suất chiếu cùng phòng phải cách nhau ít nhất 30 phút để dọn dẹp!');
      } else {
        toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
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
                  <Select value={formData.startTime} onValueChange={(val) => setFormData({...formData, startTime: val})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn giờ" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px]">
                      {Array.from({ length: 24 * 12 }).map((_, i) => {
                        const h = Math.floor(i / 12).toString().padStart(2, '0');
                        const m = ((i % 12) * 5).toString().padStart(2, '0');
                        const time = `${h}:${m}`;
                        return <SelectItem key={time} value={time}>{time}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
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

      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border border-border/50">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            className="pl-9" 
            placeholder="Tìm theo tên phim hoặc rạp..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Input 
            type="date" 
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            title="Lọc theo ngày"
          />
        </div>
        {(searchTerm || filterDate) && (
          <Button variant="ghost" onClick={() => { setSearchTerm(''); setFilterDate(''); }}>Xóa lọc</Button>
        )}
      </div>

      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-lg overflow-hidden shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Phim</TableHead>
              <TableHead colSpan={4}>Thông tin suất chiếu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Đang tải...</TableCell>
              </TableRow>
            ) : (() => {
              const filtered = showtimes.filter(st => {
                const matchSearch = (st.movie?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (st.cinema?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
                const matchDate = filterDate ? st.startTime.startsWith(filterDate) : true;
                return matchSearch && matchDate;
              });

              if (filtered.length === 0) {
                return (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Không có suất chiếu nào phù hợp</TableCell>
                  </TableRow>
                );
              }

              const groupedByMovie: Record<string, { movie: any, showtimes: any[] }> = {};
              filtered.forEach(st => {
                const movieId = st.movieId || 'unknown';
                if (!groupedByMovie[movieId]) {
                  groupedByMovie[movieId] = { movie: st.movie, showtimes: [] };
                }
                groupedByMovie[movieId].showtimes.push(st);
              });

              return Object.values(groupedByMovie).map(group => {
                const isExpanded = expandedMovies.includes(group.movie?.id);
                return (
                  <React.Fragment key={group.movie?.id || Math.random()}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleExpand(group.movie?.id)}
                    >
                      <TableCell className="font-bold flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        <Film className="w-4 h-4 text-primary" /> {group.movie?.title || 'Phim không xác định'}
                      </TableCell>
                      <TableCell colSpan={4} className="text-muted-foreground text-sm font-medium">
                        {group.showtimes.length} suất chiếu
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow className="bg-card">
                        <TableCell colSpan={5} className="p-0 border-b-0">
                          <div className="p-4 bg-muted/10 shadow-inner rounded-b-lg border-x border-b border-border/50 mx-2 mb-2">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead>Rạp / Phòng</TableHead>
                                  <TableHead>Khởi chiếu</TableHead>
                                  <TableHead>Giá vé</TableHead>
                                  <TableHead>Tình trạng</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.showtimes.map(st => (
                                  <TableRow key={st.id} className="bg-background">
                                    <TableCell>
                                      <span className="font-semibold">{st.cinema?.name}</span> <span className="text-muted-foreground text-xs block">{st.hall?.name}</span>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(st.startTime).toLocaleDateString('vi-VN')}</div>
                                      <div className="flex items-center gap-1 text-primary text-xs font-bold mt-1"><Clock className="w-3 h-3" /> {new Date(st.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', hour12: false})}</div>
                                    </TableCell>
                                    <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(st.basePrice)}</TableCell>
                                    <TableCell>
                                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500">Mở bán</span>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              });
            })()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
