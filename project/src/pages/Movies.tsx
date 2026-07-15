import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Clock, Loader as Loader2, Film, Search, LogIn } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Movie } from "../types";

export default function Movies() {
  const { session, loading: authLoading } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");

  useEffect(() => {
    if (!authLoading && !session) { setLoading(false); return; }
    if (!session) return;
    (async () => {
      try {
        const data = await api.get<Movie[]>("/movies?active=true");
        if (data) setMovies(data);
      } catch {
        // ignore, list stays empty
      }
      setLoading(false);
    })();
  }, [authLoading, session]);

  const genres = ["All", ...Array.from(new Set(movies.map((m) => m.genre)))];
  const filtered = movies.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genreFilter === "All" || m.genre === genreFilter;
    return matchSearch && matchGenre;
  });

  if (authLoading || loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16 px-4">
        <div className="text-center max-w-md">
          <Film className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-neutral-400 mb-6">Please sign in to browse and book movies.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold"><LogIn className="w-5 h-5" /> Sign In</Link>
            <Link to="/register" className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium">Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">All Movies</h1>
        <p className="text-neutral-400 text-sm mb-8">Browse and book from our collection of {movies.length} movies</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenreFilter(g)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${genreFilter === g ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white" : "bg-neutral-900 text-neutral-400 border border-white/10 hover:text-white"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20"><Film className="w-12 h-12 text-neutral-600 mx-auto mb-4" /><p className="text-neutral-400">No movies found.</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filtered.map((movie) => (
              <Link key={movie.id} to={`/movie/${movie.id}`} className="group cursor-pointer">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-800 mb-3 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-rose-500/20">
                  <img src={movie.poster_url || "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg"} alt={movie.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur text-amber-400 text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400" /> {movie.rating}</div>
                </div>
                <h3 className="text-white font-semibold text-sm group-hover:text-rose-400 transition-colors line-clamp-1">{movie.title}</h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1"><span>{movie.genre}</span><span>•</span><span>{movie.language}</span></div>
                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5"><Clock className="w-3 h-3" /> {movie.duration_minutes} min</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
