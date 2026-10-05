import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Monitor, Popcorn, Car, Volume2, Armchair, Sparkles, ChevronRight, Clock, Ticket } from 'lucide-react';

async function getCinema(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/cinemas/${id}`, { next: { revalidate: 0 } });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch cinema');
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function CinemaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cinema = await getCinema(id);

  if (!cinema) {
    notFound();
  }

  const facilities = [
    {
      title: 'Màn Chiếu IMAX Laser',
      desc: 'Công nghệ trình chiếu laser thế hệ mới cho độ tương phản sắc nét vượt trội.',
      icon: Monitor,
    },
    {
      title: 'Âm Thanh Dolby Atmos',
      desc: 'Hệ thống loa vòm đa chiều tạo hiệu ứng không gian 360 độ chân thực.',
      icon: Volume2,
    },
    {
      title: 'Ghế VIP & Sweetbox',
      desc: 'Hàng ghế cao cấp bọc da êm ái cùng khoang Sweetbox riêng tư cho cặp đôi.',
      icon: Armchair,
    },
    {
      title: 'Quầy Bắp Nước Cao Cấp',
      desc: 'Thực đơn bắp rang bơ giòn tan, nước ngọt và các combo snack phong phú.',
      icon: Popcorn,
    },
  ];

  return (
    <div className="min-h-screen pb-24 text-[#faf8f5]">
      {/* ─── 1. CINEMA HERO BANNER (Figma Cinema Hero) ─── */}
      <div className="relative w-full h-[360px] md:h-[440px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80"
          alt={cinema.name}
          className="w-full h-full object-cover"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1a18] via-[#1f1a18]/70 to-black/40" />

        <div className="max-w-[1240px] mx-auto px-4 h-full relative z-10 flex flex-col justify-end pb-10 space-y-4">
          {/* Breadcrumb */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-[#d1c7ba] w-fit">
            <Link href="/" className="hover:text-white transition-colors">Trang Chủ</Link>
            <ChevronRight className="w-3 h-3 text-[#afa49b]" />
            <Link href="/cinemas" className="hover:text-white transition-colors">Cụm Rạp</Link>
            <ChevronRight className="w-3 h-3 text-[#afa49b]" />
            <span className="text-[#ff8fa3] font-medium truncate max-w-[200px]">{cinema.name}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white">
            {cinema.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#d1c7ba]">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ff6584]" />
              <span>{cinema.address}</span>
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#ff6584]" />
              <span>{cinema.phone || cinema.hotline || '1900 6017'}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 space-y-16 pt-12">
        {/* ─── 2. FACILITIES (Figma Facility Cards) ─── */}
        <section className="space-y-6">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff8fa3]">
              TIỆN ÍCH & TRANG THIẾT BỊ
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Cơ Sở Vật Chất Chuẩn Quốc Tế
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {facilities.map((fac) => {
              const Icon = fac.icon;
              return (
                <div
                  key={fac.title}
                  className="p-6 rounded-2xl bg-[#27211f] border border-[#4a423d] space-y-3 hover:border-[#ff4b72]/40 transition-colors shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff6584]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-sans font-bold text-base text-white">
                    {fac.title}
                  </h3>
                  <p className="text-xs text-[#afa49b] leading-relaxed">
                    {fac.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 3. SCREENING HALLS (Figma Halls) ─── */}
        <section className="space-y-6">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff8fa3]">
              HỆ THỐNG PHÒNG CHIẾU
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Danh Sách Phòng Chiếu Tại {cinema.name}
            </h2>
          </div>

          {cinema.halls && cinema.halls.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {cinema.halls.map((hall: any) => (
                <div
                  key={hall.id}
                  className="p-6 rounded-2xl bg-[#27211f] border border-[#4a423d] text-center space-y-3 hover:border-[#ff4b72]/40 transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#ff8fa3]">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg text-white">
                      {hall.name}
                    </h3>
                    <p className="text-xs text-[#afa49b] mt-1">
                      {hall.seatCount || 120} ghế ngồi tiêu chuẩn
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#ff4b72]/20 border border-[#ff4b72]/40 text-[#ff8fa3]">
                    {hall.screenType || '2D Digital'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#27211f] border border-[#4a423d] text-center text-[#afa49b]">
              Cụm rạp đang trong quá trình nâng cấp hệ thống phòng chiếu.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
