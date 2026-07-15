import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Smartphone, CreditCard, Wallet, Loader as Loader2, CircleCheck as CheckCircle2, Shield, Monitor, Clock, Calendar, Landmark, Banknote } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { formatINR } from "../lib/utils";

export default function Payment() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { selectedShow, cartSeats, cartSnacks, seatsTotal, snacksTotal, grandTotal, clearBooking } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!selectedShow || cartSeats.length === 0 || !session) {
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

  const paymentMethods = [
    { id: "UPI", label: "UPI", icon: Smartphone, desc: "GPay, PhonePe, Paytm" },
    { id: "Card", label: "Debit/Credit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
    { id: "NetBanking", label: "Net Banking", icon: Landmark, desc: "All major banks supported" },
    { id: "Wallet", label: "Wallet", icon: Wallet, desc: "Paytm, Mobikwik, Amazon Pay" },
    { id: "COD", label: "Cash on Counter", icon: Banknote, desc: "Pay at the cinema counter" },
  ];

  const handlePay = async () => {
    setProcessing(true);

    try {
      const booking = await api.post<{ id: string | number }>("/bookings", {
        show_id: selectedShow.id,
        seats: cartSeats.map((cs) => ({
          seat_id: cs.seat.id,
          ticket_type: cs.ticketType,
          price: cs.price,
        })),
        snacks: cartSnacks.map((cs) => ({ snack_id: cs.snack.id, quantity: cs.quantity })),
        payment_method: paymentMethod,
        total_amount: totalPayable,
      });

      clearBooking();
      setProcessing(false);
      navigate(`/ticket/${booking.id}`);
    } catch (err) {
      setProcessing(false);
      alert("Payment failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Booking Details</h2>
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={selectedShow.movie?.poster_url || "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg"} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{selectedShow.movie?.title}</h3>
                  <p className="text-sm text-neutral-400 flex items-center gap-1 mt-1"><Monitor className="w-3.5 h-3.5" /> {selectedShow.screen?.name}</p>
                  <p className="text-sm text-neutral-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedShow.show_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  <p className="text-sm text-neutral-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedShow.show_time.slice(0, 5)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {cartSeats.map((cs) => (
                  <span key={cs.seat.id} className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 text-xs font-bold">{cs.seat.row_label}{cs.seat.seat_number}</span>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Select Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const active = paymentMethod === method.id;
                  return (
                    <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${active ? "bg-rose-500/10 border-rose-500/50" : "bg-neutral-800/50 border-white/10 hover:border-white/20"}`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${active ? "bg-rose-500 text-white" : "bg-neutral-700 text-neutral-300"}`}><Icon className="w-5 h-5" /></div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-medium text-sm">{method.label}</div>
                        <div className="text-neutral-500 text-xs">{method.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "border-rose-500" : "border-neutral-600"}`}>
                        {active && <CheckCircle2 className="w-4 h-4 text-rose-500 fill-rose-500/20" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "UPI" && (
                <div className="mt-4 p-4 rounded-xl bg-neutral-800/50 border border-white/10">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Enter UPI ID</label>
                  <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
                  <div className="flex gap-2 mt-3">
                    {["GPay", "PhonePe", "Paytm"].map((app) => (
                      <button key={app} onClick={() => setUpiId(`user@${app.toLowerCase()}`)} className="flex-1 py-2 rounded-lg bg-neutral-700 text-white text-xs font-medium hover:bg-neutral-600 transition-all">{app}</button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === "COD" && (
                <div className="mt-4 p-4 rounded-xl bg-neutral-800/50 border border-white/10 text-center">
                  <Banknote className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">Pay {formatINR(totalPayable)} at the cinema counter. Please collect your ticket from the counter before the show.</p>
                </div>
              )}

              {(paymentMethod === "Card" || paymentMethod === "Wallet" || paymentMethod === "NetBanking") && (
                <div className="mt-4 p-4 rounded-xl bg-neutral-800/50 border border-white/10 text-center">
                  <Shield className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">You will be redirected to a secure payment page.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">Price Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-neutral-400">Tickets ({cartSeats.length})</span><span className="text-white">{formatINR(seatsTotal)}</span></div>
                {snacksTotal > 0 && <div className="flex justify-between text-sm"><span className="text-neutral-400">Snacks & Beverages</span><span className="text-white">{formatINR(snacksTotal)}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-neutral-400">Convenience Fee</span><span className="text-white">{formatINR(convenienceFee)}</span></div>
                <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/10"><span>Total Payable</span><span>{formatINR(totalPayable)}</span></div>
              </div>
              <button onClick={handlePay} disabled={processing || (paymentMethod === "UPI" && !upiId)} className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : `Pay ${formatINR(totalPayable)}`}
              </button>
              <p className="text-xs text-neutral-500 text-center mt-3 flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> 100% Secure Payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
