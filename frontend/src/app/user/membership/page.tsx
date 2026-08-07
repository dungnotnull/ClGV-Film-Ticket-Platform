"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Award, Gift, History } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function MembershipPage() {
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rewardType, setRewardType] = useState('TICKET_2D');
  const [pointsToRedeem, setPointsToRedeem] = useState('50');
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchHistory();
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/membership/history');
      if (res.success) {
        setHistory(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch membership history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    setIsRedeeming(true);
    try {
      const res = await api.post('/membership/redeem', {
        rewardType,
        pointsToRedeem: parseInt(pointsToRedeem)
      });
      if (res.success) {
        toast.success('Đổi điểm thành công!');
        fetchHistory();
        fetchUser(); // Refresh user points
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Lỗi khi đổi điểm');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Đang tải thông tin...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Thành viên & Điểm</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Gift className="w-5 h-5" /> Đổi Quà (Redeem)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center bg-background p-4 rounded-lg border border-border">
              <span className="font-medium text-muted-foreground">Điểm hiện tại</span>
              <span className="text-2xl font-bold text-white">{user?.points || 0} pts</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chọn loại quà</label>
                <Select value={rewardType} onValueChange={setRewardType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Loại quà" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TICKET_2D">Vé 2D (Tốn 100 điểm)</SelectItem>
                    <SelectItem value="POPCORN_COMBO">Bắp Nước (Tốn 50 điểm)</SelectItem>
                    <SelectItem value="DISCOUNT_VOUCHER_50K">Voucher 50K (Tốn 30 điểm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Số điểm sử dụng</label>
                <Select value={pointsToRedeem} onValueChange={setPointsToRedeem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Số điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Điểm</SelectItem>
                    <SelectItem value="50">50 Điểm</SelectItem>
                    <SelectItem value="100">100 Điểm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={handleRedeem}
                disabled={isRedeeming || (user?.points || 0) < parseInt(pointsToRedeem)}
              >
                {isRedeeming ? 'Đang xử lý...' : 'Đổi Điểm Ngay'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" /> Lịch Sử Điểm
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((record: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{record.reason || 'Đổi quà / Tích điểm'}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.createdAt ? format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm') : ''}
                      </p>
                    </div>
                    <div className={`font-bold ${record.pointsChanged > 0 ? 'text-green-500' : 'text-destructive'}`}>
                      {record.pointsChanged > 0 ? '+' : ''}{record.pointsChanged} pts
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có lịch sử giao dịch điểm.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
