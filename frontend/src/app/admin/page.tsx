"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, MapPin, Ticket, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalCinemas: 0,
    totalTickets: 0,
    totalUsers: 0,
    revenue: 0,
    timeline: [],
    occupancy: [],
    recentBookings: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardRes, revenueRes, occupancyRes, membersRes] = await Promise.all([
          api.get('/admin/analytics/dashboard'),
          api.get('/admin/analytics/revenue'),
          api.get('/admin/analytics/occupancy'),
          api.get('/admin/analytics/members'),
        ]);

        const dashboard = dashboardRes.data?.data || dashboardRes.data;
        const revenueData = revenueRes.data?.data || revenueRes.data;
        const occupancyData = occupancyRes.data?.data || occupancyRes.data;
        const membersData = membersRes.data?.data || membersRes.data;

        setStats({
          totalMovies: dashboard.activeMoviesCount || 0,
          totalCinemas: (revenueData?.byCinema || []).length || 0, 
          totalTickets: dashboard.totalTicketsSold || 0,
          totalUsers: membersData?.totalUsers || 0,
          revenue: dashboard.totalRevenue || 0,
          timeline: revenueData?.timeline || [],
          occupancy: occupancyData?.showtimes?.slice(0, 5) || [],
          recentBookings: dashboard.recentBookings || []
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold border-l-4 border-primary pl-4">Dashboard (Thống kê)</h1>
      
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
            <p className="text-xs text-muted-foreground mt-1">Từ các giao dịch thành công</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Phim Đang Chiếu</CardTitle>
            <Film className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalMovies}</div>
            <p className="text-xs text-muted-foreground mt-1">Trạng thái NOW_SHOWING</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vé Đã Bán</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng vé đã xuất</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Thành Viên</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng User đăng ký</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1 bg-card/40 backdrop-blur-md border border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="h-80 w-full pt-4">
            {!isLoading && stats.timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(val) => `${val / 1000000}M`} />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#ff3b30" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {isLoading ? 'Đang tải...' : 'Chưa có dữ liệu doanh thu'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card/40 backdrop-blur-md border border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Tỷ lệ lấp đầy rạp (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 w-full pt-4">
            {!isLoading && stats.occupancy.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.occupancy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="movieTitle" stroke="#888" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#888" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="occupancyPercentage" fill="#ff3b30" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {isLoading ? 'Đang tải...' : 'Chưa có dữ liệu lấp đầy'}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-2 bg-card/40 backdrop-blur-md border border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isLoading && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{booking.user?.fullName || booking.user?.email || 'Guest User'}</p>
                      <p className="text-sm text-muted-foreground">Đặt vé phim {booking.showtime?.movie?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">{isLoading ? 'Đang tải...' : 'Chưa có giao dịch nào'}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
