"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Search, ShieldAlert, CreditCard, Trash2, Edit } from 'lucide-react';
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
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold border-l-4 border-primary pl-4 flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" /> Quản lý Khách Hàng
        </h1>
      </div>

      <div className="flex items-center space-x-2 max-w-sm">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Tìm kiếm theo tên, email, sđt..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải dữ liệu...</div>
      ) : (
        <div className="rounded-md border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách Hàng</TableHead>
                <TableHead>Liên Hệ</TableHead>
                <TableHead>Vai Trò (Role)</TableHead>
                <TableHead>Hạng Thẻ</TableHead>
                <TableHead>Tài Sản</TableHead>
                <TableHead className="text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy người dùng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.isU22Verified ? (
                          <span className="bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded">✓ Đã xác minh U22</span>
                        ) : 'Chưa xác minh U22'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{user.email}</div>
                      <div className="text-muted-foreground">{user.phone || 'Chưa cập nhật'}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' : 
                        user.role === 'SCANNER' ? 'bg-yellow-500/20 text-yellow-500' : 
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.membershipTier === 'VVIP' ? 'bg-purple-500/20 text-purple-400' : 
                        user.membershipTier === 'VIP' ? 'bg-orange-500/20 text-orange-400' : 
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.membershipTier}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">Điểm: <span className="text-primary font-bold">{user.points}</span></div>
                      <div className="text-sm">Ví: <span className="text-primary font-bold">{user.cgvCardBalance?.toLocaleString('vi-VN')}đ</span></div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenRoleDialog(user)} title="Đổi quyền">
                        <ShieldAlert className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenMembershipDialog(user)} title="Chỉnh sửa thẻ/điểm">
                        <CreditCard className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(user)} title="Xóa người dùng">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phân quyền người dùng</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitRole} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tên người dùng: <span className="text-primary">{selectedUser?.fullName}</span></Label>
            </div>
            <div className="space-y-2">
              <Label>Vai trò (Role)</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={roleForm} 
                onChange={(e) => setRoleForm(e.target.value)}
              >
                <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                <option value="SCANNER">Nhân viên soát vé (SCANNER)</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
              </select>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">Lưu thay đổi</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Membership Dialog */}
      <Dialog open={isMembershipDialogOpen} onOpenChange={setIsMembershipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quản lý Thẻ & Điểm Thưởng</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitMembership} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tên người dùng: <span className="text-primary">{selectedUser?.fullName}</span></Label>
            </div>
            
            <div className="space-y-2">
              <Label>Hạng thành viên (Membership Tier)</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={membershipForm.tier} 
                onChange={(e) => setMembershipForm({...membershipForm, tier: e.target.value})}
              >
                <option value="MEMBER">MEMBER</option>
                <option value="U22_FANC">U22 / FANC</option>
                <option value="VIP">VIP</option>
                <option value="VVIP">VVIP</option>
              </select>
            </div>

            <div className="space-y-2 flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="isU22"
                className="h-4 w-4 rounded border-input"
                checked={membershipForm.isU22Verified}
                onChange={(e) => setMembershipForm({...membershipForm, isU22Verified: e.target.checked})}
              />
              <Label htmlFor="isU22" className="cursor-pointer font-normal">Đã xác minh Học sinh/Sinh viên (U22)</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Điểm thưởng (Points)</Label>
                <Input 
                  type="number" 
                  min="0"
                  value={membershipForm.points} 
                  onChange={(e) => setMembershipForm({...membershipForm, points: parseInt(e.target.value) || 0})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Số dư CGV Card (VNĐ)</Label>
                <Input 
                  type="number" 
                  min="0"
                  step="1000"
                  value={membershipForm.cgvCardBalance} 
                  onChange={(e) => setMembershipForm({...membershipForm, cgvCardBalance: parseInt(e.target.value) || 0})} 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">Lưu thông tin thẻ</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.fullName || userToDelete?.email}</strong>? Hành động này không thể hoàn tác!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
