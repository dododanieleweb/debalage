export type UserRole = 'buyer' | 'seller' | 'both' | 'admin';
export type EventType = 'casa_privata' | 'mercatino' | 'mostra' | 'pop_up';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed';
export type ProductCondition = 'come_nuovo' | 'ottimo' | 'buono' | 'discreto';
export type ProductStatus = 'available' | 'reserved' | 'sold';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  bio: string;
  city: string;
  rating: number;
  reviewCount: number;
  joinedAt: string;
  specialties: string[];
  verified: boolean;
  salesCount: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  sellerId: string;
  address: string;
  city: string;
  date: string;
  endDate?: string;
  timeStart: string;
  timeEnd: string;
  image: string;
  gallery?: string[];
  tags: string[];
  status: EventStatus;
  productsCount: number;
  maxAttendees?: number;
  currentAttendees: number;
  price: number;
  featured: boolean;
  /** Max persone per ogni slot da 30 minuti (solo casa_privata) */
  slotMaxCapacity?: number;
}

export interface Booking {
  id: string;
  slotId: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: string;
  notes?: string;
}

export interface TimeSlot {
  id: string;
  eventId: string;
  startTime: string;  // "10:00"
  endTime: string;    // "10:30"
  maxCapacity: number;
  bookings: Booking[];
  disabled?: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  condition: ProductCondition;
  images: string[];
  sellerId: string;
  eventId?: string;
  tags: string[];
  era?: string;
  brand?: string;
  dimensions?: string;
  material?: string;
  status: ProductStatus;
  createdAt: string;
  featured: boolean;
  views: number;
  saves: number;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  targetId: string;
  rating: number;
  comment: string;
  createdAt: string;
  type: 'seller' | 'event' | 'product';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'confermato' | 'spedito' | 'consegnato' | 'annullato';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  address: string;
  city: string;
  createdAt: string;
}
