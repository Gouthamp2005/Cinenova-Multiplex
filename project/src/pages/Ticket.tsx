import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader as Loader2, Monitor, Calendar, Clock, CircleCheck as CheckCircle2, Chrome as Home, Clock3, Download, User, CircleUser as UserCircle } from "lucide-react";
import { api } from "../lib/api";
import type { Booking } from "../types";
import { formatINR, formatDate, formatTime } from "../lib/utils";

export default function Ticket() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await api.get<Booking>(`/bookings/${id}`);
        setBooking(data);
      } catch {
        setBooking(null);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  }

  if (!booking) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><p className="text-neutral-400">Ticket not found.</p></div>;
  }

  const seats = booking.booking_seats?.map((bs) => `${bs.seat.row_label}${bs.seat.seat_number}`) || [];
  const snacks = booking.booking_snacks || [];

  return (
    <div className="min-h-screen bg-neutral-950 pt-16 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 mb-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">Booking Confirmed!</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-5 text-center">
            <img src="/images/logos/Copilot_20260709_163634.png" alt="CineNova" className="h-12 w-auto mx-auto mb-2" />
            <p className="text-white/80 text-xs">Premium Movie Experience</p>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-neutral-500 text-xs uppercase tracking-wider">Booking ID</p>
              <p className="text-2xl font-bold text-neutral-900 tracking-wider">{booking.booking_ref}</p>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                <img src={booking.show?.movie?.poster_url || "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg"} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-neutral-900">{booking.show?.movie?.title}</h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                  <Monitor className="w-3.5 h-3.5" /> {booking.show?.screen?.name}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(booking.show?.show_date || "")}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                  <Clock className="w-3.5 h-3.5" /> {formatTime(booking.show?.show_time || "")}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-neutral-500">Seats ({seats.length})</p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 text-xs font-bold flex items-center gap-1"><User className="w-3 h-3" /> Male: {booking.male_count}</span>
                  <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-600 text-xs font-bold flex items-center gap-1"><UserCircle className="w-3 h-3" /> Female: {booking.female_count}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {seats.map((seat) => (
                  <span key={seat} className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-600 text-sm font-bold">{seat}</span>
                ))}
              </div>
            </div>

            {snacks.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-neutral-500 mb-2">Snacks</p>
                <div className="space-y-1">
                  {snacks.map((bs) => (
                    <div key={bs.snack_id} className="flex justify-between text-sm text-neutral-700">
                      <span>{bs.snack?.name} × {bs.quantity}</span>
                      <span>{formatINR(bs.snack?.price ? bs.snack.price * bs.quantity : 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-dashed border-neutral-300">
              <span className="text-neutral-700 font-medium">Total Paid</span>
              <span className="text-2xl font-bold text-neutral-900">{formatINR(booking.total_amount)}</span>
            </div>

            <div className="flex justify-center mt-6">
              <div className="w-32 h-32 bg-neutral-900 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-6 gap-0.5 mb-1">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? "bg-white" : "bg-neutral-700"}`} />
                    ))}
                  </div>
                  <p className="text-white text-[8px] tracking-widest">QR CODE</p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-neutral-400 mt-4">Show this QR code at the cinema entrance</p>
          </div>

          <div className="border-t-2 border-dashed border-neutral-300 px-6 py-3 flex items-center justify-between">
            <div className="text-xs text-neutral-400">Payment: {booking.payment_method}</div>
            <div className="text-xs text-green-600 font-bold">{booking.payment_status}</div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link to="/" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-all">
            <Home className="w-4 h-4" /> Home
          </Link>
          <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-all">
            <Download className="w-4 h-4" /> Download
          </button>
          <Link to="/bookings" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg shadow-rose-500/30">
            <Clock3 className="w-4 h-4" /> My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
