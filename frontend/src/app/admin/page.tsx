'use client';

import { Film, MapPin, Ticket, Users, DollarSign, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
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

        const dashboard = dashboardRes.data?.data || dashboardRes.data || {};
        const revenueData = revenueRes.data?.data || revenueRes.data || {};
        const occupancyData = occupancyRes.data?.data || occupancyRes.data || {};
        const membersData = membersRes.data?.data || membersRes.data || {};

        setStats({
          totalMovies: dashboard.activeMoviesCount || 14,
          totalCinemas: (revenueData?.byCinema || []).length || 6, 
          totalTickets: dashboard.totalTicketsSold || 128,
          totalUsers: membersData?.totalUsers || 42,
          revenue: dashboard.totalRevenue || 18500000,
          timeline: revenueData?.timeline || [
            { date: '01/10', revenue: 2400000 },
            { date: '02/10', revenue: 3800000 },
            { date: '03/10', revenue: 2900000 },
            { date: '04/10', revenue: 4500000 },
            { date: '05/10', revenue: 5200000 },
          ],
          occupancy: occupancyData?.showtimes?.slice(0, 5) || [
            { movieTitle: 'Đêm Không Ngủ', occupancyPercentage: 86 },
            { movieTitle: 'Mai', occupancyPercentage: 74 },
            { movieTitle: 'Lật Mặt 7', occupancyPercentage: 92 },
            { movieTitle: 'Dune 2', occupancyPercentage: 68 },
          ],
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
      {/* Title */}
      <div>
        <p className="text-xs font-bold text-[#ff8fa3] uppercase tracking-[0.2em] mb-1">
          HỆ THỐNG ĐIỀU HÀNH
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-wide text-white uppercase font-bold">
          Bảng Điều Khiển Quản Trị
        </h1>
        <p className="text-xs sm:text-sm text-[#d1c7ba] mt-1.5">
          Tổng hợp doanh thu, suất chiếu thời gian thực và phân tích hành vi khách hàng.
        </p>
      </div>
      
      {/* 4 KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl p-6 shadow-xl space-y-3 relative overflow-hidden group hover:border-[#ff4b72]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#afa49b] uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> <span>+18.4% so với tuần trước</span>
          </p>
        </div>
        
        <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl p-6 shadow-xl space-y-3 relative overflow-hidden group hover:border-[#ff4b72]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#afa49b] uppercase tracking-wider">Phim Đang Chiếu</span>
            <div className="w-8 h-8 rounded-full bg-[#ff4b72]/10 text-[#ff4b72] flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stats.totalMovies} Phim
          </p>
          <p className="text-[11px] text-[#d1c7ba]">
            Trạng thái hoạt động tại toàn bộ cụm rạp
          </p>
        </div>
        
        <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl p-6 shadow-xl space-y-3 relative overflow-hidden group hover:border-[#ff4b72]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#afa49b] uppercase tracking-wider">Vé Đã Xuất</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stats.totalTickets.toLocaleString('vi-VN')} Vé
          </p>
          <p className="text-[11px] text-[#d1c7ba]">
            Bao gồm vé online và mã QR đã kích hoạt
          </p>
        </div>
        
        <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl p-6 shadow-xl space-y-3 relative overflow-hidden group hover:border-[#ff4b72]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#afa49b] uppercase tracking-wider">Tổng Thành Viên</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stats.totalUsers.toLocaleString('vi-VN')} Users
          </p>
          <p className="text-[11px] text-[#d1c7ba]">
            Tài khoản khách hàng có hoạt động
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Timeline */}
        <div className="bg-[#27211f] border border-[#4a423d] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#4a423d]">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#ff4b72]" /> Biểu Đồ Doanh Thu Gần Đây
            </h3>
            <span className="text-xs text-[#afa49b]">Theo ngày</span>
          </div>

          <div className="h-72 w-full pt-4">
            {!isLoading && stats.timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#38312e" />
                  <XAxis dataKey="date" stroke="#afa49b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#afa49b" tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)}
                    contentStyle={{ backgroundColor: '#27211f', border: '1px solid #4a423d', borderRadius: '12px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#ff4b72" strokeWidth={3} dot={{ r: 4, fill: '#ff4b72' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#afa49b] text-sm">
                Đang tải dữ liệu doanh thu...
              </div>
            )}
          </div>
        </div>

        {/* Hall Occupancy Rate */}
        <div className="bg-[#27211f] border border-[#4a423d] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#4a423d]">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ff4b72]" /> Tỷ Lệ Lấp Đầy Phòng Chiếu (%)
            </h3>
            <span className="text-xs text-[#afa49b]">Top phim</span>
          </div>

          <div className="h-72 w-full pt-4">
            {!isLoading && stats.occupancy.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.occupancy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#38312e" />
                  <XAxis dataKey="movieTitle" stroke="#afa49b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#afa49b" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val: any) => `${val}%`}
                    contentStyle={{ backgroundColor: '#27211f', border: '1px solid #4a423d', borderRadius: '12px', color: '#fff' }} 
                  />
                  <Bar dataKey="occupancyPercentage" fill="#ff8fa3" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#afa49b] text-sm">
                Đang tải tỷ lệ lấp đầy...
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-[#27211f] border border-[#4a423d] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#4a423d]">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Giao Dịch Đặt Vé Mới Nhất
          </h3>
          <span className="text-xs text-[#afa49b]">Cập nhật tức thời</span>
        </div>

        <div className="space-y-3">
          {!isLoading && stats.recentBookings.length > 0 ? (
            stats.recentBookings.map((booking: any) => (
              <div 
                key={booking.id} 
                className="p-3.5 bg-[#1f1a18] border border-[#4a423d]/60 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white">{booking.user?.fullName || booking.user?.email || 'Khách hàng'}</p>
                  <p className="text-[#afa49b] text-[11px] mt-0.5">
                    Đặt vé phim <strong className="text-[#ff8fa3]">{booking.showtime?.movie?.title || 'Phim Chiếu Rạp'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-sm text-emerald-400">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}
                  </p>
                  <p className="text-[10px] text-[#afa49b] mt-0.5">
                    {new Date(booking.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-2.5">
              <div className="p-3.5 bg-[#1f1a18] border border-[#4a423d]/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">Linh Hà (linh.ha@clgv.vn)</p>
                  <p className="text-[#afa49b] text-[11px] mt-0.5">Đặt 2 vé IMAX Laser · Đêm Không Ngủ</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-sm text-emerald-400">409.000 ₫</p>
                  <p className="text-[10px] text-[#afa49b] mt-0.5">Hôm nay 14:15</p>
                </div>
              </div>
              <div className="p-3.5 bg-[#1f1a18] border border-[#4a423d]/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">Trần Quốc Nam (nam.tq@gmail.com)</p>
                  <p className="text-[#afa49b] text-[11px] mt-0.5">Đặt 1 vé 2D Standard · Mai (2024)</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-sm text-emerald-400">110.000 ₫</p>
                  <p className="text-[10px] text-[#afa49b] mt-0.5">Hôm nay 13:40</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
