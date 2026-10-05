"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, Settings2, Contact, CreditCard, ShieldAlert, Clock, Sparkles } from "lucide-react";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // States cho Vận hành rạp
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [bookingDays, setBookingDays] = useState("7");
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("23:30");

  // States cho Liên hệ
  const [hotline, setHotline] = useState("1900 6017");
  const [email, setEmail] = useState("hoidap@cgv.vn");
  const [address, setAddress] = useState("Tầng 2, Riviera Point, Số 2 Nguyễn Văn Tưởng, Phường Tân Phú, Quận 7, TP. HCM");
  const [facebookUrl, setFacebookUrl] = useState("https://www.facebook.com/cgvcinemavietnam");

  // States cho Thanh toán & Tích điểm
  const [pointConversion, setPointConversion] = useState("1000"); // 1 điểm = 1000 VND
  const [vipBonus, setVipBonus] = useState("5"); // 5%
  const [vvipBonus, setVvipBonus] = useState("10"); // 10%
  const [holdSeatTime, setHoldSeatTime] = useState("10"); // 10 phút

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Cập nhật cấu hình thành công!", {
        description: "Các thay đổi đã được áp dụng vào toàn hệ thống.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#4a423d] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
              <Settings2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#faf8f5] tracking-tight">Cấu Hình Hệ Thống</h1>
          </div>
          <p className="text-sm text-[#afa49b] mt-1 ml-10">
            Quản lý vận hành rạp, tham số Redlock giữ vé, tỷ lệ tích điểm và thông tin liên hệ
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="gap-2 bg-[#ff4b72] hover:bg-[#ff6584] text-white rounded-xl shadow-lg shadow-[#ff4b72]/20 font-medium transition-all"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-1 sm:grid-cols-3 gap-2 bg-[#1f1a18] p-1.5 rounded-2xl border border-[#4a423d] h-auto">
          <TabsTrigger
            value="operations"
            className="data-[state=active]:bg-[#ff4b72] data-[state=active]:text-white text-[#d1c7ba] hover:text-[#faf8f5] rounded-xl py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Vận hành Rạp
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-[#ff4b72] data-[state=active]:text-white text-[#d1c7ba] hover:text-[#faf8f5] rounded-xl py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Contact className="w-4 h-4" />
            Thông tin Liên hệ
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="data-[state=active]:bg-[#ff4b72] data-[state=active]:text-white text-[#d1c7ba] hover:text-[#faf8f5] rounded-xl py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Thanh toán & Tích điểm
          </TabsTrigger>
        </TabsList>

        {/* 1. Vận hành Rạp */}
        <TabsContent value="operations" className="mt-0">
          <Card className="border-[#4a423d] bg-[#27211f] rounded-2xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-[#4a423d]/60 bg-[#302927]/40 pb-4">
              <CardTitle className="text-lg font-bold text-[#faf8f5]">Thiết lập Vận hành Rạp</CardTitle>
              <CardDescription className="text-sm text-[#afa49b]">Cấu hình giờ mở cửa, giới hạn ngày đặt vé và trạng thái bảo trì hệ thống.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-[#1f1a18] border border-rose-500/30">
                <Checkbox 
                  id="maintenance" 
                  checked={maintenanceMode}
                  onCheckedChange={(checked) => setMaintenanceMode(checked === true)}
                  className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 border-[#4a423d]"
                />
                <div className="grid gap-1 leading-none">
                  <Label htmlFor="maintenance" className="text-rose-400 font-bold text-sm cursor-pointer">
                    Bật chế độ Bảo trì (Maintenance Mode)
                  </Label>
                  <p className="text-xs text-[#afa49b]">
                    Khi bật, toàn bộ khách hàng sẽ thấy trang thông báo bảo trì và không thể đặt vé hoặc đăng nhập.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bookingDays" className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">
                    Số ngày cho phép đặt vé trước
                  </Label>
                  <Input 
                    id="bookingDays" 
                    type="number" 
                    value={bookingDays}
                    onChange={(e) => setBookingDays(e.target.value)}
                    className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                  />
                  <p className="text-[11px] text-[#afa49b]">Khách hàng chỉ xem và đặt được các suất chiếu trong vòng {bookingDays} ngày tới.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Giờ mở cửa</Label>
                    <Select value={openTime} onValueChange={(val) => setOpenTime(val || '08:00')}>
                      <SelectTrigger className="w-full bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] rounded-xl h-11">
                        <SelectValue placeholder="Giờ mở cửa" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px] bg-[#27211f] border-[#4a423d] text-[#faf8f5]">
                        {Array.from({ length: 24 * 12 }).map((_, i) => {
                          const h = Math.floor(i / 12).toString().padStart(2, '0');
                          const m = ((i % 12) * 5).toString().padStart(2, '0');
                          const time = `${h}:${m}`;
                          return <SelectItem key={`open-${time}`} value={time}>{time}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Giờ đóng cửa</Label>
                    <Select value={closeTime} onValueChange={(val) => setCloseTime(val || '23:30')}>
                      <SelectTrigger className="w-full bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] rounded-xl h-11">
                        <SelectValue placeholder="Giờ đóng cửa" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px] bg-[#27211f] border-[#4a423d] text-[#faf8f5]">
                        {Array.from({ length: 24 * 12 }).map((_, i) => {
                          const h = Math.floor(i / 12).toString().padStart(2, '0');
                          const m = ((i % 12) * 5).toString().padStart(2, '0');
                          const time = `${h}:${m}`;
                          return <SelectItem key={`close-${time}`} value={time}>{time}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Cấu hình Thông tin Liên hệ */}
        <TabsContent value="contact" className="mt-0">
          <Card className="border-[#4a423d] bg-[#27211f] rounded-2xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-[#4a423d]/60 bg-[#302927]/40 pb-4">
              <CardTitle className="text-lg font-bold text-[#faf8f5]">Thông tin Liên hệ ClGV</CardTitle>
              <CardDescription className="text-sm text-[#afa49b]">Cấu hình các thông tin hiển thị tại chân trang (Footer) và các email xác nhận đặt vé.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hotline" className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Hotline chăm sóc khách hàng</Label>
                  <Input 
                    id="hotline" 
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Email hỗ trợ</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Địa chỉ trụ sở chính</Label>
                <Input 
                  id="address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Link Fanpage Facebook</Label>
                <Input 
                  id="facebook" 
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Cấu hình Thanh toán & Tích điểm */}
        <TabsContent value="payment" className="mt-0">
          <Card className="border-[#4a423d] bg-[#27211f] rounded-2xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-[#4a423d]/60 bg-[#302927]/40 pb-4">
              <CardTitle className="text-lg font-bold text-[#faf8f5]">Thanh toán, Redlock & Tích điểm</CardTitle>
              <CardDescription className="text-sm text-[#afa49b]">Cấu hình thuật toán khóa ghế Redis Redlock và quyền lợi điểm thưởng từng hạng thẻ.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pointConv" className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Tỷ lệ quy đổi điểm ClGV (VND)</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs text-[#afa49b]">1 điểm =</span>
                    <Input 
                      id="pointConv" 
                      type="number"
                      className="pl-20 pr-14 bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11 font-mono"
                      value={pointConversion}
                      onChange={(e) => setPointConversion(e.target.value)}
                    />
                    <span className="absolute right-3.5 top-3 text-xs text-[#afa49b] font-mono">VNĐ</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holdTime" className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">
                    Thời gian giữ ghế chờ thanh toán (phút)
                  </Label>
                  <Input 
                    id="holdTime" 
                    type="number" 
                    value={holdSeatTime}
                    onChange={(e) => setHoldSeatTime(e.target.value)}
                    className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11 font-mono"
                  />
                  <p className="text-[11px] text-[#afa49b]">Thời hạn TTL của Redis Redlock trước khi tự động giải phóng ghế.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#4a423d]/60">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#d1c7ba] mb-4">
                  Tỷ lệ thưởng điểm tích lũy theo Hạng thẻ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vipBonus" className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Thành viên VIP (%)</Label>
                    <div className="relative">
                      <Input 
                        id="vipBonus" 
                        type="number"
                        value={vipBonus}
                        onChange={(e) => setVipBonus(e.target.value)}
                        className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11 font-mono pr-8"
                      />
                      <span className="absolute right-3.5 top-3 text-xs text-[#afa49b] font-mono">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vvipBonus" className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Thành viên VVIP (%)</Label>
                    <div className="relative">
                      <Input 
                        id="vvipBonus" 
                        type="number"
                        value={vvipBonus}
                        onChange={(e) => setVvipBonus(e.target.value)}
                        className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11 font-mono pr-8"
                      />
                      <span className="absolute right-3.5 top-3 text-xs text-[#afa49b] font-mono">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
