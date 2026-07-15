import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader as Loader2, Film, Monitor, Calendar, Users, IndianRupee, TrendingUp, Ticket, Plus, Trash2, BarChart3, PieChart, Award, Clapperboard } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Movie, Show, Screen, Snack } from "../types";
import { formatINR, formatTime, formatDate, getNext7Days } from "../lib/utils";

type Tab = "dashboard" | "movies" | "shows" | "snacks" | "bookings" | "reports";

export default function Admin() {
  const { session, profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, movies: 0, seatsSold: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && session && profile?.is_admin) loadAll();
    else if (!authLoading) setLoading(false);
  }, [authLoading, session, profile]);

  const loadAll = async () => {
    const [moviesData, screensData, showsData, snacksData, bookingsData] = await Promise.all([
      api.get<Movie[]>("/movies"),
      api.get<Screen[]>("/screens"),
      api.get<Show[]>("/shows"),
      api.get<Snack[]>("/snacks"),
      api.get<any[]>("/bookings"),
    ]);
    setMovies(moviesData || []);
    setScreens(screensData || []);
    setShows(showsData || []);
    setSnacks(snacksData || []);
    setRecentBookings((bookingsData || []).slice(0, 10));
    setAllBookings(bookingsData || []);
    const allB = bookingsData || [];
    const revenue = allB.reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);
    const seatsSold = allB.reduce((sum: number, b: any) => sum + (b.booking_seats?.length || 0), 0);
    setStats({ revenue, bookings: allB.length, movies: (moviesData || []).length, seatsSold });
    setLoading(false);
  };

  if (authLoading || loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  if (!session) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><div className="text-center"><h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2><Link to="/login" className="text-rose-400">Sign In</Link></div></div>;
  if (!profile?.is_admin) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><div className="text-center"><h2 className="text-xl font-bold text-white mb-2">Access Denied</h2><p className="text-neutral-400 mb-4">Admin privileges required.</p><Link to="/" className="text-rose-400">Go Home</Link></div></div>;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "movies", label: "Movies", icon: Film },
    { id: "shows", label: "Shows", icon: Calendar },
    { id: "snacks", label: "Snacks", icon: Ticket },
    { id: "bookings", label: "Bookings", icon: Users },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-neutral-400 text-sm mb-8">Manage movies, shows, snacks, and view reports</p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map((t) => {
            const Icon = t.icon;
            return <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white" : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/10"}`}><Icon className="w-4 h-4" /> {t.label}</button>;
          })}
        </div>

        {tab === "dashboard" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Revenue", value: formatINR(stats.revenue), icon: IndianRupee, color: "from-green-500/20 to-emerald-500/20", text: "text-green-400" },
                { label: "Total Bookings", value: stats.bookings.toString(), icon: Ticket, color: "from-rose-500/20 to-orange-500/20", text: "text-rose-400" },
                { label: "Seats Sold", value: stats.seatsSold.toString(), icon: Users, color: "from-blue-500/20 to-cyan-500/20", text: "text-blue-400" },
                { label: "Active Movies", value: stats.movies.toString(), icon: Film, color: "from-amber-500/20 to-yellow-500/20", text: "text-amber-400" },
              ].map((stat) => {
                const Icon = stat.icon;
                return <div key={stat.label} className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} border border-white/10`}><Icon className={`w-6 h-6 ${stat.text} mb-3`} /><p className="text-2xl font-bold text-white">{stat.value}</p><p className="text-xs text-neutral-400 mt-1">{stat.label}</p></div>;
              })}
            </div>
            <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Recent Bookings</h2>
              {recentBookings.length === 0 ? <p className="text-neutral-400 text-sm text-center py-8">No bookings yet.</p> : (
                <div className="space-y-3">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/50">
                      <div><p className="text-white font-medium text-sm">{b.show?.movie?.title}</p><p className="text-xs text-neutral-400 mt-0.5">{b.booking_ref} • {b.booking_seats?.length} seats • {b.show?.screen?.name}</p></div>
                      <div className="text-right"><p className="text-rose-400 font-bold text-sm">{formatINR(b.total_amount)}</p><p className="text-xs text-neutral-500">{formatDate(b.created_at)}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "movies" && <MoviesManager movies={movies} onChange={loadAll} />}
        {tab === "shows" && <ShowsManager movies={movies} screens={screens} shows={shows} onChange={loadAll} />}
        {tab === "snacks" && <SnacksManager snacks={snacks} onChange={loadAll} />}
        {tab === "bookings" && (
          <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-4">All Bookings</h2>
            {allBookings.length === 0 ? <p className="text-neutral-400 text-sm text-center py-8">No bookings yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-neutral-400 border-b border-white/10"><th className="pb-3 pr-4">Ref</th><th className="pb-3 pr-4">Movie</th><th className="pb-3 pr-4">Screen</th><th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">Seats</th><th className="pb-3 pr-4">M:F</th><th className="pb-3 pr-4">Amount</th><th className="pb-3">Status</th></tr></thead>
                  <tbody>
                    {allBookings.map((b) => (
                      <tr key={b.id} className="border-b border-white/5">
                        <td className="py-3 pr-4 text-white font-mono text-xs">{b.booking_ref}</td>
                        <td className="py-3 pr-4 text-white">{b.show?.movie?.title}</td>
                        <td className="py-3 pr-4 text-neutral-400">{b.show?.screen?.name}</td>
                        <td className="py-3 pr-4 text-neutral-400">{formatDate(b.show?.show_date)}</td>
                        <td className="py-3 pr-4 text-neutral-400">{b.booking_seats?.length}</td>
                        <td className="py-3 pr-4 text-neutral-400">{b.male_count}:{b.female_count}</td>
                        <td className="py-3 pr-4 text-rose-400 font-bold">{formatINR(b.total_amount)}</td>
                        <td className="py-3"><span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">{b.payment_status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {tab === "reports" && <ReportsModule bookings={allBookings} />}
      </div>
    </div>
  );
}

function ReportsModule({ bookings }: { bookings: any[] }) {
  const totalMale = bookings.reduce((sum, b) => sum + (b.male_count || 0), 0);
  const totalFemale = bookings.reduce((sum, b) => sum + (b.female_count || 0), 0);
  const totalVisitors = totalMale + totalFemale;
  const malePct = totalVisitors > 0 ? (totalMale / totalVisitors) * 100 : 0;
  const femalePct = totalVisitors > 0 ? (totalFemale / totalVisitors) * 100 : 0;
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const totalSeats = bookings.reduce((sum, b) => sum + (b.booking_seats?.length || 0), 0);

  const movieRevenue: Record<string, { title: string; revenue: number; bookings: number }> = {};
  bookings.forEach((b) => {
    const title = b.show?.movie?.title || "Unknown";
    if (!movieRevenue[title]) movieRevenue[title] = { title, revenue: 0, bookings: 0 };
    movieRevenue[title].revenue += Number(b.total_amount);
    movieRevenue[title].bookings += 1;
  });
  const topMovies = Object.values(movieRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxRevenue = topMovies.length > 0 ? topMovies[0].revenue : 1;

  const last7Days = getNext7Days();
  const bookingsPerDay = last7Days.map((date) => ({ date, count: bookings.filter((b) => b.show?.show_date === date).length }));
  const maxBookingsPerDay = Math.max(...bookingsPerDay.map((d) => d.count), 1);

  const pieRadius = 80;
  const circumference = 2 * Math.PI * pieRadius;
  const maleArc = (malePct / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><PieChart className="w-5 h-5 text-rose-400" /> Gender Wise Visitors</h2>
          <p className="text-neutral-400 text-xs mb-6">Total visitors: {totalVisitors}</p>
          {totalVisitors === 0 ? <p className="text-neutral-500 text-sm text-center py-12">No visitor data yet.</p> : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                  <circle cx="100" cy="100" r={pieRadius} fill="none" stroke="#1e3a8a" strokeWidth="30" strokeDasharray={`${maleArc} ${circumference}`} />
                  <circle cx="100" cy="100" r={pieRadius} fill="none" stroke="#ec4899" strokeWidth="30" strokeDasharray={`${(femalePct / 100) * circumference} ${circumference}`} strokeDashoffset={-maleArc} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold text-white">{totalVisitors}</span><span className="text-xs text-neutral-400">Visitors</span></div>
              </div>
              <div className="space-y-3 flex-1 w-full">
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500" /><span className="text-white text-sm font-medium">Male</span></div>
                  <div className="text-right"><span className="text-white font-bold">{totalMale}</span><span className="text-blue-400 text-xs ml-2">{malePct.toFixed(1)}%</span></div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-pink-500" /><span className="text-white text-sm font-medium">Female</span></div>
                  <div className="text-right"><span className="text-white font-bold">{totalFemale}</span><span className="text-pink-400 text-xs ml-2">{femalePct.toFixed(1)}%</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-rose-400" /> Bookings Overview</h2>
          <p className="text-neutral-400 text-xs mb-6">Bookings per day (next 7 days)</p>
          <div className="flex items-end justify-between gap-2 h-48">
            {bookingsPerDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-white font-bold">{d.count}</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-rose-500 to-orange-500 transition-all hover:opacity-80" style={{ height: `${(d.count / maxBookingsPerDay) * 100}%`, minHeight: d.count > 0 ? "8px" : "2px" }} />
                <span className="text-xs text-neutral-400">{formatDate(d.date).split(" ")[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/50 rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Award className="w-5 h-5 text-rose-400" /> Top Movies by Revenue</h2>
        <p className="text-neutral-400 text-xs mb-6">Highest grossing movies</p>
        {topMovies.length === 0 ? <p className="text-neutral-500 text-sm text-center py-12">No booking data yet.</p> : (
          <div className="space-y-3">
            {topMovies.map((m, idx) => (
              <div key={m.title} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${idx === 0 ? "bg-amber-500/20 text-amber-400" : idx === 1 ? "bg-neutral-400/20 text-neutral-300" : idx === 2 ? "bg-orange-700/20 text-orange-600" : "bg-neutral-800 text-neutral-500"}`}>{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1"><span className="text-white font-medium text-sm">{m.title}</span><span className="text-rose-400 font-bold text-sm">{formatINR(m.revenue)}</span></div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all" style={{ width: `${(m.revenue / maxRevenue) * 100}%` }} /></div>
                  <p className="text-xs text-neutral-500 mt-1">{m.bookings} bookings</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatINR(totalRevenue), icon: IndianRupee, color: "text-green-400" },
          { label: "Total Bookings", value: bookings.length.toString(), icon: Ticket, color: "text-rose-400" },
          { label: "Seats Sold", value: totalSeats.toString(), icon: Users, color: "text-blue-400" },
          { label: "Male : Female", value: `${totalMale} : ${totalFemale}`, icon: Clapperboard, color: "text-amber-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return <div key={stat.label} className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10"><Icon className={`w-6 h-6 ${stat.color} mb-3`} /><p className="text-xl font-bold text-white">{stat.value}</p><p className="text-xs text-neutral-400 mt-1">{stat.label}</p></div>;
        })}
      </div>
    </div>
  );
}

function MoviesManager({ movies, onChange }: { movies: Movie[]; onChange: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", genre: "", language: "English", duration_minutes: 120, rating: "UA", description: "", director: "", cast_info: "", poster_url: "", banner_url: "" });

  const handleAdd = async () => {
    if (!form.title) return;
    await api.post("/movies", { ...form, duration_minutes: Number(form.duration_minutes), is_active: true });
    setForm({ title: "", genre: "", language: "English", duration_minutes: 120, rating: "UA", description: "", director: "", cast_info: "", poster_url: "", banner_url: "" });
    setShowForm(false);
    onChange();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this movie?")) return;
    await api.del(`/movies/${id}`);
    onChange();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Manage Movies</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold"><Plus className="w-4 h-4" /> Add Movie</button>
      </div>
      {showForm && (
        <div className="mb-6 p-6 rounded-2xl bg-neutral-900/50 border border-white/10 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input placeholder="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input placeholder="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input type="number" placeholder="Duration (min)" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input placeholder="Rating (U/A/UA)" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input placeholder="Director" value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input placeholder="Cast" value={form.cast_info} onChange={(e) => setForm({ ...form, cast_info: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input placeholder="Poster URL" value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input placeholder="Banner URL" value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
          <button onClick={handleAdd} className="px-6 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-all">Save Movie</button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {movies.map((m) => (
          <div key={m.id} className="flex gap-3 p-3 rounded-xl bg-neutral-900/50 border border-white/10">
            <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0"><img src={m.poster_url || "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg"} alt={m.title} className="w-full h-full object-cover" /></div>
            <div className="flex-1 min-w-0"><h3 className="text-white font-medium text-sm">{m.title}</h3><p className="text-xs text-neutral-400 mt-0.5">{m.genre} • {m.language}</p><p className="text-xs text-neutral-500 mt-0.5">{m.duration_minutes} min • {m.rating}</p><button onClick={() => handleDelete(m.id)} className="mt-2 flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"><Trash2 className="w-3 h-3" /> Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShowsManager({ movies, screens, shows, onChange }: { movies: Movie[]; screens: Screen[]; shows: Show[]; onChange: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ movie_id: "", screen_id: "", show_date: getNext7Days()[0], show_time: "18:00", price_regular: 180, price_premium: 280, price_recliner: 450 });

  const handleAdd = async () => {
    if (!form.movie_id || !form.screen_id) return;
    await api.post("/shows", { ...form, price_regular: Number(form.price_regular), price_premium: Number(form.price_premium), price_recliner: Number(form.price_recliner), is_active: true });
    setForm({ movie_id: "", screen_id: "", show_date: getNext7Days()[0], show_time: "18:00", price_regular: 180, price_premium: 280, price_recliner: 450 });
    setShowForm(false);
    onChange();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this show?")) return;
    await api.del(`/shows/${id}`);
    onChange();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Manage Shows</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold"><Plus className="w-4 h-4" /> Add Show</button>
      </div>
      {showForm && (
        <div className="mb-6 p-6 rounded-2xl bg-neutral-900/50 border border-white/10 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.movie_id} onChange={(e) => setForm({ ...form, movie_id: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"><option value="">Select Movie</option>{movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
            <select value={form.screen_id} onChange={(e) => setForm({ ...form, screen_id: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"><option value="">Select Screen</option>{screens.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.screen_type})</option>)}</select>
            <input type="date" value={form.show_date} onChange={(e) => setForm({ ...form, show_date: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input type="time" value={form.show_time} onChange={(e) => setForm({ ...form, show_time: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input type="number" placeholder="Regular Price" value={form.price_regular} onChange={(e) => setForm({ ...form, price_regular: Number(e.target.value) })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input type="number" placeholder="Premium Price" value={form.price_premium} onChange={(e) => setForm({ ...form, price_premium: Number(e.target.value) })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input type="number" placeholder="Recliner Price" value={form.price_recliner} onChange={(e) => setForm({ ...form, price_recliner: Number(e.target.value) })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
          </div>
          <button onClick={handleAdd} className="px-6 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-all">Save Show</button>
        </div>
      )}
      <div className="space-y-2">
        {shows.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/50 border border-white/10">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center"><Monitor className="w-5 h-5 text-rose-400" /></div><div><p className="text-white font-medium text-sm">{s.movie?.title}</p><p className="text-xs text-neutral-400">{s.screen?.name} • {formatDate(s.show_date)} • {formatTime(s.show_time)}</p></div></div>
            <div className="flex items-center gap-3"><span className="text-xs text-neutral-400">₹{s.price_regular} / ₹{s.price_premium} / ₹{s.price_recliner}</span><button onClick={() => handleDelete(s.id)} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-4 h-4" /></button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SnacksManager({ snacks, onChange }: { snacks: Snack[]; onChange: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", price: 100, category: "Food", description: "", image_url: "" });

  const handleAdd = async () => {
    if (!form.name) return;
    await api.post("/snacks", { ...form, price: Number(form.price), is_available: true });
    setForm({ name: "", price: 100, category: "Food", description: "", image_url: "" });
    setShowForm(false);
    onChange();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this snack?")) return;
    await api.del(`/snacks/${id}`);
    onChange();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Manage Snacks</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold"><Plus className="w-4 h-4" /> Add Snack</button>
      </div>
      {showForm && (
        <div className="mb-6 p-6 rounded-2xl bg-neutral-900/50 border border-white/10 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"><option>Food</option><option>Beverages</option><option>Dessert</option><option>Snacks</option></select>
            <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
          <button onClick={handleAdd} className="px-6 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-all">Save Snack</button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {snacks.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/50 border border-white/10">
            <div className="flex items-center gap-3">
              {s.image_url && <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"><img src={s.image_url} alt={s.name} className="w-full h-full object-cover" /></div>}
              <div><p className="text-white font-medium text-sm">{s.name}</p><p className="text-xs text-neutral-400">{s.category} • {formatINR(s.price)}</p></div>
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
