"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, MapPin, Ticket, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalCinemas: 0,
    totalTickets: 0,
    totalUsers: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [moviesRes, cinemasRes] = await Promise.all([
          api.get('/movies?limit=1000'),
          api.get('/cinemas')
        ]);
        
        const moviesCount = moviesRes.success && Array.isArray(moviesRes.data) ? moviesRes.data.length : 0;
        const cinemasCount = cinemasRes.success && Array.isArray(cinemasRes.data) ? cinemasRes.data.length : 0;

        setStats(prev => ({
          ...prev,
          totalMovies: moviesCount,
          totalCinemas: cinemasCount,
        }));
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    
    // Revenue, Users, Tickets are still mocked because Backend lacks Analytics API
    setStats({
      totalMovies: 0,
      totalCinemas: 0,
      totalTickets: 1250,
      totalUsers: 4320,
      revenue: 156000000,
    });
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold border-l-4 border-primary pl-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Doanh Thu</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+20.1% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Phim Đang Chiếu</CardTitle>
            <Film className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalMovies}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 phim mới tuần này</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hệ Thống Rạp</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalCinemas}</div>
            <p className="text-xs text-muted-foreground mt-1">Hoạt động ổn định</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Thành Viên</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">+180 user mới hôm nay</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1 bg-card/40 backdrop-blur-md border border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu (Mock)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center bg-muted/20 border border-dashed border-border rounded-md m-6">
            <p className="text-muted-foreground text-center px-4">Tính năng biểu đồ Doanh thu và Số lượng vé đang chờ Backend cung cấp API Analytics (Thống kê).</p>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 bg-card/40 backdrop-blur-md border border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">User #{4000 + i}</p>
                    <p className="text-sm text-muted-foreground">Đặt 2 vé phim Mai</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">+240.000đ</p>
                    <p className="text-xs text-muted-foreground">Vừa xong</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
