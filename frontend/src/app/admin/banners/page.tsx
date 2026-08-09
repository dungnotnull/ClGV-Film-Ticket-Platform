"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    displayOrder: 1,
    status: 'ACTIVE'
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/banners');
      if (res.success) {
        setBanners(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch banners', error);
      toast.error('Lỗi khi tải danh sách Banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = async () => {
    try {
      const payload = {
        ...formData,
        displayOrder: Number(formData.displayOrder)
      };
      const res = await api.post('/admin/banners', payload);
      if (res.success) {
        toast.success('Thêm banner thành công');
        setIsAddOpen(false);
        setFormData({ title: '', imageUrl: '', linkUrl: '', displayOrder: banners.length + 1, status: 'ACTIVE' });
        fetchBanners();
      } else {
        toast.error('Có lỗi xảy ra khi thêm banner');
      }
    } catch (error) {
      console.error('Failed to add banner', error);
      toast.error('Lỗi kết nối Server');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return;
    try {
      const res = await api.delete(`/admin/banners/${id}`);
      if (res.success) {
        toast.success('Đã xóa banner');
        fetchBanners();
      }
    } catch (error) {
      console.error('Failed to toggle status', error);
      toast.error('Lỗi kết nối Server');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await api.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.success) {
        setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
        toast.success('Tải ảnh lên thành công');
      } else {
        toast.error('Lỗi khi tải ảnh lên');
      }
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Lỗi kết nối Server');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold border-l-4 border-primary pl-4">Quản Lý Banners</h1>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="h-4 w-4" /> Thêm Banner mới
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Thêm Banner Trang Chủ</DialogTitle>
              <DialogDescription>
                Banner này sẽ tự động xuất hiện trên thanh trượt (slider) của Trang chủ.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Tiêu đề / Chiến dịch</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="VD: Mừng lễ 2/9, Vé chỉ 45k..." />
              </div>
              <div className="space-y-2">
                <Label>Ảnh Banner</Label>
                <div className="flex flex-col gap-3">
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Banner preview" className="w-full h-32 object-cover rounded-md border border-border" />
                  )}
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="flex-1 cursor-pointer"
                    />
                    {uploading && <span className="text-sm text-muted-foreground animate-pulse">Đang tải...</span>}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Đường dẫn đích (Link URL)</Label>
                <div className="flex gap-2">
                  <LinkIcon className="w-5 h-5 text-muted-foreground self-center" />
                  <Input value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} placeholder="/movies hoặc https://..." className="flex-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thứ tự hiển thị</Label>
                  <Input type="number" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: Number(e.target.value)})} min={1} />
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ACTIVE">Hoạt động (Hiển thị)</option>
                    <option value="INACTIVE">Tạm ẩn</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
              <Button onClick={handleAddBanner} disabled={!formData.title || !formData.imageUrl}>Lưu Banner</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-lg overflow-hidden shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-24">Hình ảnh</TableHead>
              <TableHead>Thông tin Banner</TableHead>
              <TableHead className="w-24 text-center">Thứ tự</TableHead>
              <TableHead className="w-32 text-center">Trạng thái</TableHead>
              <TableHead className="text-right w-24">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : banners.length > 0 ? (
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="w-24 h-12 bg-muted rounded overflow-hidden border border-border flex items-center justify-center">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold">{banner.title}</p>
                    <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 mt-1">
                      <LinkIcon className="w-3 h-3" /> {banner.linkUrl}
                    </a>
                  </TableCell>
                  <TableCell className="text-center font-bold">{banner.displayOrder}</TableCell>
                  <TableCell className="text-center">
                    {banner.status === 'ACTIVE' ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-bold">Hiển thị</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-bold">Đã ẩn</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteBanner(banner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Chưa có Banner nào.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
