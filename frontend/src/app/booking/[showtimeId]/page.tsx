import { redirect } from 'next/navigation';

export default async function BookingShowtimePage({
  params,
}: {
  params: Promise<{ showtimeId: string }>;
}) {
  const { showtimeId } = await params;
  redirect(`/booking/seats?showtimeId=${showtimeId}`);
}
