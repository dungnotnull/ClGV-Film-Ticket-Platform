"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Clock, Film, Search, ChevronDown, ChevronRight, CalendarRange, MapPin } from 'lucide-react';
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
           toast.error(`Lỗi: Bị trùng lịch với phim "${title}" (${sTime} - ${eTime}). Cần khoảng nghỉ 30 phút dọn rạp!`, { duration: 6000 });
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
          toast.error('Xung đột lịch chiếu! Vui lòng chọn giờ khác cách ít nhất 30 phút.');
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#4a423d] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
              <CalendarRange className="w-4 h-4" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#faf8f5] tracking-tight">Quản Lý Lịch Chiếu</h1>
          </div>
          <p className="text-sm text-[#afa49b] mt-1 ml-10">Lên lịch chiếu rạp, phòng chiếu và giá vé phân tầng</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#ff4b72] hover:bg-[#ff6584] text-white rounded-xl shadow-lg shadow-[#ff4b72]/20 font-medium transition-all">
              <Plus className="h-4 w-4" /> Thêm lịch chiếu
            </Button>
          } />
          <DialogContent className="sm:max-w-[540px] bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#faf8f5]">Thêm lịch chiếu mới</DialogTitle>
              <DialogDescription className="text-sm text-[#afa49b]">
                Chọn phim, rạp và thời gian chiếu. Hệ thống sẽ tự động tính giờ kết thúc dựa trên thời lượng phim.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Phim</Label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-[#4a423d] bg-[#1f1a18] px-3.5 py-2 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72]"
                  value={formData.movieId}
                  onChange={e => setFormData({...formData, movieId: e.target.value})}
                >
                  <option value="">-- Chọn phim --</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Cụm Rạp</Label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-[#4a423d] bg-[#1f1a18] px-3.5 py-2 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72]"
                  value={formData.cinemaId}
                  onChange={e => setFormData({...formData, cinemaId: e.target.value})}
                >
                  <option value="">-- Chọn rạp --</option>
                  {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Phòng chiếu</Label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-[#4a423d] bg-[#1f1a18] px-3.5 py-2 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72] disabled:opacity-50"
                  value={formData.hallId}
                  onChange={e => setFormData({...formData, hallId: e.target.value})}
                  disabled={!formData.cinemaId || selectedCinemaHalls.length === 0}
                >
                  <option value="">-- Chọn phòng --</option>
                  {selectedCinemaHalls.map(h => <option key={h.id} value={h.id}>{h.name} ({h.screenType})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Ngày chiếu</Label>
                  <Input 
                    type="date" 
                    className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Giờ chiếu (HH:mm)</Label>
                  <Select value={formData.startTime} onValueChange={(val) => setFormData(prev => ({ ...prev, startTime: val || '19:00' }))}>
                    <SelectTrigger className="w-full bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11">
                      <SelectValue placeholder="Chọn giờ" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] bg-[#27211f] border-[#4a423d] text-[#faf8f5]">
                      {Array.from({ length: 24 * 12 }).map((_, i) => {
                        const h = Math.floor(i / 12).toString().padStart(2, '0');
                        const m = ((i % 12) * 5).toString().padStart(2, '0');
                        const time = `${h}:${m}`;
                        return <SelectItem key={time} value={time} className="hover:bg-[#302927]">{time}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Giá vé cơ bản (VNĐ)</Label>
                <Input 
                  type="number" 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                  value={formData.basePrice} 
                  onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} 
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t border-[#4a423d]">
              <Button variant="outline" className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl" onClick={() => setIsAddOpen(false)}>
                Hủy
              </Button>
              <Button 
                className="bg-[#ff4b72] hover:bg-[#ff6584] text-white font-medium rounded-xl shadow-lg shadow-[#ff4b72]/20" 
                onClick={handleAddShowtime} 
                disabled={!formData.movieId || !formData.hallId}
              >
                Lên lịch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#27211f] p-4 rounded-2xl border border-[#4a423d]">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#afa49b]" />
          <Input 
            className="pl-10 bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] placeholder:text-[#afa49b] focus:border-[#ff4b72] rounded-xl h-11" 
            placeholder="Tìm theo tên phim hoặc rạp..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Input 
            type="date" 
            className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            title="Lọc theo ngày"
          />
        </div>
        {(searchTerm || filterDate) && (
          <Button 
            variant="ghost" 
            className="text-xs text-[#ff8fa3] hover:text-[#ff4b72] hover:bg-[#ff4b72]/10 rounded-xl"
            onClick={() => { setSearchTerm(''); setFilterDate(''); }}
          >
            Xóa lọc
          </Button>
        )}
      </div>

      {/* Accordion Table Section */}
      <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#302927] border-b border-[#4a423d] hover:bg-[#302927]">
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba] pl-6">Phim</TableHead>
              <TableHead colSpan={4} className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba] text-right pr-6">
                Thông tin suất chiếu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-[#afa49b]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải danh sách lịch chiếu...</span>
                  </div>
                </TableCell>
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
                    <TableCell colSpan={5} className="text-center py-12 text-[#afa49b]">Không có suất chiếu nào phù hợp</TableCell>
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
                      className="cursor-pointer hover:bg-[#302927]/60 transition-colors border-b border-[#4a423d]/50"
                      onClick={() => toggleExpand(group.movie?.id)}
                    >
                      <TableCell className="font-bold text-[#faf8f5] flex items-center gap-3 pl-6 py-4">
                        <div className="w-6 h-6 rounded-md bg-[#1f1a18] border border-[#4a423d] flex items-center justify-center text-[#ff8fa3]">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </div>
                        <Film className="w-4 h-4 text-[#ff4b72]" /> 
                        <span>{group.movie?.title || 'Phim không xác định'}</span>
                      </TableCell>
                      <TableCell colSpan={4} className="text-right pr-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1f1a18] border border-[#ff4b72]/30 text-[#ff8fa3]">
                          {group.showtimes.length} suất chiếu
                        </span>
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow className="bg-[#1f1a18]/40 border-b border-[#4a423d]/50">
                        <TableCell colSpan={5} className="p-4 sm:p-6">
                          <div className="bg-[#1f1a18] border border-[#4a423d] rounded-xl overflow-hidden shadow-inner">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-[#27211f] border-b border-[#4a423d] hover:bg-[#27211f]">
                                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[#d1c7ba]">Rạp / Phòng</TableHead>
                                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[#d1c7ba]">Khởi chiếu</TableHead>
                                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[#d1c7ba]">Giá vé</TableHead>
                                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[#d1c7ba]">Tình trạng</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.showtimes.map(st => (
                                  <TableRow key={st.id} className="border-b border-[#4a423d]/40 hover:bg-[#302927]/30 transition-colors">
                                    <TableCell>
                                      <div className="font-semibold text-[#faf8f5] flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-[#ff4b72]" />
                                        {st.cinema?.name}
                                      </div>
                                      <div className="text-xs text-[#afa49b] ml-5">{st.hall?.name} ({st.hall?.screenType})</div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1.5 text-xs text-[#d1c7ba]">
                                        <Calendar className="w-3.5 h-3.5 text-[#afa49b]" /> 
                                        {new Date(st.startTime).toLocaleDateString('vi-VN')}
                                      </div>
                                      <div className="inline-flex items-center gap-1 text-[#ff8fa3] text-xs font-mono font-bold mt-1 bg-[#ff4b72]/10 border border-[#ff4b72]/20 px-2 py-0.5 rounded">
                                        <Clock className="w-3 h-3" /> 
                                        {new Date(st.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', hour12: false})}
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-[#faf8f5] font-semibold">
                                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(st.basePrice)}
                                    </TableCell>
                                    <TableCell>
                                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        Mở bán
                                      </span>
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
