import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import SeatSelection from "./pages/SeatSelection";
import Snacks from "./pages/Snacks";
import BookingSummary from "./pages/BookingSummary";
import Payment from "./pages/Payment";
import Ticket from "./pages/Ticket";
import Bookings from "./pages/Bookings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-neutral-950 flex flex-col">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/seats/:showId" element={<SeatSelection />} />
                <Route path="/snacks" element={<Snacks />} />
                <Route path="/summary" element={<BookingSummary />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/ticket/:id" element={<Ticket />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
}
