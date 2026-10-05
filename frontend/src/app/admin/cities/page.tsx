"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', code: '', displayOrder: 0 });
  const [isEditing, setIsEditing] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<any>(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await api.get('/cities');
      if (res.success) setCities(res.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách thành phố');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (city?: any) => {
    if (city) {
      setIsEditing(true);
      setFormData({ id: city.id, name: city.name, code: city.code, displayOrder: city.displayOrder || 0 });
    } else {
      setIsEditing(false);
      setFormData({ id: '', name: '', code: '', displayOrder: 0 });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.displayOrder > 0) {
      const isDuplicate = cities.some(city => 
        city.displayOrder === Number(formData.displayOrder) && 
        city.id !== formData.id
      );
      if (isDuplicate) {
        toast.error('Thứ tự hiển thị này đã tồn tại. Vui lòng chọn số khác!');
        return;
      }
    }

    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        displayOrder: Number(formData.displayOrder)
      };

      if (isEditing) {
        await api.put(`/admin/cities/${formData.id}`, payload);
        toast.success('Cập nhật thành phố thành công');
      } else {
        await api.post('/admin/cities', payload);
        toast.success('Thêm thành phố thành công');
      }
      setIsDialogOpen(false);
      fetchCities();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = (city: any) => {
    setCityToDelete(city);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!cityToDelete) return;
    try {
      await api.delete(`/admin/cities/${cityToDelete.id}`);
      toast.success('Xóa thành phố thành công');
      setIsDeleteDialogOpen(false);
      setCityToDelete(null);
      fetchCities();
    } catch (error: any) {
      toast.error('Có lỗi xảy ra khi xóa');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#4a423d] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#faf8f5] tracking-tight">Quản Lý Tỉnh / Thành Phố</h1>
          </div>
          <p className="text-sm text-[#afa49b] mt-1 ml-10">Khu vực địa lý, mã thành phố và phân bổ cụm rạp trên toàn quốc</p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="flex items-center gap-2 bg-[#ff4b72] hover:bg-[#ff6584] text-white rounded-xl shadow-lg shadow-[#ff4b72]/20 font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm Thành Phố
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#afa49b]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
            <span>Đang tải danh sách thành phố...</span>
          </div>
        </div>
      ) : cities.length === 0 ? (
        <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl p-12 text-center text-[#afa49b]">
          Chưa có tỉnh/thành phố nào được tạo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Card key={city.id} className="border-[#4a423d] bg-[#27211f] hover:border-[#ff4b72]/40 transition-all rounded-2xl overflow-hidden shadow-xl">
              <CardHeader className="pb-3 border-b border-[#4a423d]/60 bg-[#302927]/40">
                <CardTitle className="text-lg flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#ff4b72]" />
                    <span className="font-bold text-[#faf8f5]">{city.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#1f1a18] text-[#ff8fa3] border border-[#ff4b72]/30 px-2.5 py-0.5 rounded-full">
                    {city.code}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center text-xs text-[#afa49b] mb-4">
                  <span>Thứ tự hiển thị:</span>
                  <span className="font-mono text-[#faf8f5] font-bold">{city.displayOrder || 0}</span>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#4a423d]/50">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenDialog(city)}
                    className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl text-xs"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Sửa
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(city)}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-xl text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#faf8f5]">{isEditing ? 'Sửa Thành Phố' : 'Thêm Thành Phố'}</DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b]">
              Nhập tên tỉnh/thành phố và mã code viết tắt (VD: HCM, HAN, DNG).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Tên thành phố</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="VD: TP. Hồ Chí Minh" 
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Mã Code</Label>
              <Input 
                required 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                placeholder="VD: HCM" 
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] font-mono uppercase focus:border-[#ff4b72] rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Thứ tự hiển thị (Tùy chọn)</Label>
              <Input 
                type="number" 
                value={formData.displayOrder} 
                onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} 
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[#4a423d]">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl">
                Hủy
              </Button>
              <Button type="submit" className="bg-[#ff4b72] hover:bg-[#ff6584] text-white font-medium rounded-xl shadow-lg shadow-[#ff4b72]/20">
                {isEditing ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-rose-400 font-bold text-lg">Xác nhận xóa thành phố</DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b] mt-2">
              Bạn có chắc chắn muốn xóa thành phố <strong className="text-[#faf8f5]">{cityToDelete?.name}</strong>? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl">
              Hủy
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl shadow-lg shadow-rose-600/20" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
