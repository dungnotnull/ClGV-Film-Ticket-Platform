"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
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

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold border-l-4 border-primary pl-4 flex items-center gap-2">
          <Building2 className="w-8 h-8 text-primary" /> Quản lý Thành Phố
        </h1>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm Thành Phố
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city) => (
          <Card key={city.id} className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex justify-between items-start">
                <span>{city.name}</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Code: {city.code}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(city)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(city)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Sửa Thành Phố' : 'Thêm Thành Phố'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tên thành phố</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="VD: TP. Hồ Chí Minh" />
            </div>
            <div className="space-y-2">
              <Label>Mã Code</Label>
              <Input required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="VD: HCM" />
            </div>
            <div className="space-y-2">
              <Label>Thứ tự hiển thị (Tùy chọn)</Label>
              <Input type="number" value={formData.displayOrder} onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">{isEditing ? 'Cập nhật' : 'Thêm mới'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Xác nhận xóa thành phố</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thành phố <strong>{cityToDelete?.name}</strong>? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
