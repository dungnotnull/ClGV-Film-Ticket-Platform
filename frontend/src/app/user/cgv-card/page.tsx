"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard, Wallet, ArrowUpRight, History } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CGVCardPage() {
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [topupAmount, setTopupAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchBalanceAndHistory();
  }, [isAuthenticated]);

  const fetchBalanceAndHistory = async () => {
    try {
      const res = await api.get('/cgv-card/balance');
      if (res.success) {
        setBalance(res.data.balance || 0);
        setHistory(res.data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch CGV Card info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    const amount = parseInt(topupAmount.replace(/,/g, ''));
    if (!amount || amount < 50000) {
      toast.error('Số tiền nạp tối thiểu là 50,000đ');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.post('/cgv-card/topup', {
        amount,
        paymentMethod: 'VNPAY'
      });
      if (res.success) {
        toast.success('Nạp tiền thành công!');
        setTopupAmount('');
        fetchBalanceAndHistory();
        fetchUser(); // Refresh user context balance
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Lỗi khi nạp tiền');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setTopupAmount(amount.toString());
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Đang tải thông tin thẻ...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Thẻ CGV Card</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Wallet className="w-5 h-5" /> Nạp Tiền (Topup)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-zinc-800 to-black p-6 rounded-xl border border-zinc-700 relative overflow-hidden text-white shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Số dư hiện tại</p>
                  <p className="text-3xl font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(balance)}
                  </p>
                </div>
                <CreditCard className="w-10 h-10 text-primary opacity-80" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nhập số tiền muốn nạp (VND)</Label>
                <Input 
                  type="number" 
                  placeholder="VD: 100000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleQuickAmount(50000)}>50K</Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAmount(100000)}>100K</Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAmount(200000)}>200K</Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAmount(500000)}>500K</Button>
              </div>

              <Button 
                className="w-full mt-4" 
                onClick={handleTopup}
                disabled={isProcessing || !topupAmount}
              >
                {isProcessing ? 'Đang xử lý...' : 'Nạp Tiền Ngay (Mock)'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" /> Lịch Sử Giao Dịch
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((record: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${record.type === 'TOPUP' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                        {record.type === 'TOPUP' ? <ArrowUpRight className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{record.description || (record.type === 'TOPUP' ? 'Nạp tiền' : 'Thanh toán vé')}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.createdAt ? format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm') : ''}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold ${record.type === 'TOPUP' ? 'text-green-500' : 'text-white'}`}>
                      {record.type === 'TOPUP' ? '+' : '-'}
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có giao dịch thẻ CGV Card.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
