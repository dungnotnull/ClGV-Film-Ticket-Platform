'use client';

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] bg-[#1f1a18] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-[#27211f] border border-[#4a423d] rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* State Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff4b72]/10 border border-[#ff4b72]/30 text-[#ff8fa3] text-xs font-bold tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-[#ff4b72] animate-ping" />
          <span>ĐANG TẢI DỮ LIỆU</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-serif text-white font-bold tracking-wide">
            Đang chuẩn bị suất chiếu…
          </h2>
          <p className="text-xs text-[#afa49b]">
            Đang kết nối hệ thống rạp ClGV và đồng bộ dữ liệu thời gian thực
          </p>
        </div>

        {/* Skeleton Shimmers (Figma 3274:14911) */}
        <div className="space-y-3 pt-2">
          <div className="h-14 rounded-2xl bg-[#302927] border border-[#4a423d]/60 animate-pulse flex items-center px-4 gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4a423d]" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-3/4 rounded bg-[#4a423d]" />
              <div className="h-2 w-1/2 rounded bg-[#4a423d]/60" />
            </div>
          </div>

          <div className="h-14 rounded-2xl bg-[#302927] border border-[#4a423d]/60 animate-pulse flex items-center px-4 gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4a423d]" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-2/3 rounded bg-[#4a423d]" />
              <div className="h-2 w-1/3 rounded bg-[#4a423d]/60" />
            </div>
          </div>
        </div>

        {/* Spinner */}
        <div className="flex justify-center pt-2">
          <div className="w-7 h-7 border-3 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
        </div>

      </div>
    </div>
  );
}
