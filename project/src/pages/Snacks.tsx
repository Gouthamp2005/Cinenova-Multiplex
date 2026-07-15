import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowRight, Loader as Loader2, Plus, Minus, Popcorn } from "lucide-react";
import { api } from "../lib/api";
import { useBooking } from "../context/BookingContext";
import type { Snack } from "../types";
import { formatINR } from "../lib/utils";

export default function Snacks() {
  const navigate = useNavigate();
  const { selectedShow, cartSeats, cartSnacks, toggleCartSnack, updateSnackQuantity, snacksTotal, seatsTotal } = useBooking();
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Snack[]>("/snacks?available=true");
        if (data) setSnacks(data);
      } catch {
        // ignore, list stays empty
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedShow || cartSeats.length === 0) {
      const timer = setTimeout(() => navigate("/movies"), 100);
      return () => clearTimeout(timer);
    }
  }, [selectedShow, cartSeats.length, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  }

  if (!selectedShow || cartSeats.length === 0) return null;

  const categories = ["All", ...Array.from(new Set(snacks.map((s) => s.category)))];
  const filtered = category === "All" ? snacks : snacks.filter((s) => s.category === category);

  const getQuantity = (snackId: string) => cartSnacks.find((cs) => cs.snack.id === snackId)?.quantity || 0;

  return (
    <div className="min-h-screen bg-neutral-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Seats
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
            <Popcorn className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Snacks & Refreshments</h1>
            <p className="text-neutral-400 text-sm">Grab some snacks for the movie!</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === c ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white" : "bg-neutral-900 text-neutral-400 border border-white/10 hover:text-white"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((snack) => {
                const qty = getQuantity(snack.id);
                return (
                  <div key={snack.id} className={`p-4 rounded-2xl border transition-all ${qty > 0 ? "bg-rose-500/5 border-rose-500/30" : "bg-neutral-900/50 border-white/10"}`}>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800">
                        {snack.image_url ? (
                          <img src={snack.image_url} alt={snack.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Popcorn className="w-8 h-8 text-neutral-600" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm">{snack.name}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{snack.description}</p>
                        <p className="text-rose-400 font-bold text-sm mt-1">{formatINR(snack.price)}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      {qty === 0 ? (
                        <button onClick={() => toggleCartSnack(snack)} className="w-full py-2 rounded-xl bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 transition-all">
                          Add to Cart
                        </button>
                      ) : (
                        <div className="flex items-center justify-between">
                          <button onClick={() => updateSnackQuantity(snack.id, qty - 1)} className="w-9 h-9 rounded-lg bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-bold">{qty}</span>
                          <button onClick={() => updateSnackQuantity(snack.id, qty + 1)} className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Tickets ({cartSeats.length})</span>
                  <span className="text-white">{formatINR(seatsTotal)}</span>
                </div>
                {snacksTotal > 0 && (
                  <>
                    {cartSnacks.map((cs) => (
                      <div key={cs.snack.id} className="flex justify-between text-sm">
                        <span className="text-neutral-400">{cs.snack.name} × {cs.quantity}</span>
                        <span className="text-white">{formatINR(cs.snack.price * cs.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                      <span className="text-neutral-400">Snacks Total</span>
                      <span className="text-white">{formatINR(snacksTotal)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold text-white pt-4 border-t border-white/10 mb-4">
                <span>Total</span>
                <span>{formatINR(seatsTotal + snacksTotal)}</span>
              </div>

              <button onClick={() => navigate("/summary")} className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/summary")} className="mt-2 w-full py-3 rounded-xl bg-neutral-800 text-neutral-300 font-medium hover:bg-neutral-700 transition-all flex items-center justify-center gap-2">
                Skip Snacks <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
