import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader as Loader2, Monitor, Calendar, Clock, ChevronRight, Ticket as TicketIcon } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Booking } from "../types";
import { formatINR, formatDate, formatTime } from "../lib/utils";

export default function Bookings() {
  const { session, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    (async () => {
      try {
        const data = await api.get<Booking[]>("/bookings/mine");
        if (data) setBookings(data);
      } catch {
        // ignore, list stays empty
      }
      setLoading(false);
    })();
  }, [session]);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  }

  if (!session) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><p className="text-neutral-400">Please sign in.</p></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Bookings</h1>
        <p className="text-neutral-400 text-sm mb-8">View your past and upcoming movie bookings</p>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <TicketIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 mb-2">No bookings yet.</p>
            <Link to="/movies" className="text-rose-400 hover:text-rose-300 text-sm">Browse Movies</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const seats = booking.booking_seats?.map((bs) => `${bs.seat.row_label}${bs.seat.seat_number}`) || [];
              return (
                <Link key={booking.id} to={`/ticket/${booking.id}`} className="group flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-rose-500/30 transition-all">
                  <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={booking.show?.movie?.poster_url || "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg group-hover:text-rose-400 transition-colors">{booking.show?.movie?.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400 mt-1">
                      <span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5" /> {booking.show?.screen?.name}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(booking.show?.show_date || "")}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatTime(booking.show?.show_time || "")}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs text-neutral-500">Seats:</span>
                      {seats.map((seat) => <span key={seat} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-xs font-bold">{seat}</span>)}
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">M: {booking.male_count}</span>
                      <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 text-xs font-bold">F: {booking.female_count}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-neutral-500">Booking ID</p>
                    <p className="text-sm font-bold text-white tracking-wider">{booking.booking_ref}</p>
                    <p className="text-sm text-rose-400 font-bold mt-1">{formatINR(booking.total_amount)}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-medium">{booking.payment_status}</span>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold group-hover:bg-rose-500 group-hover:text-white transition-all">
                        View Ticket <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
