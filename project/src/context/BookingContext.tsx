import { createContext, useContext, useState, type ReactNode } from "react";
import type { Show, CartSeat, CartSnack, Seat, Snack, Id } from "../types";

interface BookingContextValue {
  selectedShow: Show | null;
  setSelectedShow: (show: Show | null) => void;
  cartSeats: CartSeat[];
  toggleCartSeat: (seat: Seat, price: number, ticketType: "male" | "female") => void;
  removeCartSeat: (seatId: Id) => void;
  updateTicketType: (seatId: Id, ticketType: "male" | "female") => void;
  seatsTotal: number;
  cartSnacks: CartSnack[];
  toggleCartSnack: (snack: Snack) => void;
  updateSnackQuantity: (snackId: Id, quantity: number) => void;
  removeCartSnack: (snackId: Id) => void;
  snacksTotal: number;
  grandTotal: number;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [cartSeats, setCartSeats] = useState<CartSeat[]>([]);
  const [cartSnacks, setCartSnacks] = useState<CartSnack[]>([]);

  const toggleCartSeat = (seat: Seat, price: number, ticketType: "male" | "female") => {
    setCartSeats((prev) => {
      const existing = prev.find((cs) => cs.seat.id === seat.id);
      if (existing) return prev.filter((cs) => cs.seat.id !== seat.id);
      return [...prev, { seat, price, ticketType }];
    });
  };

  const removeCartSeat = (seatId: Id) => {
    setCartSeats((prev) => prev.filter((cs) => cs.seat.id !== seatId));
  };

  const updateTicketType = (seatId: Id, ticketType: "male" | "female") => {
    setCartSeats((prev) =>
      prev.map((cs) => (cs.seat.id === seatId ? { ...cs, ticketType } : cs))
    );
  };

  const toggleCartSnack = (snack: Snack) => {
    setCartSnacks((prev) => {
      const existing = prev.find((cs) => cs.snack.id === snack.id);
      if (existing) return prev.filter((cs) => cs.snack.id !== snack.id);
      return [...prev, { snack, quantity: 1 }];
    });
  };

  const updateSnackQuantity = (snackId: Id, quantity: number) => {
    if (quantity <= 0) {
      setCartSnacks((prev) => prev.filter((cs) => cs.snack.id !== snackId));
      return;
    }
    setCartSnacks((prev) =>
      prev.map((cs) => (cs.snack.id === snackId ? { ...cs, quantity } : cs))
    );
  };

  const removeCartSnack = (snackId: Id) => {
    setCartSnacks((prev) => prev.filter((cs) => cs.snack.id !== snackId));
  };

  const seatsTotal = cartSeats.reduce((sum, cs) => sum + cs.price, 0);
  const snacksTotal = cartSnacks.reduce((sum, cs) => sum + cs.snack.price * cs.quantity, 0);
  const grandTotal = seatsTotal + snacksTotal;

  const clearBooking = () => {
    setCartSeats([]);
    setCartSnacks([]);
    setSelectedShow(null);
  };

  return (
    <BookingContext.Provider
      value={{
        selectedShow,
        setSelectedShow,
        cartSeats,
        toggleCartSeat,
        removeCartSeat,
        updateTicketType,
        seatsTotal,
        cartSnacks,
        toggleCartSnack,
        updateSnackQuantity,
        removeCartSnack,
        snacksTotal,
        grandTotal,
        clearBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
