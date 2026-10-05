"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Link as LinkIcon, Image as ImageIcon, ExternalLink } from 'lucide-react';
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#4a423d] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#faf8f5] tracking-tight">Quản Lý Banners Khuyến Mãi</h1>
          </div>
          <p className="text-sm text-[#afa49b] mt-1 ml-10">Slide quảng cáo trang chủ, chiến dịch phim bom tấn và ưu đãi thành viên</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#ff4b72] hover:bg-[#ff6584] text-white rounded-xl shadow-lg shadow-[#ff4b72]/20 font-medium transition-all">
              <Plus className="h-4 w-4" /> Thêm Banner mới
            </Button>
          } />
          <DialogContent className="sm:max-w-[600px] bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#faf8f5]">Thêm Banner Trang Chủ</DialogTitle>
              <DialogDescription className="text-sm text-[#afa49b]">
                Banner này sẽ tự động xuất hiện trên slider nổi bật của Trang chủ.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Tiêu đề / Chiến dịch</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="VD: Mừng lễ 2/9, Vé chỉ 45k cho thành viên Rose..." 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Ảnh Banner</Label>
                <div className="flex flex-col gap-3">
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Banner preview" className="w-full h-36 object-cover rounded-xl border border-[#4a423d] shadow-md" />
                  )}
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] file:bg-[#302927] file:text-[#faf8f5] file:border-0 file:rounded-lg file:mr-3 file:py-1 file:px-3 rounded-xl cursor-pointer"
                    />
                    {uploading && <span className="text-xs text-[#ff4b72] animate-pulse">Đang tải...</span>}
                  </div>
                  <Input 
                    value={formData.imageUrl} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                    placeholder="Hoặc dán URL ảnh trực tiếp..." 
                    className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] text-xs focus:border-[#ff4b72] rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Đường dẫn đích (Link URL)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.linkUrl} 
                    onChange={e => setFormData({...formData, linkUrl: e.target.value})} 
                    placeholder="/movies hoặc https://..." 
                    className="flex-1 bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Thứ tự hiển thị</Label>
                  <Input 
                    type="number" 
                    value={formData.displayOrder} 
                    onChange={e => setFormData({...formData, displayOrder: Number(e.target.value)})} 
                    min={1} 
                    className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Trạng thái</Label>
                  <select 
                    className="flex h-11 w-full rounded-xl border border-[#4a423d] bg-[#1f1a18] px-3.5 py-2 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72]"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ACTIVE">Hoạt động (Hiển thị)</option>
                    <option value="INACTIVE">Tạm ẩn</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t border-[#4a423d]">
              <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl">
                Hủy
              </Button>
              <Button 
                onClick={handleAddBanner} 
                disabled={!formData.title || !formData.imageUrl}
                className="bg-[#ff4b72] hover:bg-[#ff6584] text-white font-medium rounded-xl shadow-lg shadow-[#ff4b72]/20"
              >
                Lưu Banner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Section */}
      <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#302927] border-b border-[#4a423d] hover:bg-[#302927]">
              <TableHead className="w-32 font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba] pl-6">Hình ảnh</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Thông tin Banner</TableHead>
              <TableHead className="w-24 text-center font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Thứ tự</TableHead>
              <TableHead className="w-32 text-center font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Trạng thái</TableHead>
              <TableHead className="text-right w-24 font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba] pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-[#afa49b]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải danh sách banner...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : banners.length > 0 ? (
              banners.map((banner) => (
                <TableRow key={banner.id} className="border-b border-[#4a423d]/50 hover:bg-[#302927]/40 transition-colors">
                  <TableCell className="pl-6">
                    <div className="w-28 h-14 bg-[#1f1a18] rounded-xl overflow-hidden border border-[#4a423d] flex items-center justify-center shadow-md">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-[#afa49b]" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-[#faf8f5]">{banner.title}</p>
                    {banner.linkUrl && (
                      <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-[#ff8fa3] hover:underline inline-flex items-center gap-1 mt-1">
                        <LinkIcon className="w-3 h-3" /> {banner.linkUrl}
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-bold font-mono text-[#faf8f5]">{banner.displayOrder}</TableCell>
                  <TableCell className="text-center">
                    {banner.status === 'ACTIVE' ? (
                      <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                        Hiển thị
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-[#1f1a18] text-[#afa49b] border border-[#4a423d] rounded-full text-xs font-semibold">
                        Đã ẩn
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-lg" 
                      onClick={() => handleDeleteBanner(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-[#afa49b]">Chưa có Banner nào được tạo.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
