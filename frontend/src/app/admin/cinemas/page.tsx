"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, MonitorPlay, MapPin, Phone, Building } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isHallsOpen, setIsHallsOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    cityId: '',
    name: '',
    address: '',
    phone: '',
    amenities: 'Parking, Popcorn Bar'
  });

  const [hallData, setHallData] = useState({
    name: 'Hall 1',
    screenType: 'STANDARD'
  });

  const fetchCinemas = async () => {
    try {
      const res = await api.get('/cinemas');
      if (res.success) {
        setCinemas(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch cinemas', error);
      toast.error('Lỗi khi tải danh sách rạp');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await api.get('/cities');
      if (res.success) {
        setCities(res.data || []);
        if (res.data && res.data.length > 0) {
          setFormData(prev => ({ ...prev, cityId: res.data[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch cities', error);
    }
  };

  useEffect(() => {
    fetchCinemas();
    fetchCities();
  }, []);

  const handleAddCinema = async () => {
    try {
      const payload = {
        ...formData,
        amenities: formData.amenities.split(',').map(a => a.trim())
      };
      const res = await api.post('/cinemas', payload);
      if (res.success) {
        toast.success('Thêm rạp thành công');
        setIsAddOpen(false);
        setFormData({
          cityId: cities.length > 0 ? (cities[0] as any).id : '',
          name: '',
          address: '',
          phone: '',
          amenities: 'Parking, Popcorn Bar'
        });
        fetchCinemas();
      } else {
        if (res.error?.code === 'DUPLICATE_CINEMA_NAME') {
          setIsAddOpen(false);
          toast.error('Lỗi: Tên rạp đã tồn tại trong hệ thống!');
        } else {
          toast.error(res.error?.message || res.message || 'Có lỗi xảy ra');
        }
      }
    } catch (error: any) {
      console.error('Failed to add cinema', error);
      if (error.response?.data?.error?.code === 'DUPLICATE_CINEMA_NAME') {
        setIsAddOpen(false);
        toast.error('Lỗi: Tên rạp đã tồn tại trong hệ thống!');
      } else {
        toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
      }
    }
  };

  const handleAddHall = async () => {
    if (!selectedCinema) return;
    try {
      const payload = {
        cinemaId: selectedCinema.id,
        name: hallData.name,
        screenType: hallData.screenType,
        roomMatrix: { dimensions: { rows: 10, cols: 10 }, aisles: { vertical: [5], horizontal: [5] }, grid: [] }
      };
      const res = await api.post('/halls', payload);
      if (res.success) {
        toast.success('Thêm phòng chiếu thành công');
        fetchCinemas();
        // Update selected cinema data immediately
        setSelectedCinema((prev: any) => ({
          ...prev,
          halls: [...(prev.halls || []), res.data]
        }));
      } else {
        if (res.error?.code === 'DUPLICATE_HALL_NAME') {
          toast.error('Lỗi: Tên phòng chiếu đã tồn tại trong rạp này!');
        } else {
          toast.error(res.error?.message || res.message || 'Có lỗi xảy ra');
        }
      }
    } catch (error: any) {
      console.error('Failed to add hall', error);
      if (error.response?.data?.error?.code === 'DUPLICATE_HALL_NAME') {
        toast.error('Lỗi: Tên phòng chiếu đã tồn tại trong rạp này!');
      } else {
        toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
      }
    }
  };

  const notifyMissingApi = () => {
    toast.info('Tính năng đang chờ Backend cung cấp API', {
      description: 'API Sửa và Xóa rạp chưa được định nghĩa trong API-CONTRACT.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#4a423d] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
              <MapPin className="w-4 h-4" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#faf8f5] tracking-tight">Quản Lý Cụm Rạp</h1>
          </div>
          <p className="text-sm text-[#afa49b] mt-1 ml-10">Mạng lưới rạp chiếu ClGV, phòng chiếu và cấu hình sơ đồ ghế</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#ff4b72] hover:bg-[#ff6584] text-white rounded-xl shadow-lg shadow-[#ff4b72]/20 font-medium transition-all">
              <Plus className="h-4 w-4" /> Thêm rạp mới
            </Button>
          } />
          <DialogContent className="sm:max-w-[540px] bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#faf8f5]">Thêm rạp mới</DialogTitle>
              <DialogDescription className="text-sm text-[#afa49b]">
                Tạo một cụm rạp mới và gán vào tỉnh/thành phố tương ứng.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Thành phố</Label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-[#4a423d] bg-[#1f1a18] px-3.5 py-2 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72]"
                  value={formData.cityId}
                  onChange={e => setFormData({...formData, cityId: e.target.value})}
                >
                  {cities.map((city: any) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Tên rạp</Label>
                <Input 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="VD: CGV Vincom Landmark 81" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Địa chỉ</Label>
                <Input 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                  placeholder="Tầng B1, Số 772 Điện Biên Phủ, P. 22, Bình Thạnh..." 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Hotline</Label>
                <Input 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="1900 6017" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Tiện ích (cách nhau bởi dấu phẩy)</Label>
                <Input 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                  value={formData.amenities} 
                  onChange={e => setFormData({...formData, amenities: e.target.value})} 
                  placeholder="Parking, IMAX, Gold Class, Popcorn Bar..." 
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t border-[#4a423d]">
              <Button variant="outline" className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl" onClick={() => setIsAddOpen(false)}>
                Hủy
              </Button>
              <Button className="bg-[#ff4b72] hover:bg-[#ff6584] text-white font-medium rounded-xl shadow-lg shadow-[#ff4b72]/20" onClick={handleAddCinema}>
                Lưu rạp
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hall Management Modal */}
      <Dialog open={isHallsOpen} onOpenChange={setIsHallsOpen}>
        <DialogContent className="sm:max-w-[650px] bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#faf8f5] flex items-center gap-2">
              <MonitorPlay className="w-5 h-5 text-[#ff4b72]" />
              Quản lý Phòng Chiếu - {selectedCinema?.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b]">
              Thêm phòng chiếu mới và thiết lập sơ đồ ghế cho từng định dạng phòng.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 items-end bg-[#1f1a18] p-4 rounded-xl border border-[#4a423d]">
              <div className="flex-1 w-full space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Tên phòng</Label>
                <Input 
                  className="bg-[#27211f] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-10"
                  value={hallData.name} 
                  onChange={e => setHallData({...hallData, name: e.target.value})} 
                  placeholder="VD: Cinema 01" 
                />
              </div>
              <div className="flex-1 w-full space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Định dạng</Label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-[#4a423d] bg-[#27211f] px-3.5 py-2 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72]"
                  value={hallData.screenType}
                  onChange={e => setHallData({...hallData, screenType: e.target.value})}
                >
                  <option value="STANDARD">2D / Standard</option>
                  <option value="IMAX">IMAX Laser</option>
                  <option value="FOUR_DX">4DX</option>
                  <option value="SCREEN_X">ScreenX</option>
                  <option value="GOLD_CLASS">Gold Class</option>
                  <option value="LAMOUR_BED">L'Amour Bed</option>
                </select>
              </div>
              <Button 
                onClick={handleAddHall}
                className="bg-[#ff4b72] hover:bg-[#ff6584] text-white rounded-xl shadow-lg shadow-[#ff4b72]/20 font-medium h-10 w-full sm:w-auto"
              >
                Thêm phòng
              </Button>
            </div>
            
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#d1c7ba] mb-3 pb-2 border-b border-[#4a423d]">
                Danh sách phòng chiếu hiện có
              </h4>
              {selectedCinema?.halls && selectedCinema.halls.length > 0 ? (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {selectedCinema.halls.map((hall: any) => (
                    <div key={hall.id} className="flex justify-between items-center p-3.5 bg-[#1f1a18] border border-[#4a423d] rounded-xl">
                      <div>
                        <p className="font-bold text-[#faf8f5] text-sm">{hall.name}</p>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#302927] text-[#ff8fa3] border border-[#ff4b72]/20 mt-1 inline-block">
                          {hall.screenType}
                        </span>
                      </div>
                      <Link href={`/admin/halls/${hall.id}/matrix`}>
                        <Button size="sm" variant="outline" className="gap-2 border-[#ff4b72]/40 text-[#ff8fa3] hover:text-white hover:bg-[#ff4b72] rounded-xl text-xs">
                          <MonitorPlay className="w-3.5 h-3.5" /> Sơ đồ ghế
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#afa49b] text-sm text-center py-6">Rạp chưa có phòng chiếu nào. Hãy tạo phòng chiếu đầu tiên ở trên.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table Section */}
      <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#302927] border-b border-[#4a423d] hover:bg-[#302927]">
              <TableHead className="w-[60px] text-center font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">STT</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Tên rạp</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Thành phố</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Địa chỉ</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Hotline</TableHead>
              <TableHead className="text-right font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba] pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-[#afa49b]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải danh sách rạp...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : cinemas.length > 0 ? (
              cinemas.map((cinema: any, index: number) => (
                <TableRow key={cinema.id} className="border-b border-[#4a423d]/50 hover:bg-[#302927]/40 transition-colors">
                  <TableCell className="font-mono text-xs text-center text-[#afa49b]">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-bold text-[#faf8f5]">{cinema.name}</div>
                    <div className="text-xs text-[#afa49b] mt-0.5">
                      {cinema.halls?.length || 0} phòng chiếu
                    </div>
                  </TableCell>
                  <TableCell className="text-[#d1c7ba] text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#afa49b]" />
                      {cinema.city?.name || cinema.city}
                    </span>
                  </TableCell>
                  <TableCell className="text-[#afa49b] text-xs max-w-[240px] truncate">{cinema.address}</TableCell>
                  <TableCell className="text-[#d1c7ba] text-xs font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#afa49b]" />
                      {cinema.hotline || cinema.phone || '1900 6017'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-[#ff8fa3] hover:text-[#ff4b72] hover:bg-[#ff4b72]/15 rounded-lg" 
                        title="Quản lý phòng chiếu"
                        onClick={() => {
                          setSelectedCinema(cinema);
                          setIsHallsOpen(true);
                        }}
                      >
                        <MonitorPlay className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-[#d1c7ba] hover:text-white hover:bg-[#302927] rounded-lg" 
                        onClick={notifyMissingApi}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-lg" 
                        onClick={notifyMissingApi}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-[#afa49b]">
                  Không có dữ liệu rạp nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
