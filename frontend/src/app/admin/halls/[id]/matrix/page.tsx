"use client";

import { use, useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, ChevronLeft, LayoutGrid, MonitorPlay, Sparkles } from 'lucide-react';
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
      case 'STANDARD': 
        return 'bg-[#302927] border border-[#4a423d] text-[#faf8f5] hover:border-[#ff4b72] hover:bg-[#3d3432]';
      case 'VIP': 
        return 'bg-[#ff4b72] text-white shadow-md shadow-[#ff4b72]/30 hover:bg-[#ff6584]';
      case 'COUPLE': 
        return 'bg-[#ff8fa3] text-[#1f1a18] font-bold shadow-md shadow-[#ff8fa3]/30 hover:bg-[#ffb3c1]';
      case 'EMPTY': 
        return 'bg-transparent border border-dashed border-[#4a423d] text-transparent hover:border-[#ff4b72]/50';
      default: 
        return 'bg-[#302927] text-[#afa49b]';
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#afa49b]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
          <span>Đang tải cấu hình sơ đồ ghế...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#27211f] p-5 rounded-2xl border border-[#4a423d] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-[#faf8f5]">Cấu Hình Sơ Đồ Ghế</h1>
          </div>
          <p className="text-sm text-[#afa49b] mt-1 ml-10">
            {hallData?.cinemaName} - <span className="font-bold text-[#faf8f5]">{hallData?.name}</span> ({hallData?.screenType})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/cinemas">
            <Button variant="outline" className="gap-2 border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl">
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </Button>
          </Link>
          <Button onClick={saveMatrix} className="gap-2 bg-[#ff4b72] hover:bg-[#ff6584] text-white rounded-xl shadow-lg shadow-[#ff4b72]/20 font-medium">
            <Save className="w-4 h-4" /> Lưu cấu hình
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Toolbar panel */}
        <div className="bg-[#27211f] p-5 rounded-2xl border border-[#4a423d] space-y-6 shadow-xl h-fit">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#d1c7ba] pb-2 border-b border-[#4a423d]">
              Kích thước ma trận
            </h3>
            <div className="space-y-3 mt-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#afa49b]">Số hàng ngang (Rows)</Label>
                <Input 
                  type="number" 
                  value={rows} 
                  onChange={e => setRows(Number(e.target.value))} 
                  min={1} 
                  max={26} 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#afa49b]">Số cột dọc (Cols)</Label>
                <Input 
                  type="number" 
                  value={cols} 
                  onChange={e => setCols(Number(e.target.value))} 
                  min={1} 
                  max={50} 
                  className="bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] focus:border-[#ff4b72] rounded-xl h-10"
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:text-white rounded-xl text-xs mt-2" 
                onClick={handleResize}
              >
                Tạo lại lưới
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#4a423d]">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#d1c7ba] mb-4">Chú thích loại ghế</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-t-md rounded-b-sm bg-[#302927] border border-[#4a423d]" /> 
                <span className="text-xs text-[#faf8f5]">Ghế Thường (STANDARD)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-t-md rounded-b-sm bg-[#ff4b72] shadow-sm shadow-[#ff4b72]/30" /> 
                <span className="text-xs text-[#faf8f5]">Ghế VIP</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-t-md rounded-b-sm bg-[#ff8fa3]" /> 
                <span className="text-xs text-[#faf8f5]">Ghế Đôi (COUPLE)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-t-md rounded-b-sm border border-dashed border-[#4a423d]" /> 
                <span className="text-xs text-[#afa49b]">Lối đi / Trống (EMPTY)</span>
              </div>
            </div>
            <p className="text-[11px] text-[#afa49b] mt-5 leading-relaxed bg-[#1f1a18] p-3 rounded-xl border border-[#4a423d]">
              * Click vào từng ghế trên sơ đồ để chuyển đổi: Thường &rarr; VIP &rarr; Đôi &rarr; Trống.
            </p>
          </div>
        </div>

        {/* Matrix Canvas */}
        <div className="lg:col-span-3 bg-[#27211f] p-6 lg:p-8 rounded-2xl border border-[#4a423d] shadow-xl overflow-x-auto">
          {/* Screen */}
          <div className="w-full max-w-2xl mx-auto mb-12">
            <div className="h-9 bg-gradient-to-b from-[#ff4b72]/30 via-[#ff4b72]/10 to-transparent border-t-2 border-[#ff4b72] rounded-t-[50%] flex items-center justify-center shadow-[0_0_20px_rgba(255,75,114,0.3)]">
              <span className="text-[#ff8fa3] text-xs font-mono font-bold tracking-[0.5em] uppercase">Màn Hình Chiếu Phim</span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="flex flex-col gap-2.5 min-w-max mx-auto items-center py-4">
            {grid.map((rowArr, rIndex) => (
              <div key={rIndex} className="flex gap-2.5 items-center">
                <div className="w-6 text-center text-xs font-mono font-bold text-[#afa49b]">
                  {String.fromCharCode(65 + rIndex)}
                </div>
                {rowArr.map((cell, cIndex) => (
                  <button
                    key={cIndex}
                    onClick={() => toggleSeatType(rIndex, cIndex)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-t-lg rounded-b-sm flex items-center justify-center text-[10px] font-mono font-bold transition-all ${getSeatColor(cell.type)}`}
                    title={`Ghế ${cell.id} - ${cell.type}`}
                  >
                    {cell.type !== 'EMPTY' ? cIndex + 1 : ''}
                  </button>
                ))}
                <div className="w-6 text-center text-xs font-mono font-bold text-[#afa49b]">
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
