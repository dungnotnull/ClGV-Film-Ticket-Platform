"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Popcorn, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#4a423d] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
              <Popcorn className="w-4 h-4" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#faf8f5] tracking-tight">Quản Lý Bắp Nước (F&B)</h1>
          </div>
          <p className="text-sm text-[#afa49b] mt-1 ml-10">Danh mục combo bắp nước, đồ ăn nhẹ và ưu đãi rạp chiếu</p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="flex items-center gap-2 bg-[#ff4b72] hover:bg-[#ff6584] text-white rounded-xl shadow-lg shadow-[#ff4b72]/20 font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm Combo
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#afa49b]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
            <span>Đang tải danh sách combo...</span>
          </div>
        </div>
      ) : combos.length === 0 ? (
        <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl p-12 text-center text-[#afa49b]">
          Chưa có combo bắp nước nào. Hãy tạo combo mới.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo) => (
            <Card key={combo.id} className="border-[#4a423d] bg-[#27211f] hover:border-[#ff4b72]/40 transition-all rounded-2xl overflow-hidden flex flex-col shadow-xl">
              <div className="h-48 bg-[#1f1a18] relative overflow-hidden flex items-center justify-center border-b border-[#4a423d]">
                {combo.imageUrl ? (
                  <img src={combo.imageUrl} alt={combo.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#afa49b]">
                    <Popcorn className="w-12 h-12 text-[#4a423d]" />
                    <span className="text-xs">Chưa có hình ảnh</span>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-[#faf8f5]">{combo.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-0">
                <div>
                  <p className="text-sm text-[#afa49b] line-clamp-2 mb-4 leading-relaxed">{combo.description}</p>
                  <p className="font-bold text-xl text-[#ff8fa3] font-mono mb-4">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.price)}
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#4a423d]/50">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenDialog(combo)}
                    className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl text-xs"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Sửa
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(combo.id)}
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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#faf8f5]">{isEditing ? 'Sửa Combo F&B' : 'Thêm Combo Mới'}</DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b]">
              Nhập thông tin tiêu đề, mô tả và giá bán lẻ cho combo bắp nước.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Tên Combo</Label>
              <Input 
                required 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="VD: My Combo - 1 Bắp + 1 Nước" 
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Mô tả</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="VD: 1 Bắp rang bơ vị ngọt size L và 1 ly nước ngọt size L..." 
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl min-h-[80px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Hình ảnh (URL)</Label>
              <Input 
                value={formData.imageUrl} 
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                placeholder="https://..." 
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Giá tiền (VND)</Label>
              <Input 
                type="number" 
                required 
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})} 
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
    </div>
  );
}
