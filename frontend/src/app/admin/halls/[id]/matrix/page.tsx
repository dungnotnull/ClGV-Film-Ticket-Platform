"use client";

import { use, useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, ChevronLeft, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function HallMatrixBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: hallId } = use(params);
  const [hallData, setHallData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(12);
  const [grid, setGrid] = useState<any[][]>([]);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await api.get(`/halls/${hallId}/matrix`);
        if (res.success && res.data) {
          setHallData(res.data);
          const matrix = res.data.matrix || {};
          const r = matrix.dimensions?.rows || 10;
          const c = matrix.dimensions?.cols || 12;
          setRows(r);
          setCols(c);
          
          if (matrix.grid && matrix.grid.length > 0) {
            setGrid(matrix.grid);
          } else {
            generateGrid(r, c);
          }
        }
      } catch (error) {
        console.error('Failed to fetch matrix', error);
        toast.error('Lỗi khi tải sơ đồ');
      } finally {
        setLoading(false);
      }
    };
    fetchMatrix();
  }, [hallId]);

  const generateGrid = (r: number, c: number) => {
    const newGrid: any[][] = [];
    for (let i = 0; i < r; i++) {
      const rowArr = [];
      const rowChar = String.fromCharCode(65 + i); // A, B, C...
      for (let j = 0; j < c; j++) {
        // Default standard seat, leave some aisle manually later
        rowArr.push({
          id: `${rowChar}${j + 1}`,
          type: 'STANDARD',
          status: 'AVAILABLE'
        });
      }
      newGrid.push(rowArr);
    }
    setGrid(newGrid);
  };

  const handleResize = () => {
    generateGrid(rows, cols);
    toast.success('Đã tạo lưới sơ đồ mới');
  };

  const toggleSeatType = (rIndex: number, cIndex: number) => {
    const newGrid = [...grid];
    const cell = newGrid[rIndex][cIndex];
    
    // Cycle types: STANDARD -> VIP -> COUPLE -> EMPTY -> STANDARD
    let nextType = 'STANDARD';
    if (cell.type === 'STANDARD') nextType = 'VIP';
    else if (cell.type === 'VIP') nextType = 'COUPLE';
    else if (cell.type === 'COUPLE') nextType = 'EMPTY';

    cell.type = nextType;
    setGrid(newGrid);
  };

  const saveMatrix = async () => {
    try {
      const payload = {
        roomMatrix: {
          dimensions: { rows, cols },
          aisles: { vertical: [], horizontal: [] },
          grid: grid
        }
      };
      
      const res = await api.put(`/halls/${hallId}/matrix`, payload);
      if (res.success) {
        toast.success('Lưu cấu hình sơ đồ thành công');
      }
    } catch (error) {
      console.error('Save failed', error);
      toast.error('Có lỗi xảy ra khi lưu sơ đồ');
    }
  };

  const getSeatColor = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'bg-blue-500/80 hover:bg-blue-400';
      case 'VIP': return 'bg-red-500/80 hover:bg-red-400';
      case 'COUPLE': return 'bg-pink-500/80 hover:bg-pink-400';
      case 'EMPTY': return 'bg-transparent border border-dashed border-border hover:bg-muted';
      default: return 'bg-gray-500 hover:bg-gray-400';
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải cấu hình...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-md">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="text-primary w-6 h-6" />
            Cấu hình sơ đồ ghế
          </h1>
          <p className="text-muted-foreground mt-1">
            {hallData?.cinemaName} - <span className="font-bold text-white">{hallData?.name}</span> ({hallData?.screenType})
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/cinemas">
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </Button>
          </Link>
          <Button onClick={saveMatrix} className="gap-2">
            <Save className="w-4 h-4" /> Lưu cấu hình
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Toolbar sidebar */}
        <div className="bg-card p-6 rounded-lg border border-border space-y-6 shadow-md h-fit">
          <h3 className="font-bold text-lg border-b border-border pb-2">Kích thước ma trận</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Số hàng ngang (Rows)</Label>
              <Input type="number" value={rows} onChange={e => setRows(Number(e.target.value))} min={1} max={26} />
            </div>
            <div className="space-y-2">
              <Label>Số cột dọc (Cols)</Label>
              <Input type="number" value={cols} onChange={e => setCols(Number(e.target.value))} min={1} max={50} />
            </div>
            <Button variant="secondary" className="w-full" onClick={handleResize}>Tạo lại lưới</Button>
          </div>

          <div className="pt-6 mt-6 border-t border-border">
            <h3 className="font-bold text-lg mb-4">Chú thích</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-blue-500/80"></div> <span className="text-sm">Ghế Thường (STANDARD)</span></div>
              <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-red-500/80"></div> <span className="text-sm">Ghế VIP</span></div>
              <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-pink-500/80"></div> <span className="text-sm">Ghế Đôi (COUPLE)</span></div>
              <div className="flex items-center gap-3"><div className="w-6 h-6 rounded border border-dashed border-border"></div> <span className="text-sm">Lối đi / Trống (EMPTY)</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              * Click vào từng ô trên sơ đồ để thay đổi loại ghế.
            </p>
          </div>
        </div>

        {/* Matrix Canvas */}
        <div className="md:col-span-3 bg-card p-6 rounded-lg border border-border shadow-md overflow-x-auto">
          
          <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="h-8 bg-gradient-to-b from-primary/30 to-transparent border-t-4 border-primary rounded-t-[50%] flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <span className="text-muted-foreground text-sm font-bold tracking-[0.5em] uppercase">Màn Hình</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-max mx-auto items-center">
            {grid.map((rowArr, rIndex) => (
              <div key={rIndex} className="flex gap-2 items-center">
                <div className="w-6 text-center text-sm font-bold text-muted-foreground">
                  {String.fromCharCode(65 + rIndex)}
                </div>
                {rowArr.map((cell, cIndex) => (
                  <button
                    key={cIndex}
                    onClick={() => toggleSeatType(rIndex, cIndex)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-t-lg rounded-b-sm flex items-center justify-center text-[10px] md:text-xs font-bold transition-all ${getSeatColor(cell.type)}`}
                    title={`Ghế ${cell.id} - ${cell.type}`}
                  >
                    {cell.type !== 'EMPTY' ? cIndex + 1 : ''}
                  </button>
                ))}
                <div className="w-6 text-center text-sm font-bold text-muted-foreground">
                  {String.fromCharCode(65 + rIndex)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
