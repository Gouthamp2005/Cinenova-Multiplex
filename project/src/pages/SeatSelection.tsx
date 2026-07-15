import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowRight, Loader as Loader2, User, CircleUser as UserCircle, Armchair, X } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import type { Show, Seat, Id } from "../types";
import { formatINR, formatTime, formatDate } from "../lib/utils";

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const { setSelectedShow, cartSeats, toggleCartSeat, removeCartSeat, seatsTotal } = useBooking();
  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<Id[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showId) return;
    (async () => {
      try {
        const showData = await api.get<Show>(`/shows/${showId}`);
        setShow(showData);
        setSelectedShow(showData);

        const seatsData = await api.get<Seat[]>(`/seats?screenId=${showData.screen_id}`);
        if (seatsData) setSeats(seatsData);

        const bookedIds = await api.get<Id[]>(`/shows/${showId}/booked-seats`);
        if (bookedIds) setBookedSeatIds(bookedIds);
      } catch {
        setShow(null);
      }
      setLoading(false);
    })();
  }, [showId]);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  }

  if (!session) {
    navigate("/login");
    return null;
  }

  if (!show) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><p className="text-neutral-400">Show not found.</p></div>;
  }

  const rows = Array.from(new Set(seats.map((s) => s.row_label)));
  const getPrice = (seat: Seat) => {
    if (seat.seat_type === "recliner") return show.price_recliner;
    if (seat.seat_type === "premium") return show.price_premium;
    return show.price_regular;
  };

  const isSeatInCart = (seatId: string) => cartSeats.some((cs) => cs.seat.id === seatId);
  const isSeatBooked = (seatId: string) => bookedSeatIds.includes(seatId);
  const maleCount = cartSeats.filter((cs) => cs.ticketType === "male").length;
  const femaleCount = cartSeats.filter((cs) => cs.ticketType === "female").length;

  return (
    <div className="min-h-screen bg-neutral-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{show.movie?.title}</h1>
          <p className="text-neutral-400 text-sm mt-1">{show.screen?.name} • {formatDate(show.show_date)} • {formatTime(show.show_time)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6">
              <div className="text-center mb-6">
                <div className="inline-block px-12 py-2 rounded-t-xl bg-gradient-to-b from-neutral-700 to-neutral-800 mb-2">
                  <p className="text-white text-sm font-bold">SCREEN THIS WAY</p>
                </div>
              </div>

              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="w-6 text-center text-neutral-500 text-sm font-bold">{row}</span>
                    <div className="flex gap-1.5 flex-1 justify-center">
                      {seats.filter((s) => s.row_label === row).map((seat) => {
                        const inCart = isSeatInCart(seat.id);
                        const booked = isSeatBooked(seat.id);
                        const color = booked
                          ? "bg-neutral-700 text-neutral-600 cursor-not-allowed"
                          : inCart
                          ? "bg-rose-500 text-white border-rose-400"
                          : seat.seat_type === "recliner"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                          : seat.seat_type === "premium"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                          : "bg-neutral-800 text-neutral-400 border-white/10 hover:bg-neutral-700";
                        return (
                          <button
                            key={seat.id}
                            disabled={booked}
                            onClick={() => toggleCartSeat(seat, getPrice(seat), "male")}
                            className={`w-7 h-7 rounded-md border text-xs font-bold transition-all ${color}`}
                          >
                            {seat.seat_number}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-6 text-center text-neutral-500 text-sm font-bold">{row}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-neutral-800 border border-white/10" /><span className="text-xs text-neutral-400">Regular</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-500/30" /><span className="text-xs text-neutral-400">Premium</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/30" /><span className="text-xs text-neutral-400">Recliner</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-rose-500" /><span className="text-xs text-neutral-400">Selected</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-neutral-700" /><span className="text-xs text-neutral-400">Booked</span></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">Your Seats</h2>

              {cartSeats.length === 0 ? (
                <div className="text-center py-8">
                  <Armchair className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
                  <p className="text-neutral-500 text-sm">No seats selected yet.</p>
                  <p className="text-neutral-600 text-xs mt-1">Tap on the seat map to choose.</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white font-medium">Male: {maleCount}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                      <UserCircle className="w-4 h-4 text-pink-400" />
                      <span className="text-sm text-white font-medium">Female: {femaleCount}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {cartSeats.map((cs) => (
                      <div key={cs.seat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-800/50">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">{cs.seat.row_label}{cs.seat.seat_number}</span>
                          <span className="text-xs text-neutral-500 capitalize">{cs.seat.seat_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newType = cs.ticketType === "male" ? "female" : "male";
                              removeCartSeat(cs.seat.id);
                              toggleCartSeat(cs.seat, cs.price, newType);
                            }}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${cs.ticketType === "male" ? "bg-blue-500/20 text-blue-400" : "bg-pink-500/20 text-pink-400"}`}
                          >
                            {cs.ticketType === "male" ? <User className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
                          </button>
                          <span className="text-rose-400 text-sm font-bold">{formatINR(cs.price)}</span>
                          <button onClick={() => removeCartSeat(cs.seat.id)} className="text-neutral-500 hover:text-rose-400">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-sm text-neutral-400 mb-2">
                    <span>Subtotal ({cartSeats.length} seats)</span>
                    <span className="text-white font-bold">{formatINR(seatsTotal)}</span>
                  </div>

                  <button
                    onClick={() => navigate("/snacks")}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
