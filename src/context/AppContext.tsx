import {
  createContext, useContext, useReducer, useEffect,
  ReactNode, useRef,
} from 'react';
import { User, Product, CartItem, TimeSlot, Order, Event } from '../types';
import { USERS, PRODUCTS, EVENTS, INITIAL_SLOTS, generateSlots } from '../data/mockData';
import { supabase } from '../lib/supabase';

// ── helpers ─────────────────────────────────────────────────────────────────
const HAS_SUPABASE =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

// snake_case DB rows → camelCase TS types
function rowToUser(r: Record<string, unknown>): User {
  return {
    id:          r.id as string,
    name:        (r.name as string) ?? '',
    email:       (r.email as string) ?? '',
    role:        (r.role as User['role']) ?? 'buyer',
    avatar:      (r.avatar as string) ?? '',
    bio:         (r.bio as string) ?? '',
    city:        (r.city as string) ?? '',
    rating:      Number(r.rating ?? 0),
    reviewCount: Number(r.review_count ?? 0),
    joinedAt:    (r.joined_at as string)?.slice(0, 10) ?? '',
    specialties: (r.specialties as string[]) ?? [],
    verified:    Boolean(r.verified),
    salesCount:  Number(r.sales_count ?? 0),
  };
}

function rowToEvent(r: Record<string, unknown>): Event {
  return {
    id:               r.id as string,
    title:            (r.title as string) ?? '',
    description:      (r.description as string) ?? '',
    type:             (r.type as Event['type']) ?? 'mercatino',
    sellerId:         (r.seller_id as string) ?? '',
    address:          (r.address as string) ?? '',
    city:             (r.city as string) ?? '',
    date:             (r.date as string) ?? '',
    endDate:          (r.end_date as string | undefined) ?? undefined,
    timeStart:        (r.time_start as string) ?? '',
    timeEnd:          (r.time_end as string) ?? '',
    image:            (r.image as string) ?? '',
    tags:             [],
    status:           (r.status as Event['status']) ?? 'upcoming',
    productsCount:    Number(r.products_count ?? 0),
    maxAttendees:     r.max_attendees != null ? Number(r.max_attendees) : undefined,
    currentAttendees: Number(r.current_attendees ?? 0),
    price:            0,
    featured:         Boolean(r.featured),
    slotMaxCapacity:  r.slot_max_capacity != null ? Number(r.slot_max_capacity) : undefined,
  };
}

function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id:            r.id as string,
    title:         (r.title as string) ?? '',
    description:   (r.description as string) ?? '',
    price:         Number(r.price ?? 0),
    originalPrice: r.original_price != null ? Number(r.original_price) : undefined,
    category:      (r.category as string) ?? '',
    subcategory:   (r.subcategory as string | undefined) ?? undefined,
    condition:     (r.condition as Product['condition']) ?? 'buono',
    images:        (r.images as string[]) ?? [],
    sellerId:      (r.seller_id as string) ?? '',
    eventId:       (r.event_id as string | undefined) ?? undefined,
    tags:          (r.tags as string[]) ?? [],
    era:           (r.era as string | undefined) ?? undefined,
    brand:         (r.brand as string | undefined) ?? undefined,
    dimensions:    (r.dimensions as string | undefined) ?? undefined,
    material:      (r.material as string | undefined) ?? undefined,
    status:        (r.status as Product['status']) ?? 'available',
    featured:      Boolean(r.featured),
    views:         Number(r.views ?? 0),
    saves:         0,
    createdAt:     (r.created_at as string)?.slice(0, 10) ?? '',
  };
}

function rowToSlot(r: Record<string, unknown>): TimeSlot {
  return {
    id:          r.id as string,
    eventId:     (r.event_id as string) ?? '',
    startTime:   (r.start_time as string) ?? '',
    endTime:     (r.end_time as string) ?? '',
    maxCapacity: Number(r.max_capacity ?? 4),
    disabled:    Boolean(r.disabled),
    bookings:    [],
  };
}

// ── State ────────────────────────────────────────────────────────────────────
interface State {
  user:         User | null;
  users:        User[];
  products:     Product[];
  events:       Event[];
  orders:       Order[];
  cart:         CartItem[];
  wishlist:     string[];
  isAuthOpen:   boolean;
  authMode:     'login' | 'register';
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  slots:        Record<string, TimeSlot[]>;
  loading:      boolean;
  authLoading:  boolean;  // true finché il profilo DB non è caricato dopo onAuthStateChange
  eventFee:     number;   // quota che il venditore paga per pubblicare un evento
}

