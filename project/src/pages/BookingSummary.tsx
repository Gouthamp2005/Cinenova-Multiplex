import { useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowRight, Monitor, Calendar, Clock, Film, Armchair, Popcorn, User, CircleUser as UserCircle, Receipt } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { formatINR, formatTime, formatDate } from "../lib/utils";

export default function BookingSummary() {
  const navigate = useNavigate();
  const { selectedShow, cartSeats, cartSnacks, seatsTotal, snacksTotal, grandTotal } = useBooking();

  if (!selectedShow || cartSeats.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">Your booking session has expired.</p>
          <button onClick={() => navigate("/movies")} className="text-rose-400 hover:text-rose-300">Browse Movies</button>
        </div>
      </div>
    );
  }

  const convenienceFee = Math.round(seatsTotal * 0.02);
  const totalPayable = grandTotal + convenienceFee;
  const maleCount = cartSeats.filter((cs) => cs.ticketType === "male").length;
  const femaleCount = cartSeats.filter((cs) => cs.ticketType === "female").length;

  const summaryRows = [
    { icon: Film, label: "Movie", value: selectedShow.movie?.title },
    { icon: Monitor, label: "Screen", value: selectedShow.screen?.name },
    { icon: Calendar, label: "Date", value: formatDate(selectedShow.show_date) },
    { icon: Clock, label: "Time", value: formatTime(selectedShow.show_time) },
    { icon: Armchair, label: "Tickets", value: `${cartSeats.length} (M:${maleCount} F:${femaleCount})` },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Snacks
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Booking Summary</h1>
            <p className="text-neutral-400 text-sm">Review your booking before payment</p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-2xl border border-white/10 overflow-hidden mb-6">
          <div className="flex gap-4 p-5">
            <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
              <img src={selectedShow.movie?.poster_url || "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg"} alt={selectedShow.movie?.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{selectedShow.movie?.title}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-xs">{selectedShow.movie?.genre}</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-xs">{selectedShow.movie?.language}</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-xs">{selectedShow.movie?.rating}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">{selectedShow.movie?.duration_minutes} min • {selectedShow.movie?.director}</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6 mb-6">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Show Details</h3>
          <div className="space-y-3">
            {summaryRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center"><Icon className="w-4 h-4 text-rose-400" /></div>
                    <span className="text-neutral-400 text-sm">{row.label}</span>
                  </div>
                  <span className="text-white font-medium text-sm">{row.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Seat Details</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold"><User className="w-3 h-3" /> Male: {maleCount}</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-400 text-xs font-bold"><UserCircle className="w-3 h-3" /> Female: {femaleCount}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {cartSeats.map((cs) => (
              <div key={cs.seat.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-800/50">
                <span className="text-white font-bold text-sm">{cs.seat.row_label}{cs.seat.seat_number}</span>
                <span className="text-xs text-neutral-500 capitalize">{cs.seat.seat_type}</span>
                <span className="text-rose-400 text-xs font-medium">{formatINR(cs.price)}</span>
                {cs.ticketType === "male" ? <User className="w-3 h-3 text-blue-400" /> : <UserCircle className="w-3 h-3 text-pink-400" />}
              </div>
            ))}
          </div>
        </div>

        {cartSnacks.length > 0 && (
          <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6 mb-6">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Popcorn className="w-4 h-4 text-rose-400" /> Snacks & Refreshments</h3>
            <div className="space-y-2">
              {cartSnacks.map((cs) => (
                <div key={cs.snack.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-neutral-300 text-sm">{cs.snack.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500 text-xs">× {cs.quantity}</span>
                    <span className="text-white font-medium text-sm">{formatINR(cs.snack.price * cs.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-2xl border border-rose-500/20 p-6 mb-6">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Price Breakdown</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm"><span className="text-neutral-400">Tickets ({cartSeats.length})</span><span className="text-white">{formatINR(seatsTotal)}</span></div>
            {snacksTotal > 0 && <div className="flex justify-between text-sm"><span className="text-neutral-400">Snacks & Beverages</span><span className="text-white">{formatINR(snacksTotal)}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-neutral-400">Convenience Fee</span><span className="text-white">{formatINR(convenienceFee)}</span></div>
          </div>
          <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10">
            <span>Total Amount</span><span>{formatINR(totalPayable)}</span>
          </div>
        </div>

        <button onClick={() => navigate("/payment")} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2">
          Proceed to Payment <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
