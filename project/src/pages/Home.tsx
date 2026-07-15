import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Star, Clock, ChevronRight, Loader as Loader2, Film, LogIn, Monitor, Armchair, Popcorn, Sparkles, Award, Clapperboard } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Movie } from "../types";

export default function Home() {
  const { session, profile, loading: authLoading } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<Movie | null>(null);

  useEffect(() => {
    if (!authLoading && !session) { setLoading(false); return; }
    if (!session) return;
    (async () => {
      try {
        const data = await api.get<Movie[]>("/movies?active=true");
        if (data) { setMovies(data); if (data.length > 0) setFeatured(data[0]); }
      } catch {
        // ignore, list stays empty
      }
      setLoading(false);
    })();
  }, [authLoading, session]);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center max-w-md">
          <img src="/images/logos/Copilot_20260709_163634.png" alt="CineNova Multiplex" className="h-24 w-auto mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to CineNova</h1>
          <p className="text-neutral-400 mb-8">Your premium destination for movie entertainment. Sign in to browse movies and book tickets.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg shadow-rose-500/30">
              <LogIn className="w-5 h-5" /> Sign In
            </Link>
            <Link to="/register" className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all">Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-16">
      {featured && (
        <section className="relative h-[75vh] min-h-[560px] overflow-hidden">
          <div className="absolute inset-0">
            <img src={featured.banner_url || featured.poster_url || "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg"} alt={featured.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-neutral-950/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/30" />
          </div>
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1 px-3 py-1 rounded-md bg-rose-500 text-white text-xs font-bold"><Sparkles className="w-3 h-3" /> NOW SHOWING</span>
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-medium">{featured.rating}</span>
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-medium">{featured.language}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 leading-tight">{featured.title}</h1>
              <div className="flex items-center gap-4 text-neutral-300 mb-4">
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {featured.genre}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {featured.duration_minutes} min</span>
              </div>
              <p className="text-neutral-300 text-base mb-6 line-clamp-2">{featured.description}</p>
              <div className="flex gap-3">
                <Link to={`/movie/${featured.id}`} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg shadow-rose-500/30">
                  <Play className="w-5 h-5 fill-white" /> Book Now
                </Link>
                <Link to={`/movie/${featured.id}`} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur text-white font-medium hover:bg-white/20 transition-all">View Details</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Clapperboard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Welcome back, {profile?.full_name?.split(" ")[0] || "Movie Lover"}!</h2>
              <p className="text-neutral-400 text-sm">Ready to catch a show? Browse 20 movies across 7 premium screens.</p>
            </div>
          </div>
          <Link to="/movies" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg shadow-rose-500/20 whitespace-nowrap">
            Browse Movies <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2"><Film className="w-6 h-6 text-rose-500" /> Now Showing</h2>
            <p className="text-neutral-400 text-sm mt-1">Book your tickets for the latest blockbusters</p>
          </div>
          <Link to="/movies" className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-sm font-medium">View All <ChevronRight className="w-4 h-4" /></Link>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-20"><Film className="w-12 h-12 text-neutral-600 mx-auto mb-4" /><p className="text-neutral-400">No movies available yet.</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {movies.slice(0, 10).map((movie) => (
              <Link key={movie.id} to={`/movie/${movie.id}`} className="group cursor-pointer">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-800 mb-3 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-rose-500/20">
                  <img src={movie.poster_url || "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg"} alt={movie.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold"><Play className="w-3 h-3 fill-white" /> Book</span>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur text-amber-400 text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400" /> {movie.rating}</div>
                </div>
                <h3 className="text-white font-semibold text-sm group-hover:text-rose-400 transition-colors line-clamp-1">{movie.title}</h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1"><span>{movie.genre}</span><span>•</span><span>{movie.language}</span></div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">The CineNova Experience</h2>
          <p className="text-neutral-400 text-sm">Premium amenities designed for the ultimate movie experience</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Monitor, title: "7 Premium Screens", desc: "IMAX, 4DX, Dolby Atmos, Gold Class & more", color: "from-rose-500/20 to-orange-500/20", text: "text-rose-400" },
            { icon: Armchair, title: "Recliner Seating", desc: "Comfortable recliners with ample legroom", color: "from-amber-500/20 to-yellow-500/20", text: "text-amber-400" },
            { icon: Popcorn, title: "Gourmet Snacks", desc: "Fresh popcorn, beverages & hot food", color: "from-blue-500/20 to-cyan-500/20", text: "text-blue-400" },
            { icon: Award, title: "Best Sound", desc: "Dolby Atmos surround sound system", color: "from-green-500/20 to-emerald-500/20", text: "text-green-400" },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-rose-500/30 hover:scale-105 transition-all">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4`}><Icon className={`w-7 h-7 ${feat.text}`} /></div>
                <h3 className="text-white font-bold text-lg mb-1">{feat.title}</h3>
                <p className="text-neutral-400 text-sm">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">How Booking Works</h2>
          <p className="text-neutral-400 text-sm">Book your movie in 4 easy steps</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", icon: Film, title: "Choose a Movie", desc: "Browse 20+ movies and pick your favorite" },
            { step: "02", icon: Armchair, title: "Select Seats", desc: "Pick your preferred seats from the layout" },
            { step: "03", icon: Popcorn, title: "Add Snacks", desc: "Grab popcorn, drinks & refreshments" },
            { step: "04", icon: Clock, title: "Pay & Enjoy", desc: "Pay via UPI and get your QR ticket" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative">
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center"><Icon className="w-6 h-6 text-rose-400" /></div>
                    <span className="text-3xl font-bold text-white/10">{item.step}</span>
                  </div>
                  <h3 className="text-white font-bold mb-1">{item.title}</h3>
                  <p className="text-neutral-400 text-sm">{item.desc}</p>
                </div>
                {idx < 3 && <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-white/10" />}
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-rose-500/10 via-orange-500/10 to-neutral-900 border border-white/10 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "20+", label: "Movies Available", icon: Film },
              { value: "7", label: "Premium Screens", icon: Monitor },
              { value: "860", label: "Comfortable Seats", icon: Armchair },
              { value: "16+", label: "Snack Options", icon: Popcorn },
            ].map((stat) => {
              const Icon = stat.icon;
              return <div key={stat.label}><Icon className="w-8 h-8 text-rose-400 mx-auto mb-2" /><p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p><p className="text-neutral-400 text-sm mt-1">{stat.label}</p></div>;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
