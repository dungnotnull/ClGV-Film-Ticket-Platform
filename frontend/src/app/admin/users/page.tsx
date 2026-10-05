"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Search, ShieldAlert, CreditCard, Trash2, CheckCircle2, Coins, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isMembershipDialogOpen, setIsMembershipDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  
  // Selected user
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleForm, setRoleForm] = useState('');
  const [membershipForm, setMembershipForm] = useState({
    tier: '',
    points: 0,
    cgvCardBalance: 0,
    isU22Verified: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data?.users || res.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoleDialog = (user: any) => {
    setSelectedUser(user);
    setRoleForm(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleOpenMembershipDialog = (user: any) => {
    setSelectedUser(user);
    setMembershipForm({
      tier: user.membershipTier || 'MEMBER',
      points: user.points || 0,
      cgvCardBalance: user.cgvCardBalance || 0,
      isU22Verified: user.isU22Verified || false
    });
    setIsMembershipDialogOpen(true);
  };

  const handleSubmitRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/role`, { role: roleForm });
      toast.success('Cập nhật quyền thành công');
      setIsRoleDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
    }
  };

  const handleSubmitMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/membership`, {
        membershipTier: membershipForm.tier,
        points: Number(membershipForm.points),
        cgvCardBalance: Number(membershipForm.cgvCardBalance),
        isU22Verified: membershipForm.isU22Verified
      });
      toast.success('Cập nhật thông tin thẻ/điểm thành công');
      setIsMembershipDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
    }
  };

  const handleDelete = (user: any) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      toast.success('Xóa người dùng thành công');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#4a423d] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#faf8f5] tracking-tight">Quản Lý Khách Hàng & Users</h1>
          </div>
          <p className="text-sm text-[#afa49b] mt-1 ml-10">Tài khoản thành viên, phân quyền hệ thống và quản lý số dư CGV Card</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2 max-w-md bg-[#27211f] p-2 rounded-2xl border border-[#4a423d]">
        <Search className="w-4 h-4 text-[#afa49b] ml-2" />
        <Input 
          placeholder="Tìm kiếm theo tên, email, sđt..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-0 text-[#faf8f5] placeholder:text-[#afa49b] focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#afa49b]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
            <span>Đang tải danh sách người dùng...</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#4a423d] bg-[#27211f] overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#302927] border-b border-[#4a423d] hover:bg-[#302927]">
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba] pl-6">Khách Hàng</TableHead>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Liên Hệ</TableHead>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Vai Trò (Role)</TableHead>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Hạng Thẻ</TableHead>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Tài Sản & Ví</TableHead>
                <TableHead className="text-right font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba] pr-6">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#afa49b]">
                    Không tìm thấy người dùng nào phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-[#4a423d]/50 hover:bg-[#302927]/40 transition-colors">
                    <TableCell className="pl-6">
                      <div className="font-bold text-[#faf8f5]">{user.fullName || 'Khách hàng'}</div>
                      <div className="text-xs text-[#afa49b] mt-0.5">
                        {user.isU22Verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Đã xác minh U22
                          </span>
                        ) : (
                          <span className="text-[#afa49b]">Chưa xác minh U22</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#faf8f5]">{user.email}</div>
                      <div className="text-xs text-[#afa49b] font-mono mt-0.5">{user.phone || 'Chưa cập nhật SĐT'}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        user.role === 'ADMIN' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 
                        user.role === 'SCANNER' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 
                        'bg-[#1f1a18] text-[#d1c7ba] border border-[#4a423d]'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                        user.membershipTier === 'VVIP' ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 
                        user.membershipTier === 'VIP' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 
                        user.membershipTier === 'U22_FANC' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' :
                        'bg-[#1f1a18] text-[#d1c7ba] border border-[#4a423d]'
                      }`}>
                        {user.membershipTier || 'MEMBER'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs flex items-center gap-1.5 text-[#afa49b]">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        Điểm: <span className="text-[#faf8f5] font-bold font-mono">{user.points || 0}</span>
                      </div>
                      <div className="text-xs flex items-center gap-1.5 text-[#afa49b] mt-1">
                        <Wallet className="w-3.5 h-3.5 text-[#ff4b72]" />
                        Ví: <span className="text-[#ff8fa3] font-bold font-mono">{(user.cgvCardBalance || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenRoleDialog(user)} 
                          title="Đổi quyền"
                          className="h-8 w-8 text-[#d1c7ba] hover:text-[#ff8fa3] hover:bg-[#ff4b72]/15 rounded-lg"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenMembershipDialog(user)} 
                          title="Chỉnh sửa thẻ/điểm"
                          className="h-8 w-8 text-[#d1c7ba] hover:text-[#ff8fa3] hover:bg-[#ff4b72]/15 rounded-lg"
                        >
                          <CreditCard className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(user)} 
                          title="Xóa người dùng"
                          className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#faf8f5]">Phân quyền người dùng</DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b]">
              Gán vai trò quản trị hoặc nhân viên soát vé cho tài khoản.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRole} className="space-y-4 mt-3">
            <div className="bg-[#1f1a18] p-3 rounded-xl border border-[#4a423d]">
              <div className="text-xs text-[#afa49b]">Người dùng</div>
              <div className="font-bold text-[#faf8f5] text-sm mt-0.5">{selectedUser?.fullName || selectedUser?.email}</div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Vai trò (Role)</Label>
              <select 
                className="flex h-11 w-full rounded-xl border border-[#4a423d] bg-[#1f1a18] px-3.5 py-2 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72]"
                value={roleForm} 
                onChange={(e) => setRoleForm(e.target.value)}
              >
                <option value="CUSTOMER">Khách hàng thông thường (CUSTOMER)</option>
                <option value="SCANNER">Nhân viên soát vé rạp (SCANNER)</option>
                <option value="ADMIN">Quản trị viên toàn hệ thống (ADMIN)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[#4a423d]">
              <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)} className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl">
                Hủy
              </Button>
              <Button type="submit" className="bg-[#ff4b72] hover:bg-[#ff6584] text-white font-medium rounded-xl shadow-lg shadow-[#ff4b72]/20">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Membership Dialog */}
      <Dialog open={isMembershipDialogOpen} onOpenChange={setIsMembershipDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#faf8f5]">Quản lý Thẻ & Điểm Thưởng</DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b]">
              Cập nhật hạng thành viên, số dư ví CGV Card và điểm thưởng.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitMembership} className="space-y-4 mt-3">
            <div className="bg-[#1f1a18] p-3 rounded-xl border border-[#4a423d]">
              <div className="text-xs text-[#afa49b]">Khách hàng</div>
              <div className="font-bold text-[#faf8f5] text-sm mt-0.5">{selectedUser?.fullName} ({selectedUser?.email})</div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Hạng thành viên (Membership Tier)</Label>
              <select 
                className="flex h-11 w-full rounded-xl border border-[#4a423d] bg-[#1f1a18] px-3.5 py-2 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72]"
                value={membershipForm.tier} 
                onChange={(e) => setMembershipForm({...membershipForm, tier: e.target.value})}
              >
                <option value="MEMBER">MEMBER (Cơ bản)</option>
                <option value="U22_FANC">U22 / FANC (Học sinh/Sinh viên)</option>
                <option value="VIP">VIP</option>
                <option value="VVIP">VVIP</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 bg-[#1f1a18] p-3 rounded-xl border border-[#4a423d]">
              <input 
                type="checkbox" 
                id="isU22"
                className="h-4 w-4 rounded accent-[#ff4b72]"
                checked={membershipForm.isU22Verified}
                onChange={(e) => setMembershipForm({...membershipForm, isU22Verified: e.target.checked})}
              />
              <Label htmlFor="isU22" className="cursor-pointer text-xs font-medium text-[#faf8f5]">
                Đã xác minh thẻ Học sinh / Sinh viên (U22)
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Điểm thưởng (Points)</Label>
                <Input 
                  type="number" 
                  min="0"
                  value={membershipForm.points} 
                  onChange={(e) => setMembershipForm({...membershipForm, points: parseInt(e.target.value) || 0})} 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Số dư CGV Card (VNĐ)</Label>
                <Input 
                  type="number" 
                  min="0"
                  step="1000"
                  value={membershipForm.cgvCardBalance} 
                  onChange={(e) => setMembershipForm({...membershipForm, cgvCardBalance: parseInt(e.target.value) || 0})} 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-11"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#4a423d]">
              <Button type="button" variant="outline" onClick={() => setIsMembershipDialogOpen(false)} className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl">
                Hủy
              </Button>
              <Button type="submit" className="bg-[#ff4b72] hover:bg-[#ff6584] text-white font-medium rounded-xl shadow-lg shadow-[#ff4b72]/20">
                Lưu thông tin thẻ
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-rose-400 font-bold text-lg">Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b] mt-2">
              Bạn có chắc chắn muốn xóa người dùng <strong className="text-[#faf8f5]">{userToDelete?.fullName || userToDelete?.email}</strong>? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl">
              Hủy
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl shadow-lg shadow-rose-600/20" onClick={confirmDelete}>
              Xóa tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
