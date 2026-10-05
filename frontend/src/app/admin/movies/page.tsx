"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search, Film, Clock, Calendar, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [formData, setFormData] = useState({
    title: '',
    titleOriginal: '',
    director: '',
    cast: '',
    genres: 'Tâm lý, Tình cảm',
    durationMinutes: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    posterUrl: '',
    trailerUrl: '',
    ageRating: 'T18',
    languageType: 'SUB',
    status: 'COMING_SOON',
    description: '',
  });

  const fetchMovies = async () => {
    try {
      const res = await api.get('/movies?limit=100');
      if (res.success) {
        setMovies(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch movies', error);
      toast.error('Lỗi khi tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      titleOriginal: '',
      director: '',
      cast: '',
      genres: 'Tâm lý, Tình cảm',
      durationMinutes: 120,
      releaseDate: new Date().toISOString().split('T')[0],
      posterUrl: '',
      trailerUrl: '',
      ageRating: 'T18',
      languageType: 'SUB',
      status: 'COMING_SOON',
      description: '',
    });
    setSelectedMovie(null);
  };

  const openEditModal = (movie: any) => {
    setSelectedMovie(movie);
    setFormData({
      title: movie.title,
      titleOriginal: movie.titleOriginal || '',
      director: movie.director,
      cast: movie.cast || '',
      genres: movie.genres?.join(', ') || '',
      durationMinutes: movie.durationMinutes || 120,
      releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0],
      posterUrl: movie.posterUrl || '',
      trailerUrl: movie.trailerUrl || '',
      ageRating: movie.ageRating || 'T18',
      languageType: movie.languageType || 'SUB',
      status: movie.status,
      description: movie.description || '',
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (movie: any) => {
    setSelectedMovie(movie);
    setIsDeleteOpen(true);
  };

  const handleAddMovie = async () => {
    try {
      const payload = {
        ...formData,
        genres: formData.genres.split(',').map((g: string) => g.trim()),
        durationMinutes: Number(formData.durationMinutes),
        releaseDate: new Date(formData.releaseDate).toISOString()
      };
      const res = await api.post('/admin/movies', payload);
      if (res.success) {
        toast.success('Thêm phim thành công');
        setIsAddOpen(false);
        resetForm();
        fetchMovies();
      } else {
        toast.error(res.error?.message || res.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      console.error('Failed to add movie', error);
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
    }
  };

  const handleEditMovie = async () => {
    if (!selectedMovie) return;
    try {
      const payload = {
        ...formData,
        genres: formData.genres.split(',').map((g: string) => g.trim()),
        durationMinutes: Number(formData.durationMinutes),
        releaseDate: new Date(formData.releaseDate).toISOString()
      };
      const res = await api.put(`/admin/movies/${selectedMovie.id}`, payload);
      if (res.success) {
        toast.success('Cập nhật phim thành công');
        setIsEditOpen(false);
        resetForm();
        fetchMovies();
      } else {
        toast.error(res.error?.message || res.message || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (error: any) {
      console.error('Failed to update movie', error);
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
    }
  };

  const handleDeleteMovie = async () => {
    if (!selectedMovie) return;
    try {
      const res = await api.delete(`/admin/movies/${selectedMovie.id}`);
      if (res.success) {
        toast.success('Đã xóa phim');
        setIsDeleteOpen(false);
        setSelectedMovie(null);
        fetchMovies();
      } else {
        toast.error(res.error?.message || res.message || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error: any) {
      console.error('Failed to delete movie', error);
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#4a423d] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
              <Film className="w-4 h-4" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#faf8f5] tracking-tight">Quản Lý Phim</h1>
          </div>
          <p className="text-sm text-[#afa49b] mt-1 ml-10">Danh sách phim chiếu rạp, thông tin khởi chiếu và trạng thái phát hành</p>
        </div>
        <Button 
          className="gap-2 bg-[#ff4b72] hover:bg-[#ff6584] text-white rounded-xl shadow-lg shadow-[#ff4b72]/20 font-medium transition-all"
          onClick={() => { resetForm(); setIsAddOpen(true); }}
        >
          <Plus className="h-4 w-4" /> Thêm phim mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#27211f] p-4 rounded-2xl border border-[#4a423d]">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#afa49b]" />
          <Input 
            className="pl-10 bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] placeholder:text-[#afa49b] focus:border-[#ff4b72] rounded-xl h-11" 
            placeholder="Tìm theo tên phim hoặc đạo diễn..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <select 
            className="flex h-11 w-full rounded-xl border border-[#4a423d] bg-[#1f1a18] px-3.5 py-2 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72]"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="NOW_SHOWING">Đang chiếu</option>
            <option value="COMING_SOON">Sắp chiếu</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#27211f] border border-[#4a423d] rounded-2xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#302927] border-b border-[#4a423d] hover:bg-[#302927]">
              <TableHead className="w-[60px] text-center font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">STT</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Tên phim</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Đạo diễn</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Thể loại</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Thời lượng</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Khởi chiếu</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba]">Trạng thái</TableHead>
              <TableHead className="text-right font-mono text-[11px] uppercase tracking-wider text-[#d1c7ba] pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-[#afa49b]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải danh sách phim...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (() => {
              const filtered = movies.filter((movie: any) => {
                const matchSearch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (movie.director || '').toLowerCase().includes(searchTerm.toLowerCase());
                const matchStatus = filterStatus === 'ALL' || movie.status === filterStatus;
                return matchSearch && matchStatus;
              });

              if (filtered.length === 0) {
                return (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-[#afa49b]">Không có phim nào phù hợp</TableCell>
                  </TableRow>
                );
              }

              return filtered.map((movie: any, index: number) => (
                <TableRow key={movie.id} className="border-b border-[#4a423d]/50 hover:bg-[#302927]/40 transition-colors">
                  <TableCell className="font-mono text-xs text-center text-[#afa49b]">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded-lg border border-[#4a423d]" />
                      ) : (
                        <div className="w-10 h-14 bg-[#1f1a18] border border-[#4a423d] rounded-lg flex items-center justify-center text-[#afa49b]">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-[#faf8f5]">{movie.title}</div>
                        {movie.titleOriginal && (
                          <div className="text-xs text-[#afa49b] italic">{movie.titleOriginal}</div>
                        )}
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#1f1a18] text-[#ff8fa3] border border-[#ff4b72]/30 mt-1 inline-block">
                          {movie.ageRating || 'P'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#d1c7ba] text-sm">{movie.director}</TableCell>
                  <TableCell className="text-[#d1c7ba] text-sm max-w-[160px] truncate">{movie.genres?.join(', ') || 'Chưa cập nhật'}</TableCell>
                  <TableCell className="text-[#d1c7ba] text-sm font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#afa49b]" />
                      {movie.durationMinutes} ph
                    </span>
                  </TableCell>
                  <TableCell className="text-[#d1c7ba] text-sm font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#afa49b]" />
                      {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      movie.status === 'NOW_SHOWING' 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-[#ff8fa3] hover:text-[#ff4b72] hover:bg-[#ff4b72]/15 rounded-lg" 
                        onClick={() => openEditModal(movie)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-lg" 
                        onClick={() => openDeleteModal(movie)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </div>

      {/* Add Movie Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#faf8f5]">Thêm phim mới</DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b]">
              Nhập thông tin chi tiết để thêm phim mới vào hệ thống rạp ClGV.
            </DialogDescription>
          </DialogHeader>
          <MovieFormFields formData={formData} setFormData={setFormData} />
          <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t border-[#4a423d]">
            <Button variant="outline" className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl" onClick={() => setIsAddOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-[#ff4b72] hover:bg-[#ff6584] text-white font-medium rounded-xl shadow-lg shadow-[#ff4b72]/20" onClick={handleAddMovie}>
              Lưu phim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Movie Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#faf8f5]">Cập nhật phim</DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b]">
              Thay đổi thông tin cho phim <strong className="text-[#faf8f5]">{selectedMovie?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <MovieFormFields formData={formData} setFormData={setFormData} />
          <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t border-[#4a423d]">
            <Button variant="outline" className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-[#ff4b72] hover:bg-[#ff6584] text-white font-medium rounded-xl shadow-lg shadow-[#ff4b72]/20" onClick={handleEditMovie}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Movie Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#27211f] border border-[#4a423d] text-[#faf8f5] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-rose-400 font-bold text-lg">Xác nhận xóa phim</DialogTitle>
            <DialogDescription className="text-sm text-[#afa49b] mt-2">
              Bạn có chắc chắn muốn xóa phim <strong className="text-[#faf8f5]">{selectedMovie?.title}</strong>? Hành động này sẽ loại bỏ hoàn toàn các liên kết lịch chiếu liên quan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" className="border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl shadow-lg shadow-rose-600/20" onClick={handleDeleteMovie}>
              Xóa phim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Extracted form fields component
function MovieFormFields({ formData, setFormData }: { formData: any, setFormData: any }) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await api.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.success) {
        setFormData((prev: any) => ({ ...prev, posterUrl: res.data.url }));
        toast.success('Tải ảnh lên thành công');
      } else {
        toast.error('Lỗi khi tải ảnh lên');
      }
    } catch (error: any) {
      console.error('Upload failed', error);
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Lỗi hệ thống');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-4 py-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Tên phim</Label>
          <Input 
            className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl"
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            placeholder="VD: Mai" 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Tên gốc</Label>
          <Input 
            className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl"
            value={formData.titleOriginal} 
            onChange={e => setFormData({...formData, titleOriginal: e.target.value})} 
            placeholder="VD: Mai (2024)" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Đạo diễn</Label>
          <Input 
            className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl"
            value={formData.director} 
            onChange={e => setFormData({...formData, director: e.target.value})} 
            placeholder="Trấn Thành" 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Diễn viên</Label>
          <Input 
            className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl"
            value={formData.cast} 
            onChange={e => setFormData({...formData, cast: e.target.value})} 
            placeholder="Phương Anh Đào, Tuấn Trần..." 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Thể loại (cách nhau bởi dấu phẩy)</Label>
          <Input 
            className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl"
            value={formData.genres} 
            onChange={e => setFormData({...formData, genres: e.target.value})} 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Thời lượng (phút)</Label>
          <Input 
            type="number" 
            className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl"
            value={formData.durationMinutes} 
            onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Ngày khởi chiếu</Label>
          <Input 
            type="date" 
            className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl"
            value={formData.releaseDate} 
            onChange={e => setFormData({...formData, releaseDate: e.target.value})} 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Độ tuổi / Phân loại</Label>
          <select 
            className="flex h-10 w-full rounded-xl border border-[#4a423d] bg-[#1f1a18] px-3.5 py-2 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72]"
            value={formData.ageRating} 
            onChange={e => setFormData({...formData, ageRating: e.target.value})}
          >
            <option value="P">P - Phổ biến mọi lứa tuổi</option>
            <option value="K">K - Dưới 13 tuổi có người bảo hộ</option>
            <option value="T13">T13 - Khán giả từ 13 tuổi trở lên</option>
            <option value="T16">T16 - Khán giả từ 16 tuổi trở lên</option>
            <option value="T18">T18 - Khán giả từ 18 tuổi trở lên</option>
            <option value="C">C - Cấm phổ biến</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Ảnh Poster</Label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {formData.posterUrl && (
            <img src={formData.posterUrl} alt="Poster preview" className="w-24 h-36 object-cover rounded-xl border border-[#4a423d] shadow-md" />
          )}
          <div className="flex-1 w-full space-y-2">
            <div className="flex gap-2 items-center">
              <Input 
                type="file" 
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploading}
                className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] file:bg-[#302927] file:text-[#faf8f5] file:border-0 file:rounded-lg file:mr-3 file:py-1 file:px-3 rounded-xl cursor-pointer"
              />
              {uploading && <span className="text-xs text-[#ff4b72] animate-pulse">Đang tải...</span>}
            </div>
            <Input 
              value={formData.posterUrl} 
              onChange={e => setFormData({...formData, posterUrl: e.target.value})} 
              placeholder="Hoặc dán URL ảnh trực tiếp..." 
              className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] text-xs focus:border-[#ff4b72] rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Link Trailer (Youtube)</Label>
        <Input 
          className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl"
          value={formData.trailerUrl} 
          onChange={e => setFormData({...formData, trailerUrl: e.target.value})} 
          placeholder="https://youtube.com/watch?v=..." 
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-[#d1c7ba]">Mô tả nội dung</Label>
        <textarea 
          className="flex min-h-[90px] w-full rounded-xl border border-[#4a423d] bg-[#1f1a18] px-3.5 py-2.5 text-sm text-[#faf8f5] focus:outline-none focus:border-[#ff4b72] placeholder:text-[#afa49b]"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder="Tóm tắt cốt truyện phim..."
        />
      </div>
    </div>
  );
}