type Action =
  | { type: 'LOGIN';  payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User }
  | { type: 'OPEN_AUTH';  mode: 'login' | 'register' }
  | { type: 'CLOSE_AUTH' }
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'INIT_DATA'; users: User[]; products: Product[]; events: Event[]; slots: Record<string, TimeSlot[]> }
  | { type: 'SET_WISHLIST'; ids: string[] }
  | { type: 'SET_ORDERS'; orders: Order[] }
  // Products
  | { type: 'ADD_PRODUCT';    product:   Product }
  | { type: 'UPDATE_PRODUCT'; product:   Product }
  | { type: 'DELETE_PRODUCT'; productId: string  }
  // Events
  | { type: 'ADD_EVENT';    event:   Event  }
  | { type: 'UPDATE_EVENT'; event:   Event  }
  | { type: 'DELETE_EVENT'; eventId: string }
  // Cart
  | { type: 'ADD_TO_CART';     product: Product }
  | { type: 'REMOVE_FROM_CART'; productId: string }
  | { type: 'UPDATE_QUANTITY';  productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  // Orders
  | { type: 'PLACE_ORDER'; order: Order }
  | { type: 'UPDATE_ORDER_STATUS'; orderId: string; status: Order['status'] }
  // Wishlist
  | { type: 'TOGGLE_WISHLIST'; productId: string }
  // Notify
  | { type: 'NOTIFY';       message: string; notifType: 'success' | 'error' | 'info' }
  | { type: 'CLEAR_NOTIFY' }
  // Slots
  | { type: 'BOOK_SLOT';           eventId: string; slotId: string }
  | { type: 'CANCEL_BOOKING';      eventId: string; slotId: string }
  | { type: 'SET_SLOT_CAPACITY';   eventId: string; slotId: string; capacity: number }
  | { type: 'TOGGLE_SLOT_DISABLED';eventId: string; slotId: string }
  | { type: 'INIT_EVENT_SLOTS';    eventId: string; timeStart: string; timeEnd: string; capacity: number }
  | { type: 'SET_EVENT_FEE'; fee: number }
  | { type: 'SET_AUTH_LOADING'; value: boolean };

const initialState: State = {
  user:         null,
  users:        HAS_SUPABASE ? [] : USERS,
  products:     HAS_SUPABASE ? [] : PRODUCTS,
  events:       HAS_SUPABASE ? [] : EVENTS,
  orders:       [],
  cart:         [],
  wishlist:     [],
  isAuthOpen:   false,
  authMode:     'login',
  notification: null,
  slots:        HAS_SUPABASE ? {} : INITIAL_SLOTS,
  loading:      HAS_SUPABASE,
  authLoading:  HAS_SUPABASE,  // aspetta fino al primo onAuthStateChange
  eventFee:     0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthOpen: false };
    case 'LOGOUT':
      return { ...state, user: null, wishlist: [], orders: [] };
    case 'REGISTER': {
      const exists = state.users.find(u => u.email === action.payload.email);
      if (exists) return state;
      return { ...state, users: [...state.users, action.payload], user: action.payload, isAuthOpen: false };
    }
    case 'OPEN_AUTH':   return { ...state, isAuthOpen: true, authMode: action.mode };
    case 'CLOSE_AUTH':  return { ...state, isAuthOpen: false };
    case 'SET_LOADING': return { ...state, loading: action.value };
    case 'INIT_DATA':
      return { ...state, users: action.users, products: action.products, events: action.events, slots: action.slots, loading: false };
    case 'SET_EVENT_FEE':
      return { ...state, eventFee: action.fee };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.value };
    case 'SET_WISHLIST': return { ...state, wishlist: action.ids };
    case 'SET_ORDERS':   return { ...state, orders: action.orders };

    // ── Products ──
    case 'ADD_PRODUCT':
      return { ...state, products: [action.product, ...state.products] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.product.id ? action.product : p) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.productId) };

    // ── Events ──
    case 'ADD_EVENT':
      return { ...state, events: [action.event, ...state.events] };
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map(e => e.id === action.event.id ? action.event : e) };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(e => e.id !== action.eventId) };

    // ── Cart ──
    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => i.product.id === action.product.id);
      if (existing) {
        return { ...state, cart: state.cart.map(i => i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { ...state, cart: [...state.cart, { product: action.product, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => i.product.id !== action.productId) };
    case 'UPDATE_QUANTITY':
      return { ...state, cart: state.cart.map(i => i.product.id === action.productId ? { ...i, quantity: action.quantity } : i) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };

    // ── Orders ──
    case 'PLACE_ORDER':
      return { ...state, orders: [action.order, ...state.orders], cart: [] };
    case 'UPDATE_ORDER_STATUS':
      return { ...state, orders: state.orders.map(o => o.id === action.orderId ? { ...o, status: action.status } : o) };

    // ── Wishlist ──
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.productId)
          ? state.wishlist.filter(id => id !== action.productId)
          : [...state.wishlist, action.productId],
      };

    // ── Notify ──
    case 'NOTIFY':      return { ...state, notification: { message: action.message, type: action.notifType } };
    case 'CLEAR_NOTIFY': return { ...state, notification: null };

    // ── Slots ──
    case 'BOOK_SLOT': {
      if (!state.user) return state;
      const eventSlots = state.slots[action.eventId] ?? [];
      const updated = eventSlots.map(slot => {
        if (slot.id !== action.slotId) return slot;
        if (slot.bookings.length >= slot.maxCapacity) return slot;
        if (slot.bookings.some(b => b.userId === state.user!.id)) return slot;
        return {
          ...slot,
          bookings: [...slot.bookings, {
            id: `bk_${slot.id}_${Date.now()}`,
            slotId: slot.id,
            eventId: action.eventId,
            userId: state.user!.id,
            userName: state.user!.name,
            userAvatar: state.user!.avatar,
            createdAt: new Date().toISOString(),
          }],
        };
      });
      return { ...state, slots: { ...state.slots, [action.eventId]: updated } };
    }
    case 'CANCEL_BOOKING': {
      if (!state.user) return state;
      const eventSlots = state.slots[action.eventId] ?? [];
      const updated = eventSlots.map(slot =>
        slot.id !== action.slotId ? slot : { ...slot, bookings: slot.bookings.filter(b => b.userId !== state.user!.id) }
      );
      return { ...state, slots: { ...state.slots, [action.eventId]: updated } };
    }
    case 'SET_SLOT_CAPACITY': {
      const eventSlots = state.slots[action.eventId] ?? [];
      const updated = eventSlots.map(s => s.id === action.slotId ? { ...s, maxCapacity: Math.max(1, action.capacity) } : s);
      return { ...state, slots: { ...state.slots, [action.eventId]: updated } };
    }
    case 'TOGGLE_SLOT_DISABLED': {
      const eventSlots = state.slots[action.eventId] ?? [];
      const updated = eventSlots.map(s => s.id === action.slotId ? { ...s, disabled: !s.disabled } : s);
      return { ...state, slots: { ...state.slots, [action.eventId]: updated } };
    }
    case 'INIT_EVENT_SLOTS': {
      const newSlots = generateSlots(action.eventId, action.timeStart, action.timeEnd, action.capacity);
      return { ...state, slots: { ...state.slots, [action.eventId]: newSlots } };
    }

    default: return state;
  }
}

