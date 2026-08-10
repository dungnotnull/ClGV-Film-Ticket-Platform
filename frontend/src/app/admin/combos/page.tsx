"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Popcorn, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', description: '', imageUrl: '', price: 0 });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const res = await api.get('/combos');
      if (res.success) setCombos(res.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách bắp nước');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (combo?: any) => {
    if (combo) {
      setIsEditing(true);
      setFormData({ 
        id: combo.id, 
        title: combo.title, 
        description: combo.description || '', 
        imageUrl: combo.imageUrl || '', 
        price: combo.price 
      });
    } else {
      setIsEditing(false);
      setFormData({ id: '', title: '', description: '', imageUrl: '', price: 0 });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        price: Number(formData.price)
      };

      if (isEditing) {
        await api.put(`/admin/combos/${formData.id}`, payload);
        toast.success('Cập nhật combo thành công');
      } else {
        await api.post('/admin/combos', payload);
        toast.success('Thêm combo thành công');
      }
      setIsDialogOpen(false);
      fetchCombos();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa combo này?')) return;
    try {
      await api.delete(`/admin/combos/${id}`);
      toast.success('Xóa combo thành công');
      fetchCombos();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold border-l-4 border-primary pl-4 flex items-center gap-2">
          <Popcorn className="w-8 h-8 text-primary" /> Quản lý Bắp Nước
        </h1>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm Combo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map((combo) => (
          <Card key={combo.id} className="border-border/50 bg-card/40 backdrop-blur-md overflow-hidden flex flex-col">
            <div className="h-48 bg-muted relative overflow-hidden flex items-center justify-center">
              {combo.imageUrl ? (
                <img src={combo.imageUrl} alt={combo.title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{combo.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{combo.description}</p>
                <p className="font-bold text-lg text-primary mb-4">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.price)}
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-auto">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(combo)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(combo.id)}>
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
            <DialogTitle>{isEditing ? 'Sửa Combo' : 'Thêm Combo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tên Combo</Label>
              <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="VD: CGV Combo 1" />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="VD: 1 Bắp Ngọt Large + 2 Nước Ngọt Large" />
            </div>
            <div className="space-y-2">
              <Label>Hình ảnh (URL)</Label>
              <Input value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Giá tiền (VND)</Label>
              <Input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})} />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">{isEditing ? 'Cập nhật' : 'Thêm mới'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
