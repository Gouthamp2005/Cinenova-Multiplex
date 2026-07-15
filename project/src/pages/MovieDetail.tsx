import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Calendar, Loader as Loader2, Monitor, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import { useBooking } from "../context/BookingContext";
import type { Movie, Show } from "../types";
import { formatDate, formatTime } from "../lib/utils";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSelectedShow } = useBooking();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const movieData = await api.get<Movie>(`/movies/${id}`);
        setMovie(movieData);

        const showsData = await api.get<Show[]>(`/shows?movieId=${id}&active=true`);
        if (showsData) {
          setShows(showsData);
          if (showsData.length > 0) setSelectedDate(showsData[0].show_date);
        }
      } catch {
        setMovie(null);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSelectShow = (show: Show) => {
    setSelectedShow(show);
    navigate(`/seats/${show.id}`);
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  }

  if (!movie) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center pt-16"><div className="text-center"><p className="text-neutral-400 mb-4">Movie not found.</p><Link to="/movies" className="text-rose-400">Browse Movies</Link></div></div>;
  }

  const dates = Array.from(new Set(shows.map((s) => s.show_date)));
  const showsForDate = shows.filter((s) => s.show_date === selectedDate);

  return (
    <div className="min-h-screen bg-neutral-950 pt-16">
      <div className="relative h-[50vh] overflow-hidden">
        <img src={movie.banner_url || movie.poster_url || "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg"} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <Link to="/movies" className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 transition-colors"><ArrowLeft className="w-5 h-5" /> Back to Movies</Link>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-40 h-60 rounded-xl overflow-hidden flex-shrink-0 mx-auto md:mx-0">
            <img src={movie.poster_url || "https://images.pexels.com/photos/7234253/pexels-photo-7234253.jpeg"} alt={movie.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="flex items-center gap-1 px-3 py-1 rounded-md bg-rose-500/20 text-rose-400 text-sm font-bold"><Star className="w-4 h-4 fill-rose-400" /> {movie.rating}</span>
              <span className="px-3 py-1 rounded-md bg-white/10 text-neutral-300 text-sm">{movie.genre}</span>
              <span className="px-3 py-1 rounded-md bg-white/10 text-neutral-300 text-sm">{movie.language}</span>
              <span className="flex items-center gap-1 text-neutral-300 text-sm"><Clock className="w-4 h-4" /> {movie.duration_minutes} min</span>
            </div>
            <p className="text-neutral-300 text-sm mb-4">{movie.description}</p>
            <div className="space-y-1 text-sm text-neutral-400">
              <p><span className="text-neutral-500">Director:</span> {movie.director}</p>
              <p><span className="text-neutral-500">Cast:</span> {movie.cast_info}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-rose-400" /> Select Date</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedDate === date ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white" : "bg-neutral-900 text-neutral-400 border border-white/10 hover:text-white"}`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Monitor className="w-5 h-5 text-rose-400" /> Available Shows</h2>
          {showsForDate.length === 0 ? (
            <p className="text-neutral-400 text-sm">No shows available for this date.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {showsForDate.map((show) => (
                <button
                  key={show.id}
                  onClick={() => handleSelectShow(show)}
                  className="p-4 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-rose-500/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-lg">{formatTime(show.show_time)}</span>
                    <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-rose-400 transition-colors" />
                  </div>
                  <p className="text-neutral-400 text-sm">{show.screen?.name}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                    <span>Regular: ₹{show.price_regular}</span>
                    <span>Premium: ₹{show.price_premium}</span>
                    <span>Recliner: ₹{show.price_recliner}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