// ── Context interface ────────────────────────────────────────────────────────
interface ContextValue {
  state: State;
  // Auth — returns null on success, error string on failure
  login:    (email: string, password: string) => Promise<string | null>;
  logout:   () => void;
  register: (name: string, email: string, password: string, city: string, role: User['role']) => Promise<string | null>;
  openAuth:  (mode: 'login' | 'register') => void;
  closeAuth: () => void;
  // Products
  addProduct:    (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  // Events
  addEvent:    (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
  // Cart
  addToCart:      (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart:      () => void;
  // Orders
  placeOrder: (address: string, city: string) => Promise<Order | null>;
  // Wishlist
  toggleWishlist: (productId: string) => void;
  // Notify
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  // Slots
  bookSlot:           (eventId: string, slotId: string) => void;
  cancelBooking:      (eventId: string, slotId: string) => void;
  setSlotCapacity:    (eventId: string, slotId: string, capacity: number) => void;
  toggleSlotDisabled: (eventId: string, slotId: string) => void;
  initEventSlots:     (eventId: string, timeStart: string, timeEnd: string, capacity: number) => void;
  getUserBookedSlot:  (eventId: string) => TimeSlot | null;
  // Admin
  updateEventFee: (fee: number) => Promise<void>;
  // Computed
  cartCount: number;
  cartTotal: number;
}

const AppContext = createContext<ContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Keep a ref to state so async callbacks see the latest value
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Supabase bootstrap ────────────────────────────────────────────────────
  useEffect(() => {
    if (!HAS_SUPABASE) return;

    // Safety net: if data never loads (network error, bad credentials, etc.)
    // force loading:false after 6 seconds so the app doesn't hang forever.
    const loadingTimeout = setTimeout(() => {
      if (stateRef.current.loading) {
        console.warn('Supabase loadData timeout — forcing loading:false');
        dispatch({ type: 'INIT_DATA', users: [], products: [], events: [], slots: {} });
      }
    }, 6000);

    // 1. Load public data (products, events, profiles, slots, bookings)
    const loadData = async () => {
      // Run all queries concurrently; each returns {data, error} — never throws.
      const [eventsRes, productsRes, profilesRes, slotsRes, bookingsRes, settingsRes] = await Promise.all([
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('time_slots').select('*'),
        // Simple bookings query — no join, avoid permission issues with anon users
        supabase.from('bookings').select('id, slot_id, event_id, user_id, created_at'),
        supabase.from('app_settings').select('key, value'),
      ]);

      // Log individual query errors without aborting
      if (eventsRes.error)   console.error('load events:',   eventsRes.error.message);
      if (productsRes.error) console.error('load products:', productsRes.error.message);
      if (profilesRes.error) console.error('load profiles:', profilesRes.error.message);
      if (slotsRes.error)    console.error('load slots:',    slotsRes.error.message);
      if (bookingsRes.error) console.error('load bookings:', bookingsRes.error.message);
      if (settingsRes.error) console.error('load settings:', settingsRes.error.message);

      const events   = (eventsRes.data   ?? []).map(rowToEvent);
      const products = (productsRes.data ?? []).map(rowToProduct);
      const users    = (profilesRes.data ?? []).map(rowToUser);

      // Build bookings map: slotId → bookings array
      type ProfileRef = { name?: string; avatar?: string } | { name?: string; avatar?: string }[] | null;
      type BookingRow = { id: string; slot_id: string; event_id: string; user_id: string; created_at: string; profiles?: ProfileRef };
      const bookingsBySlot: Record<string, TimeSlot['bookings']> = {};
      for (const b of ((bookingsRes.data ?? []) as unknown as BookingRow[])) {
        const slotId = b.slot_id;
        if (!bookingsBySlot[slotId]) bookingsBySlot[slotId] = [];
        // profiles may be a single object or array (Supabase join)
        const prof = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
        bookingsBySlot[slotId].push({
          id:          b.id,
          slotId,
          eventId:     b.event_id,
          userId:      b.user_id,
          userName:    prof?.name ?? '',
          userAvatar:  prof?.avatar ?? '',
          createdAt:   b.created_at,
        });
      }

      // Group slots by eventId, attach bookings
      const slots: Record<string, TimeSlot[]> = {};
      for (const row of (slotsRes.data ?? [])) {
        const slot = rowToSlot(row as Record<string, unknown>);
        slot.bookings = bookingsBySlot[slot.id] ?? [];
        if (!slots[slot.eventId]) slots[slot.eventId] = [];
        slots[slot.eventId].push(slot);
      }

      // Load app settings (e.g. event_fee)
      const feeRow = (settingsRes.data ?? []).find((r: Record<string, unknown>) => r.key === 'event_fee');
      if (feeRow) dispatch({ type: 'SET_EVENT_FEE', fee: Number(feeRow.value) });

      dispatch({ type: 'INIT_DATA', users, products, events, slots });
      clearTimeout(loadingTimeout);
    };

    // Always clear loading even on catastrophic failure
    loadData().catch(err => {
      console.error('loadData fatal:', err);
      dispatch({ type: 'INIT_DATA', users: [], products: [], events: [], slots: {} });
      clearTimeout(loadingTimeout);
    });

    // 2. Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const su = session.user;
        const meta = (su.user_metadata ?? {}) as Record<string, unknown>;

        // Mark auth as loading — the role from metadata may be stale (e.g. if admin
        // role was set directly in the DB after registration). We must NOT redirect
        // role-protected pages until the real profile arrives from the DB.
        dispatch({ type: 'SET_AUTH_LOADING', value: true });

        // Dispatch a tempUser from session metadata immediately so the UI
        // is responsive (navbar, avatar) while the profile query runs.
        // Role-protected pages (AdminDashboard) will wait for authLoading:false.
        const tempUser: User = {
          id:          su.id,
          name:        (meta.name as string) || su.email?.split('@')[0] || '',
          email:       su.email ?? '',
          role:        (meta.role as User['role']) ?? 'buyer',
          city:        (meta.city as string) ?? '',
          avatar:      `https://ui-avatars.com/api/?name=${encodeURIComponent((meta.name as string) || su.email || '')}&background=8B6A3E&color=FAF7F2&size=200`,
          bio:         '',
          rating:      0,
          reviewCount: 0,
          joinedAt:    su.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          specialties: [],
          verified:    false,
          salesCount:  0,
        };
        if (stateRef.current.user?.id !== su.id) {
          dispatch({ type: 'LOGIN', payload: tempUser });
        }

        // Load the real profile from DB — this is the source of truth for role
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', su.id)
          .single();

        if (profile) {
          dispatch({ type: 'LOGIN', payload: rowToUser(profile as Record<string, unknown>) });
        }

        // Auth is now resolved — role-protected pages can evaluate their guard
        dispatch({ type: 'SET_AUTH_LOADING', value: false });

        // Load user-specific data (wishlist + orders) in parallel
        const [wishRes, ordersRes] = await Promise.all([
          supabase.from('wishlists').select('product_id').eq('user_id', su.id),
          supabase.from('orders').select('*, order_items(*)').eq('user_id', su.id).order('created_at', { ascending: false }),
        ]);

        dispatch({ type: 'SET_WISHLIST', ids: (wishRes.data ?? []).map((w: Record<string, unknown>) => w.product_id as string) });

        const orders: Order[] = (ordersRes.data ?? []).map((o: Record<string, unknown>) => ({
          id:        o.id as string,
          userId:    o.user_id as string,
          status:    o.status as Order['status'],
          total:     Number(o.total),
          subtotal:  o.subtotal != null ? Number(o.subtotal) : Number(o.total),
          shipping:  o.shipping != null ? Number(o.shipping) : 0,
          address:   o.address as string,
          city:      o.city as string,
          createdAt: (o.created_at as string)?.slice(0, 10) ?? '',
          items:     ((o.order_items as Record<string, unknown>[]) ?? []).map((item: Record<string, unknown>) => ({
            product: {
              id:          item.product_id as string,
              title:       item.title as string,
              price:       Number(item.price),
              images:      [item.image as string],
              sellerId:    (item.seller_id as string) ?? '',
              description: '',
              category:    '',
              condition:   'buono' as const,
              tags:        [],
              status:      'sold' as const,
              featured:    false,
              views:       0,
              saves:       0,
              createdAt:   '',
            },
            quantity: 1,
          })),
        }));
        dispatch({ type: 'SET_ORDERS', orders });
      } else {
        // No session (SIGNED_OUT or no user) — auth check complete
        dispatch({ type: 'SET_AUTH_LOADING', value: false });
        if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<string | null> => {
    if (!HAS_SUPABASE) {
      const user = stateRef.current.users.find(u => u.email === email && (u as unknown as Record<string,unknown>).password === password);
      if (user) { dispatch({ type: 'LOGIN', payload: user }); return null; }
      return 'Email o password non corretti.';
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    if (!data.user) return 'Login fallito. Riprova.';

    // Dispatch an immediate tempUser built from auth metadata so the UI
    // is usable right away — no extra DB round-trip inside login().
    // onAuthStateChange fires next and overwrites with the full profile row.
    const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const tempUser: User = {
      id:          data.user.id,
      name:        (meta.name as string) || email.split('@')[0],
      email:       data.user.email ?? email,
      role:        (meta.role as User['role']) ?? 'buyer',
      city:        (meta.city as string) ?? '',
      avatar:      `https://ui-avatars.com/api/?name=${encodeURIComponent((meta.name as string) || email)}&background=8B6A3E&color=FAF7F2&size=200`,
      bio:         '',
      rating:      0,
      reviewCount: 0,
      joinedAt:    data.user.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      specialties: [],
      verified:    false,
      salesCount:  0,
    };
    dispatch({ type: 'LOGIN', payload: tempUser });

    // Load full profile in background (updates avatar, rating, etc.)
    void supabase.from('profiles').select('*').eq('id', data.user.id).single()
      .then(({ data: profile }) => {
        if (profile) dispatch({ type: 'LOGIN', payload: rowToUser(profile as Record<string, unknown>) });
      });

    return null;
  };

  const logout = () => {
    if (HAS_SUPABASE) supabase.auth.signOut().catch(console.error);
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (
    name: string, email: string, password: string, city: string, role: User['role']
  ): Promise<string | null> => {
    if (!HAS_SUPABASE) {
      if (stateRef.current.users.find(u => u.email === email)) return 'Email già registrata.';
      const newUser: User = {
        id:          `u_${Date.now()}`,
        name, email, role, city,
        avatar:      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B6A3E&color=FAF7F2&size=200`,
        bio:         '',
        rating:      0,
        reviewCount: 0,
        joinedAt:    new Date().toISOString().slice(0, 10),
        specialties: [],
        verified:    false,
        salesCount:  0,
      };
      dispatch({ type: 'REGISTER', payload: newUser });
      return null;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, city, role } },
    });
    if (error) return error.message;

    // Pre-populate user in state immediately (mailer_autoconfirm is enabled).
    // onAuthStateChange will overwrite with the real profile row once the
    // DB trigger has created it.
    if (data.user) {
      const tempUser: User = {
        id:          data.user.id,
        name,
        email,
        role,
        city,
        avatar:      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B6A3E&color=FAF7F2&size=200`,
        bio:         '',
        rating:      0,
        reviewCount: 0,
        joinedAt:    new Date().toISOString().slice(0, 10),
        specialties: [],
        verified:    false,
        salesCount:  0,
      };
      dispatch({ type: 'LOGIN', payload: tempUser });
    }
    return null;
  };

  const openAuth  = (mode: 'login' | 'register') => dispatch({ type: 'OPEN_AUTH', mode });
  const closeAuth = () => dispatch({ type: 'CLOSE_AUTH' });

  // ── helper: show error toast + rollback ──────────────────────────────────
  const notifyErr = (msg: string) => {
    dispatch({ type: 'NOTIFY', message: msg, notifType: 'error' });
    setTimeout(() => dispatch({ type: 'CLEAR_NOTIFY' }), 4000);
  };

  // ── Products ──────────────────────────────────────────────────────────────
  const addProduct = (product: Product) => {
    dispatch({ type: 'ADD_PRODUCT', product });
    if (!HAS_SUPABASE) return;
    supabase.from('products').insert({
      id:             product.id,
      seller_id:      product.sellerId,
      event_id:       product.eventId ?? null,
      title:          product.title,
      description:    product.description,
      category:       product.category,
      subcategory:    product.subcategory ?? null,
      condition:      product.condition,
      era:            product.era ?? null,
      brand:          product.brand ?? null,
      material:       product.material ?? null,
      dimensions:     product.dimensions ?? null,
      images:         product.images,
      tags:           product.tags,
      price:          product.price,
      original_price: product.originalPrice ?? null,
      status:         product.status,
      featured:       product.featured,
    }).then(({ error }) => {
      if (error) {
        console.error('addProduct:', error);
        dispatch({ type: 'DELETE_PRODUCT', productId: product.id });
        notifyErr(`Errore nel salvataggio del prodotto: ${error.message}`);
      }
    });
  };

  const updateProduct = (product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', product });
    if (!HAS_SUPABASE) return;
    supabase.from('products').update({
      title:          product.title,
      description:    product.description,
      category:       product.category,
      subcategory:    product.subcategory ?? null,
      condition:      product.condition,
      era:            product.era ?? null,
      brand:          product.brand ?? null,
      material:       product.material ?? null,
      dimensions:     product.dimensions ?? null,
      images:         product.images,
      tags:           product.tags,
      price:          product.price,
      original_price: product.originalPrice ?? null,
      status:         product.status,
      featured:       product.featured,
      event_id:       product.eventId ?? null,
    }).eq('id', product.id).then(({ error }) => {
      if (error) {
        console.error('updateProduct:', error);
        notifyErr(`Errore nell'aggiornamento del prodotto: ${error.message}`);
      }
    });
  };

  const deleteProduct = (productId: string) => {
    dispatch({ type: 'DELETE_PRODUCT', productId });
    if (!HAS_SUPABASE) return;
    supabase.from('products').delete().eq('id', productId)
      .then(({ error }) => {
        if (error) {
          console.error('deleteProduct:', error);
          notifyErr(`Errore nell'eliminazione del prodotto: ${error.message}`);
        }
      });
  };

  // ── Events ────────────────────────────────────────────────────────────────
  const addEvent = (event: Event) => {
    dispatch({ type: 'ADD_EVENT', event });
    if (!HAS_SUPABASE) return;
    supabase.from('events').insert({
      id:                event.id,
      seller_id:         event.sellerId,
      title:             event.title,
      description:       event.description,
      type:              event.type,
      status:            event.status,
      date:              event.date,
      end_date:          event.endDate ?? null,
      time_start:        event.timeStart,
      time_end:          event.timeEnd,
      city:              event.city,
      address:           event.address,
      image:             event.image,
      products_count:    event.productsCount,
      max_attendees:     event.maxAttendees ?? null,
      current_attendees: event.currentAttendees,
      featured:          event.featured,
      slot_max_capacity: event.slotMaxCapacity ?? null,
    }).then(({ error }) => {
      if (error) {
        console.error('addEvent:', error);
        dispatch({ type: 'DELETE_EVENT', eventId: event.id });
        notifyErr(`Errore nel salvataggio dell'evento: ${error.message}`);
      }
    });
  };

  const updateEvent = (event: Event) => {
    dispatch({ type: 'UPDATE_EVENT', event });
    if (!HAS_SUPABASE) return;
    supabase.from('events').update({
      title:             event.title,
      description:       event.description,
      type:              event.type,
      status:            event.status,
      date:              event.date,
      end_date:          event.endDate ?? null,
      time_start:        event.timeStart,
      time_end:          event.timeEnd,
      city:              event.city,
      address:           event.address,
      image:             event.image,
      products_count:    event.productsCount,
      max_attendees:     event.maxAttendees ?? null,
      current_attendees: event.currentAttendees,
      featured:          event.featured,
      slot_max_capacity: event.slotMaxCapacity ?? null,
    }).eq('id', event.id).then(({ error }) => {
      if (error) {
        console.error('updateEvent:', error);
        notifyErr(`Errore nell'aggiornamento dell'evento: ${error.message}`);
      }
    });
  };

  const deleteEvent = (eventId: string) => {
    dispatch({ type: 'DELETE_EVENT', eventId });
    if (!HAS_SUPABASE) return;
    supabase.from('events').delete().eq('id', eventId)
      .then(({ error }) => {
        if (error) {
          console.error('deleteEvent:', error);
          notifyErr(`Errore nell'eliminazione dell'evento: ${error.message}`);
        }
      });
  };

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart      = (product: Product)            => dispatch({ type: 'ADD_TO_CART', product });
  const removeFromCart = (productId: string)           => dispatch({ type: 'REMOVE_FROM_CART', productId });
  const updateQuantity = (productId: string, qty: number) => dispatch({ type: 'UPDATE_QUANTITY', productId, quantity: qty });
  const clearCart      = ()                            => dispatch({ type: 'CLEAR_CART' });

  // ── Orders ────────────────────────────────────────────────────────────────
  const cartTotal = state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);

  const placeOrder = async (address: string, city: string): Promise<Order | null> => {
    const s = stateRef.current;
    if (!s.user || s.cart.length === 0) return null;
    // Use stateRef cart to avoid stale closure on cartTotal
    const subtotal = s.cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 8.9;
    const orderId  = `ord_${Date.now()}`;
    const order: Order = {
      id:        orderId,
      userId:    s.user.id,
      items:     [...s.cart],
      subtotal,
      shipping,
      total:     subtotal + shipping,
      status:    'confermato',
      address,
      city,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    dispatch({ type: 'PLACE_ORDER', order });

    if (!HAS_SUPABASE) return order;

    // Persist to Supabase
    const { error: orderErr } = await supabase.from('orders').insert({
      id:       orderId,
      user_id:  s.user.id,
      status:   'confermato',
      total:    order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      address,
      city,
    });
    if (orderErr) {
      console.error('placeOrder (orders):', orderErr);
      // Rollback optimistic dispatch
      dispatch({ type: 'NOTIFY', message: `Errore nell\'ordine: ${orderErr.message}`, notifType: 'error' });
      setTimeout(() => dispatch({ type: 'CLEAR_NOTIFY' }), 4000);
      return null;
    }

    const ts = Date.now();
    const itemRows = s.cart.map((item, idx) => ({
      id:          `oi_${ts}_${idx}`,
      order_id:    orderId,
      product_id:  item.product.id,
      title:       item.product.title,
      price:       item.product.price,
      image:       item.product.images[0] ?? '',
      seller_id:   item.product.sellerId,
      seller_name: s.users.find(u => u.id === item.product.sellerId)?.name ?? '',
    }));
    const { error: itemsErr } = await supabase.from('order_items').insert(itemRows);
    if (itemsErr) console.error('placeOrder (items):', itemsErr);

    return order;
  };

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const toggleWishlist = (productId: string) => {
    dispatch({ type: 'TOGGLE_WISHLIST', productId });
    if (!HAS_SUPABASE || !stateRef.current.user) return;
    const uid = stateRef.current.user.id;
    const isCurrentlyWishlisted = stateRef.current.wishlist.includes(productId);
    if (isCurrentlyWishlisted) {
      supabase.from('wishlists').delete().match({ user_id: uid, product_id: productId })
        .then(({ error }) => { if (error) console.error('wishlist remove:', error); });
    } else {
      supabase.from('wishlists').insert({ user_id: uid, product_id: productId })
        .then(({ error }) => { if (error) console.error('wishlist add:', error); });
    }
  };

  // ── Notify ────────────────────────────────────────────────────────────────
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch({ type: 'NOTIFY', message, notifType: type });
    setTimeout(() => dispatch({ type: 'CLEAR_NOTIFY' }), 3500);
  };

  // ── Slots ─────────────────────────────────────────────────────────────────
  const bookSlot = (eid: string, sid: string) => {
    dispatch({ type: 'BOOK_SLOT', eventId: eid, slotId: sid });
    if (!HAS_SUPABASE || !stateRef.current.user) return;
    const user = stateRef.current.user;
    const bookingId = `bk_${sid}_${Date.now()}`;
    supabase.from('bookings').insert({
      id:       bookingId,
      slot_id:  sid,
      event_id: eid,
      user_id:  user.id,
      status:   'confirmed',
    }).then(({ error }) => {
      if (error) {
        console.error('bookSlot:', error);
        dispatch({ type: 'CANCEL_BOOKING', eventId: eid, slotId: sid });
        notifyErr(`Errore nella prenotazione: ${error.message}`);
      } else {
        // Sync booked counter: count bookings for this slot
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('slot_id', sid)
          .then(({ count }) => {
            if (count != null) {
              supabase.from('time_slots').update({ booked: count }).eq('id', sid).then(() => {});
            }
          });
      }
    });
  };

  const cancelBooking = (eid: string, sid: string) => {
    dispatch({ type: 'CANCEL_BOOKING', eventId: eid, slotId: sid });
    if (!HAS_SUPABASE || !stateRef.current.user) return;
    const uid = stateRef.current.user.id;
    supabase.from('bookings').delete()
      .match({ slot_id: sid, user_id: uid })
      .then(({ error }) => {
        if (error) {
          console.error('cancelBooking:', error);
          notifyErr(`Errore nella cancellazione: ${error.message}`);
        }
      });
  };

  const setSlotCapacity    = (eid: string, sid: string, cap: number) => dispatch({ type: 'SET_SLOT_CAPACITY',    eventId: eid, slotId: sid, capacity: cap });

  const toggleSlotDisabled = (eid: string, sid: string) => {
    dispatch({ type: 'TOGGLE_SLOT_DISABLED', eventId: eid, slotId: sid });
    if (!HAS_SUPABASE) return;
    // Read current disabled state and toggle in DB
    const current = stateRef.current.slots[eid]?.find(s => s.id === sid);
    if (!current) return;
    const newDisabled = !current.disabled;
    supabase.from('time_slots').update({ disabled: newDisabled }).eq('id', sid)
      .then(({ error }) => { if (error) console.error('toggleSlotDisabled:', error); });
  };

  const initEventSlots = (eid: string, ts: string, te: string, cap: number) => {
    dispatch({ type: 'INIT_EVENT_SLOTS', eventId: eid, timeStart: ts, timeEnd: te, capacity: cap });
    if (!HAS_SUPABASE) return;
    // Persist generated slots to DB (do after reducer has generated them via generateSlots logic)
    // Re-generate the same slots client-side to get the IDs
    const generated = generateSlots(eid, ts, te, cap);
    if (generated.length === 0) return;
    const rows = generated.map(slot => ({
      id:           slot.id,
      event_id:     eid,
      start_time:   slot.startTime,
      end_time:     slot.endTime,
      max_capacity: slot.maxCapacity,
      disabled:     false,
    }));
    supabase.from('time_slots')
      .upsert(rows, { onConflict: 'id' })
      .then(({ error }) => { if (error) console.error('initEventSlots:', error); });
  };

  // ── Admin ─────────────────────────────────────────────────────────────────
  const updateEventFee = async (fee: number): Promise<void> => {
    dispatch({ type: 'SET_EVENT_FEE', fee });
    if (!HAS_SUPABASE) return;
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'event_fee', value: String(fee) }, { onConflict: 'key' });
    if (error) {
      console.error('updateEventFee:', error);
      notifyErr(`Errore nel salvataggio della quota: ${error.message}`);
    }
  };

  const getUserBookedSlot = (eventId: string): TimeSlot | null => {
    if (!state.user) return null;
    return state.slots[eventId]?.find(s => s.bookings.some(b => b.userId === state.user!.id)) ?? null;
  };

  return (
    <AppContext.Provider value={{
      state, login, logout, register, openAuth, closeAuth,
      addProduct, updateProduct, deleteProduct,
      addEvent, updateEvent, deleteEvent,
      addToCart, removeFromCart, updateQuantity, clearCart,
      placeOrder, toggleWishlist, notify, cartCount, cartTotal,
      bookSlot, cancelBooking, setSlotCapacity, toggleSlotDisabled,
      initEventSlots, getUserBookedSlot, updateEventFee,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
