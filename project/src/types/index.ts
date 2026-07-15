// Ids come back from the MySQL backend as numbers (BIGINT auto_increment),
// but are frequently used interchangeably with route params (strings) -
// this alias keeps that flexible without littering the codebase with casts.
export type Id = string | number;

export interface Profile {
  id: Id;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Movie {
  id: Id;
  title: string;
  genre: string;
  language: string;
  duration_minutes: number;
  rating: string;
  description: string | null;
  cast_info: string | null;
  director: string | null;
  poster_url: string | null;
  banner_url: string | null;
  release_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Screen {
  id: Id;
  screen_number: number;
  name: string;
  total_rows: number;
  seats_per_row: number;
  screen_type: string;
  created_at: string;
}

export interface Show {
  id: Id;
  movie_id: Id;
  screen_id: Id;
  show_date: string;
  show_time: string;
  price_regular: number;
  price_premium: number;
  price_recliner: number;
  is_active: boolean;
  movie?: Movie;
  screen?: Screen;
  created_at: string;
}

export interface Seat {
  id: Id;
  screen_id: Id;
  row_label: string;
  seat_number: number;
  seat_type: "regular" | "premium" | "recliner";
}

export interface Snack {
  id: Id;
  name: string;
  price: number;
  category: string;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
}

export interface Booking {
  id: Id;
  user_id: Id;
  show_id: Id;
  booking_ref: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  male_count: number;
  female_count: number;
  created_at: string;
  show?: Show;
  booking_seats?: { seat: Seat }[];
  booking_snacks?: { snack_id: Id; snack: Snack; quantity: number }[];
}

export interface CartSeat {
  seat: Seat;
  price: number;
  ticketType: "male" | "female";
}

export interface CartSnack {
  snack: Snack;
  quantity: number;
}
