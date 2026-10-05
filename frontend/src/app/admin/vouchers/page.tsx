"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Ticket, Plus, Tag, Calendar, BadgePercent } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    code: '', 
    title: '', 
    discountType: 'FIXED_AMOUNT', 
    discountValue: 0,
    minOrderValue: 0,
    expiresAt: ''
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/admin/vouchers');
      if (res.success) setVouchers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (error) {
      toast.error('Lỗi khi tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    setFormData({ 
      code: '', 
      title: '', 
      discountType: 'FIXED_AMOUNT', 
      discountValue: 0,
      minOrderValue: 0,
      expiresAt: nextWeek.toISOString().slice(0, 16) // Format YYYY-MM-DDThh:mm
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code,
        title: formData.title,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
        expiresAt: new Date(formData.expiresAt).toISOString()
      };

      await api.post('/admin/vouchers', payload);
      toast.success('Thêm mã giảm giá thành công');
      setIsDialogOpen(false);
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#4a423d] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
              <Ticket className="w-4 h-4" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#faf8f5] tracking-tight">Quản Lý Mã Giảm Giá</h1>
          </div>
          <p className="text-sm text-[#afa49b] mt-1 ml-10">Phát hành voucher khuyến mãi, giảm trừ trực tiếp hoặc theo phần trăm</p>
        </div>
        <Button 
          onClick={handleOpenDialog} 
          className="flex items-center gap-2 bg-[#ff4b72] hover:bg-[#ff6584] text-white rounded-xl shadow-lg shadow-[#ff4b72]/20 font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Phát hành Voucher
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#afa49b]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
            <span>Đang tải danh sách voucher...</span>
          </div>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl p-12 text-center text-[#afa49b]">
          Chưa có mã giảm giá nào được phát hành.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((voucher) => (
            <Card key={voucher.id} className="border-[#4a423d] bg-[#27211f] hover:border-[#ff4b72]/40 transition-all rounded-2xl overflow-hidden shadow-xl">
              <CardHeader className="pb-3 border-b border-[#4a423d]/60 bg-[#302927]/40">
                <CardTitle className="text-lg flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#ff4b72]" />
                    <span className="font-mono font-bold tracking-wider text-[#ff8fa3]">{voucher.code}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    voucher.status === 'ACTIVE' 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}>
                    {voucher.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="font-semibold text-[#faf8f5] mb-3 text-sm">{voucher.title}</p>
                <div className="space-y-2 text-xs text-[#afa49b] bg-[#1f1a18] p-3 rounded-xl border border-[#4a423d]">
                  <div className="flex justify-between">
                    <span>Mức giảm:</span>
                    <span className="text-[#faf8f5] font-bold font-mono">
                      {voucher.discountType === 'FIXED_AMOUNT' ? `${voucher.discountValue.toLocaleString()}đ` : `${voucher.discountValue}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Đơn tối thiểu:</span>
                    <span className="text-[#d1c7ba] font-mono">{voucher.minOrderValue.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#4a423d]/50">
                    <span>Hạn sử dụng:</span>
                    <span className="text-[#d1c7ba] font-mono">{format(new Date(voucher.expiresAt), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#faf8f5]">Phát Hành Mã Giảm Giá</DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b]">
              Cấu hình mã code, mức ưu đãi và thời hạn áp dụng cho toàn hệ thống.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Mã Code (VD: CGV50K)</Label>
              <Input 
                required 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                placeholder="VD: CGVVIP50"
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] font-mono uppercase tracking-wider focus:border-[#ff4b72] rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Tiêu đề hiển thị</Label>
              <Input 
                required 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="VD: Giảm 50.000đ cho đơn hàng từ 200.000đ"
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Loại giảm giá</Label>
                <Select value={formData.discountType} onValueChange={(val) => setFormData(prev => ({ ...prev, discountType: val || 'FIXED_AMOUNT' }))}>
                  <SelectTrigger className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#27211f] border-[#4a423d] text-[#faf8f5]">
                    <SelectItem value="FIXED_AMOUNT">Giảm Tiền (VND)</SelectItem>
                    <SelectItem value="PERCENTAGE">Giảm Theo %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Mức giảm</Label>
                <Input 
                  type="number" 
                  required 
                  value={formData.discountValue} 
                  onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})} 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Giá trị đơn tối thiểu (VND)</Label>
              <Input 
                type="number" 
                value={formData.minOrderValue} 
                onChange={(e) => setFormData({...formData, minOrderValue: Number(e.target.value)})} 
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Hạn sử dụng</Label>
              <Input 
                type="datetime-local" 
                required 
                value={formData.expiresAt} 
                onChange={(e) => setFormData({...formData, expiresAt: e.target.value})} 
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#4a423d]">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl">
                Hủy
              </Button>
              <Button type="submit" className="bg-[#ff4b72] hover:bg-[#ff6584] text-white font-medium rounded-xl shadow-lg shadow-[#ff4b72]/20">
                Phát hành
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
