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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold border-l-4 border-primary pl-4">Quản Lý Phim</h1>
        <Button className="gap-2" onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="h-4 w-4" /> Thêm phim mới
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border border-border/50">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            className="pl-9" 
            placeholder="Tìm theo tên phim hoặc đạo diễn..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-48">
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="NOW_SHOWING">Đang chiếu</option>
            <option value="COMING_SOON">Sắp chiếu</option>
          </select>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-lg overflow-hidden shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[60px]">STT</TableHead>
              <TableHead>Tên phim</TableHead>
              <TableHead>Đạo diễn</TableHead>
              <TableHead>Thể loại</TableHead>
              <TableHead>Thời lượng</TableHead>
              <TableHead>Khởi chiếu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : (() => {
              const filtered = movies.filter((movie: any) => {
                const matchSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (movie.director || '').toLowerCase().includes(searchTerm.toLowerCase());
                const matchStatus = filterStatus === 'ALL' || movie.status === filterStatus;
                return matchSearch && matchStatus;
              });

              if (filtered.length === 0) {
                return (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Không có phim nào phù hợp</TableCell>
                  </TableRow>
                );
              }

              return filtered.map((movie: any, index: number) => (
                <TableRow key={movie.id}>
                  <TableCell className="font-medium text-xs text-center">{index + 1}</TableCell>
                  <TableCell className="font-bold">{movie.title}</TableCell>
                  <TableCell>{movie.director}</TableCell>
                  <TableCell>{movie.genres?.join(', ')}</TableCell>
                  <TableCell>{movie.durationMinutes} phút</TableCell>
                  <TableCell>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      movie.status === 'NOW_SHOWING' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => openEditModal(movie)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteModal(movie)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </div>

      {/* Add Movie Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm phim mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết để thêm phim mới vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          <MovieFormFields formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
            <Button onClick={handleAddMovie}>Lưu phim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Movie Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cập nhật phim</DialogTitle>
            <DialogDescription>
              Thay đổi thông tin cho phim {selectedMovie?.title}.
            </DialogDescription>
          </DialogHeader>
          <MovieFormFields formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button onClick={handleEditMovie}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Movie Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Xác nhận xóa phim</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phim <strong>{selectedMovie?.title}</strong>? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteMovie}>Xóa phim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Extracted form fields component to avoid duplication
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
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tên phim</Label>
          <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="VD: Mai" />
        </div>
        <div className="space-y-2">
          <Label>Tên gốc</Label>
          <Input value={formData.titleOriginal} onChange={e => setFormData({...formData, titleOriginal: e.target.value})} placeholder="VD: Mai (2024)" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Đạo diễn</Label>
          <Input value={formData.director} onChange={e => setFormData({...formData, director: e.target.value})} placeholder="Trấn Thành" />
        </div>
        <div className="space-y-2">
          <Label>Diễn viên</Label>
          <Input value={formData.cast} onChange={e => setFormData({...formData, cast: e.target.value})} placeholder="Phương Anh Đào..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Thể loại (cách nhau bởi dấu phẩy)</Label>
          <Input value={formData.genres} onChange={e => setFormData({...formData, genres: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Thời lượng (phút)</Label>
          <Input type="number" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ngày khởi chiếu</Label>
          <Input type="date" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Trạng thái (Tự động)</Label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-muted-foreground ring-offset-background cursor-not-allowed"
            value={formData.status} 
            disabled
          >
            <option value="NOW_SHOWING">Đang chiếu</option>
            <option value="COMING_SOON">Sắp chiếu</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Ảnh Poster</Label>
        <div className="flex flex-col gap-3">
          {formData.posterUrl && (
            <img src={formData.posterUrl} alt="Poster preview" className="w-32 h-48 object-cover rounded-md border border-border" />
          )}
          <div className="flex gap-2 items-center">
            <Input 
              type="file" 
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              disabled={uploading}
              className="flex-1 cursor-pointer"
            />
            {uploading && <span className="text-sm text-muted-foreground animate-pulse">Đang tải...</span>}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Link Trailer (Youtube)</Label>
        <Input value={formData.trailerUrl} onChange={e => setFormData({...formData, trailerUrl: e.target.value})} placeholder="https://youtube.com/..." />
      </div>
      <div className="space-y-2">
        <Label>Mô tả nội dung</Label>
        <textarea 
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder="Nội dung phim..."
        />
      </div>
    </div>
  );
}
