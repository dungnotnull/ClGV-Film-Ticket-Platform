"use client";

import { useState } from "react";
import { Oswald } from "next/font/google";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, Settings2, Contact, CreditCard } from "lucide-react";

const oswald = Oswald({ subsets: ["latin", "vietnamese"] });

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
    // Giả lập gọi API lưu
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Cập nhật cấu hình thành công!", {
        description: "Các thay đổi đã được lưu vào hệ thống.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`${oswald.className} text-3xl font-bold text-primary uppercase tracking-wider`}>
            Cấu hình Hệ thống
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các thiết lập chung cho toàn bộ nền tảng
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-1 md:grid-cols-3 gap-2 bg-transparent h-auto p-0">
          <TabsTrigger
            value="operations"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary border border-border/50 bg-card py-3"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Vận hành Rạp
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary border border-border/50 bg-card py-3"
          >
            <Contact className="w-4 h-4 mr-2" />
            Thông tin Liên hệ
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary border border-border/50 bg-card py-3"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Thanh toán & Tích điểm
          </TabsTrigger>
        </TabsList>

        {/* 1. Vận hành Rạp */}
        <TabsContent value="operations" className="mt-0">
          <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className={oswald.className}>Thiết lập Vận hành</CardTitle>
              <CardDescription>Cấu hình thời gian mở cửa và luật đặt vé chung.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2 border p-4 rounded-lg bg-background/50 border-destructive/30">
                <Checkbox 
                  id="maintenance" 
                  checked={maintenanceMode}
                  onCheckedChange={(checked) => setMaintenanceMode(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="maintenance" className="text-destructive font-medium cursor-pointer">
                    Bật chế độ Bảo trì (Maintenance Mode)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Khi bật, toàn bộ khách hàng sẽ không thể truy cập web để mua vé.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bookingDays">Số ngày cho phép đặt vé trước</Label>
                  <Input 
                    id="bookingDays" 
                    type="number" 
                    value={bookingDays}
                    onChange={(e) => setBookingDays(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Ví dụ: 7 ngày</p>
                </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Giờ mở cửa (HH:mm)</Label>
                      <Select value={openTime} onValueChange={setOpenTime}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Giờ mở cửa" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px]">
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
                      <Label>Giờ đóng cửa (HH:mm)</Label>
                      <Select value={closeTime} onValueChange={setCloseTime}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Giờ đóng cửa" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px]">
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
          <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className={oswald.className}>Thông tin Liên hệ CGV</CardTitle>
              <CardDescription>Cấu hình các thông tin hiển thị ở phần Footer và trang Liên hệ.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hotline">Hotline chăm sóc khách hàng</Label>
                  <Input 
                    id="hotline" 
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email hỗ trợ</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ trụ sở chính</Label>
                <Input 
                  id="address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Link Facebook Fanpage</Label>
                <Input 
                  id="facebook" 
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Cấu hình Thanh toán & Tích điểm */}
        <TabsContent value="payment" className="mt-0">
          <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className={oswald.className}>Thanh toán & Thẻ thành viên</CardTitle>
              <CardDescription>Thiết lập tỷ lệ quy đổi điểm và quy định giữ vé.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pointConv">Tỷ lệ quy đổi điểm CGV (VND)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">1 điểm =</span>
                    <Input 
                      id="pointConv" 
                      type="number"
                      className="pl-20"
                      value={pointConversion}
                      onChange={(e) => setPointConversion(e.target.value)}
                    />
                    <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">VNĐ</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holdTime">Thời gian giữ ghế chờ thanh toán (phút)</Label>
                  <Input 
                    id="holdTime" 
                    type="number" 
                    value={holdSeatTime}
                    onChange={(e) => setHoldSeatTime(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Sử dụng trong thuật toán Redis Redlock.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h3 className="text-sm font-medium mb-4">Tỷ lệ tích lũy điểm theo Hạng thẻ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vipBonus">Hạng VIP (%)</Label>
                    <div className="relative">
                      <Input 
                        id="vipBonus" 
                        type="number"
                        value={vipBonus}
                        onChange={(e) => setVipBonus(e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vvipBonus">Hạng VVIP (%)</Label>
                    <div className="relative">
                      <Input 
                        id="vvipBonus" 
                        type="number"
                        value={vvipBonus}
                        onChange={(e) => setVvipBonus(e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
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
