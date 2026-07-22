import {
  createContext, useContext, useReducer, useEffect,
  ReactNode, useRef,
} from 'react';
import { User, Product, CartItem, TimeSlot, Order, Event, PendingFee, FeeCartItem } from '../types';
import { USERS, PRODUCTS, EVENTS, INITIAL_SLOTS, generateSlots } from '../data/mockData';
import { supabase, supabasePublic } from '../lib/supabase';

// ── helpers ─────────────────────────────────────────────────────────────────
const HAS_SUPABASE =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

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
    tags:             (r.tags as string[]) ?? [],
    status:           (r.status as Event['status']) ?? 'upcoming',
    productsCount:    Number(r.products_count ?? 0),
    maxAttendees:     r.max_attendees != null ? Number(r.max_attendees) : undefined,
    currentAttendees: Number(r.current_attendees ?? 0),
    price:            Number(r.price ?? 0),
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
    saves:         Number(r.saves ?? 0),
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

function rowToPendingFee(r: Record<string, unknown>, usersMap?: Record<string, string>): PendingFee {
  return {
    id:             r.id as string,
    type:           r.type as PendingFee['type'],
    sellerId:       r.seller_id as string,
    sellerName:     usersMap ? (usersMap[r.seller_id as string] ?? '—') : undefined,
    referenceId:    r.reference_id as string,
    referenceTitle: (r.reference_title as string) ?? '',
    amount:         Number(r.amount ?? 0),
    status:         (r.status as PendingFee['status']) ?? 'pending',
    createdAt:      (r.created_at as string)?.slice(0, 10) ?? '',
    paidAt:         (r.paid_at as string | undefined) ?? undefined,
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
  feeCart:      FeeCartItem[];   // quote servizi da pagare (pubbl. evento, evidenza)
  wishlist:     string[];
  isAuthOpen:   boolean;
  authMode:     'login' | 'register';
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  slots:        Record<string, TimeSlot[]>;
  loading:      boolean;
  authLoading:  boolean;
  eventFee:     number;
  featureFee:   number;
  pendingFees:  PendingFee[];
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
  | { type: 'SET_PENDING_FEES'; fees: PendingFee[] }
  | { type: 'ADD_PENDING_FEE'; fee: PendingFee }
  | { type: 'UPDATE_PENDING_FEE'; id: string; status: PendingFee['status']; paidAt?: string }
  // Fee cart
  | { type: 'ADD_TO_FEE_CART';      item: FeeCartItem }
  | { type: 'REMOVE_FROM_FEE_CART'; itemId: string }
  | { type: 'CLEAR_FEE_CART' }
  // Products
  | { type: 'ADD_PRODUCT';    product:   Product }
  | { type: 'UPDATE_PRODUCT'; product:   Product }
  | { type: 'DELETE_PRODUCT'; productId: string  }
  | { type: 'MARK_PRODUCTS_SOLD'; productIds: string[] }
  // Events
  | { type: 'ADD_EVENT';    event:   Event  }
  | { type: 'UPDATE_EVENT'; event:   Event  }
  | { type: 'DELETE_EVENT'; eventId: string }
  // Cart
  | { type: 'ADD_TO_CART';      product:  Product }
  | { type: 'REMOVE_FROM_CART'; productId: string }
  | { type: 'UPDATE_QUANTITY';  productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  // Orders
  | { type: 'PLACE_ORDER'; order: Order }
  | { type: 'UPDATE_ORDER_STATUS'; orderId: string; status: Order['status'] }
  // Wishlist
  | { type: 'TOGGLE_WISHLIST'; productId: string }
  // Notify
  | { type: 'NOTIFY';      message: string; notifType: 'success' | 'error' | 'info' }
  | { type: 'CLEAR_NOTIFY' }
  // Slots
  | { type: 'BOOK_SLOT';            eventId: string; slotId: string }
  | { type: 'CANCEL_BOOKING';       eventId: string; slotId: string }
  | { type: 'SET_SLOT_CAPACITY';    eventId: string; slotId: string; capacity: number }
  | { type: 'TOGGLE_SLOT_DISABLED'; eventId: string; slotId: string }
  | { type: 'INIT_EVENT_SLOTS';     eventId: string; timeStart: string; timeEnd: string; capacity: number }
  | { type: 'SET_EVENT_FEE';   fee: number }
  | { type: 'SET_FEATURE_FEE'; fee: number }
  | { type: 'SET_AUTH_LOADING'; value: boolean };

const initialState: State = {
  user:         null,
  users:        HAS_SUPABASE ? [] : USERS,
  products:     HAS_SUPABASE ? [] : PRODUCTS,
  events:       HAS_SUPABASE ? [] : EVENTS,
  orders:       [],
  cart:         [],
  feeCart:      [],
  wishlist:     [],
  isAuthOpen:   false,
  authMode:     'login',
  notification: null,
  slots:        HAS_SUPABASE ? {} : INITIAL_SLOTS,
  loading:      HAS_SUPABASE,
  authLoading:  HAS_SUPABASE,
  eventFee:     0,
  featureFee:   0,
  pendingFees:  [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthOpen: false };
    case 'LOGOUT':
      return { ...state, user: null, wishlist: [], orders: [], pendingFees: [], feeCart: [] };
    case 'REGISTER': {
      const exists = state.users.find(u => u.email === action.payload.email);
      if (exists) return state;
      return { ...state, users: [...state.users, action.payload], user: action.payload, isAuthOpen: false };
    }
    case 'OPEN_AUTH':   return { ...state, isAuthOpen: true, authMode: action.mode };
    case 'CLOSE_AUTH':  return { ...state, isAuthOpen: false };
    case 'SET_LOADING': return { ...state, loading: action.value };
    case 'INIT_DATA': {
      // Re-applica lo stato "sold" dai prodotti acquistati in sessioni precedenti
      // (localStorage è il fallback finché la RLS policy DB è attiva)
      let soldIds: string[] = [];
      try { soldIds = JSON.parse(localStorage.getItem('_sold_ids') ?? '[]'); } catch { /* */ }
      const products = soldIds.length > 0
        ? action.products.map(p => soldIds.includes(p.id) ? { ...p, status: 'sold' as const } : p)
        : action.products;
      return { ...state, users: action.users, products, events: action.events, slots: action.slots, loading: false };
    }
    case 'SET_EVENT_FEE':     return { ...state, eventFee: action.fee };
    case 'SET_FEATURE_FEE':   return { ...state, featureFee: action.fee };
    case 'SET_AUTH_LOADING':  return { ...state, authLoading: action.value };
    case 'SET_WISHLIST':      return { ...state, wishlist: action.ids };
    case 'SET_ORDERS':        return { ...state, orders: action.orders };
    case 'SET_PENDING_FEES':  return { ...state, pendingFees: action.fees };
    case 'ADD_PENDING_FEE':   return { ...state, pendingFees: [action.fee, ...state.pendingFees] };
    case 'UPDATE_PENDING_FEE':
      return {
        ...state,
        pendingFees: state.pendingFees.map(f =>
          f.id === action.id ? { ...f, status: action.status, paidAt: action.paidAt } : f
        ),
      };
    // Fee cart
    case 'ADD_TO_FEE_CART':
      // Evita duplicati: non aggiungere lo stesso referenceId+type due volte
      if (state.feeCart.some(i => i.referenceId === action.item.referenceId && i.type === action.item.type)) return state;
      return { ...state, feeCart: [...state.feeCart, action.item] };
    case 'REMOVE_FROM_FEE_CART':
      return { ...state, feeCart: state.feeCart.filter(i => i.id !== action.itemId) };
    case 'CLEAR_FEE_CART':
      return { ...state, feeCart: [] };

    // ── Products ──
    case 'ADD_PRODUCT':
      return { ...state, products: [action.product, ...state.products] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.product.id ? action.product : p) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.productId) };
    case 'MARK_PRODUCTS_SOLD':
      return {
        ...state,
        products: state.products.map(p =>
          action.productIds.includes(p.id) ? { ...p, status: 'sold' as const } : p
        ),
      };

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
    case 'NOTIFY':       return { ...state, notification: { message: action.message, type: action.notifType } };
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
  addEvent:    (event: Event) => Promise<string | null>;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
  // Cart prodotti
  addToCart:      (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart:      () => void;
  // Fee cart
  addToFeeCart:       (item: FeeCartItem) => void;
  removeFromFeeCart:  (itemId: string) => void;
  clearFeeCart:       () => void;
  checkoutFeeCart:    () => Promise<boolean>;  // crea pending_fees e svuota carrello
  feeCartCount:       number;
  feeCartTotal:       number;
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
  updateEventFee:     (fee: number) => Promise<boolean>;
  updateFeatureFee:   (fee: number) => Promise<boolean>;
  markFeeAsPaid:      (feeId: string) => Promise<boolean>;
  markFeeAsWaived:    (feeId: string) => Promise<boolean>;
  loadAllPendingFees: () => Promise<void>;
  refreshFees:        () => Promise<void>;
  // Computed
  cartCount: number;
  cartTotal: number;
}

const AppContext = createContext<ContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Token tenuto in un ref — scritto SINCRONO al momento dell'evento auth,
  // prima di qualsiasi operazione asincrona, per evitare il race condition
  // in cui Chrome non ha ancora scritto il token in localStorage.
  const sessionTokenRef = useRef<string | null>(null);

  // ── Supabase bootstrap ────────────────────────────────────────────────────
  useEffect(() => {
    if (!HAS_SUPABASE) return;

    const loadingTimeout = setTimeout(() => {
      if (stateRef.current.loading) {
        console.warn('Supabase loadData timeout — forcing loading:false');
        dispatch({ type: 'INIT_DATA', users: [], products: [], events: [], slots: {} });
      }
    }, 8000);

    const loadCritical = async () => {
      const [eventsRes, productsRes, profilesRes, settingsRes] = await Promise.all([
        supabasePublic.from('events').select('*').order('date', { ascending: true }),
        supabasePublic.from('products').select('*').order('created_at', { ascending: false }),
        supabasePublic.from('profiles_public').select('*'),
        supabasePublic.from('app_settings').select('key, value'),
      ]);

      if (eventsRes.error)   console.error('load events:',   eventsRes.error.message);
      if (productsRes.error) console.error('load products:', productsRes.error.message);
      if (profilesRes.error) console.error('load profiles:', profilesRes.error.message);
      if (settingsRes.error) console.error('load settings:', settingsRes.error.message);

      const events   = (eventsRes.data   ?? []).map(rowToEvent);
      const products = (productsRes.data ?? []).map(rowToProduct);
      const users    = (profilesRes.data ?? []).map(rowToUser);

      const rows = settingsRes.data ?? [];
      const feeRow     = (rows as Record<string, unknown>[]).find(r => r.key === 'event_fee');
      const featFeeRow = (rows as Record<string, unknown>[]).find(r => r.key === 'feature_fee');
      if (feeRow)     dispatch({ type: 'SET_EVENT_FEE',   fee: Number(feeRow.value) });
      if (featFeeRow) dispatch({ type: 'SET_FEATURE_FEE', fee: Number(featFeeRow.value) });

      dispatch({ type: 'INIT_DATA', users, products, events, slots: {} });
      clearTimeout(loadingTimeout);
    };

    const loadDeferred = async () => {
      const [slotsRes, bookingsRes] = await Promise.all([
        supabasePublic.from('time_slots').select('*'),
        supabasePublic.from('bookings').select('id, slot_id, event_id, user_id, created_at'),
      ]);

      if (slotsRes.error)    console.error('load slots:',    slotsRes.error.message);
      if (bookingsRes.error) console.error('load bookings:', bookingsRes.error.message);

      type BookingRow = { id: string; slot_id: string; event_id: string; user_id: string; created_at: string };
      const bookingsBySlot: Record<string, TimeSlot['bookings']> = {};
      for (const b of ((bookingsRes.data ?? []) as unknown as BookingRow[])) {
        const slotId = b.slot_id;
        if (!bookingsBySlot[slotId]) bookingsBySlot[slotId] = [];
        bookingsBySlot[slotId].push({
          id: b.id, slotId, eventId: b.event_id,
          userId: b.user_id, userName: '', userAvatar: '', createdAt: b.created_at,
        });
      }

      const slots: Record<string, TimeSlot[]> = {};
      for (const row of (slotsRes.data ?? [])) {
        const slot = rowToSlot(row as Record<string, unknown>);
        slot.bookings = bookingsBySlot[slot.id] ?? [];
        if (!slots[slot.eventId]) slots[slot.eventId] = [];
        slots[slot.eventId].push(slot);
      }

      dispatch({ type: 'INIT_DATA',
        users:    stateRef.current.users,
        products: stateRef.current.products,
        events:   stateRef.current.events,
        slots,
      });
    };

    loadCritical()
      .then(() => loadDeferred().catch(err => console.error('loadDeferred:', err)))
      .catch(err => {
        console.error('loadCritical fatal:', err);
        dispatch({ type: 'INIT_DATA', users: [], products: [], events: [], slots: {} });
        clearTimeout(loadingTimeout);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // ── Scrivi il token nel ref SUBITO (sincrono) ───────────────────────────
      // Chrome PC: supabase-js scrive in localStorage in modo asincrono,
      // quindi getAccessToken() fallirebbe se leggesse solo localStorage.
      sessionTokenRef.current = session?.access_token ?? null;

      if (session?.user) {
        const su = session.user;
        const meta = (su.user_metadata ?? {}) as Record<string, unknown>;

        dispatch({ type: 'SET_AUTH_LOADING', value: true });

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

        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', su.id).single();

        if (profile) {
          dispatch({ type: 'LOGIN', payload: rowToUser(profile as Record<string, unknown>) });
        }

        dispatch({ type: 'SET_AUTH_LOADING', value: false });

        // Dati utente-specifici
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

        // Quote del venditore — usa fetch diretto (bypass mutex)
        void loadUserFees(su.id);

      } else {
        sessionTokenRef.current = null;
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

  // ── Token helper ──────────────────────────────────────────────────────────
  const getAccessToken = (): string | null => {
    // 1. Ref — scritto sincrono dall'auth callback (sempre aggiornato su tutti i browser)
    if (sessionTokenRef.current) return sessionTokenRef.current;
    // 2. localStorage — fallback per ricariche di pagina successive
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
      const projectRef  = new URL(SUPABASE_URL).hostname.split('.')[0];
      const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
      if (raw) {
        const parsed = JSON.parse(raw) as { access_token?: string };
        if (parsed?.access_token) return parsed.access_token;
      }
    } catch { /* ignore */ }
    return null;
  };

  // ── Direct REST helpers (bypass supabase-js mutex) ────────────────────────
  const directRequest = async (
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: Record<string, unknown>,
    prefer?: string,
  ): Promise<{ ok: boolean; data?: unknown; error?: string }> => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
    const ANON_KEY     = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    const token = getAccessToken();
    if (!token) return { ok: false, error: 'no_token' };

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'apikey':        ANON_KEY,
      'Accept':        'application/json',
    };
    if (body)   headers['Content-Type'] = 'application/json';
    if (prefer) headers['Prefer']       = prefer;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20_000);

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      // 401 = sessione scaduta/revocata → logout automatico
      if (res.status === 401) {
        sessionTokenRef.current = null;
        dispatch({ type: 'LOGOUT' });
        return { ok: false, error: 'session_expired' };
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string; error?: string };
        return { ok: false, error: (err.message ?? err.error) ?? `HTTP ${res.status}` };
      }
      const data = method === 'GET' ? await res.json() : undefined;
      return { ok: true, data };
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return { ok: false, error: 'Tempo scaduto durante la comunicazione con Supabase. Riprova.' };
      }
      return { ok: false, error: String(e) };
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const notifyErr = (msg: string) => {
    dispatch({ type: 'NOTIFY', message: msg, notifType: 'error' });
    setTimeout(() => dispatch({ type: 'CLEAR_NOTIFY' }), 4000);
  };

  // ── Load user fees (direct fetch) ─────────────────────────────────────────
  const loadUserFees = async (userId: string) => {
    const { ok, data, error } = await directRequest(
      'GET',
      `pending_fees?seller_id=eq.${userId}&order=created_at.desc`,
    );
    if (!ok) { console.error('loadUserFees:', error); return; }
    const fees = ((data as Record<string, unknown>[]) ?? []).map(r => rowToPendingFee(r));
    dispatch({ type: 'SET_PENDING_FEES', fees });
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<string | null> => {
    if (!HAS_SUPABASE) {
      const user = stateRef.current.users.find(u => u.email === email && (u as unknown as Record<string,unknown>).password === password);
      if (user) { dispatch({ type: 'LOGIN', payload: user }); return null; }
      return 'Email o password non corretti.';
    }
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
    const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

    type DirectAuthResponse = {
      access_token: string;
      refresh_token: string;
      expires_in?: number;
      expires_at?: number;
      token_type?: string;
      user: {
        id: string;
        email?: string;
        created_at?: string;
        user_metadata?: Record<string, unknown>;
      };
      error?: string;
      error_description?: string;
      msg?: string;
      message?: string;
    };

    let authData: DirectAuthResponse;
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      authData = await response.json() as DirectAuthResponse;
      if (!response.ok) {
        return authData.msg ?? authData.message ?? authData.error_description
          ?? authData.error ?? 'Email o password non corretti.';
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'Il collegamento a Supabase non risponde. Aggiorna la pagina e riprova.';
      }
      return error instanceof Error ? error.message : 'Login non riuscito. Riprova.';
    } finally {
      window.clearTimeout(timeoutId);
    }

    if (!authData.access_token || !authData.user) return 'Login fallito. Riprova.';

    // Persistenza compatibile con supabase-js, senza passare dal suo mutex.
    authData.expires_at ??= Math.floor(Date.now() / 1000) + (authData.expires_in ?? 3600);
    try {
      const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
      localStorage.setItem(`sb-${projectRef}-auth-token`, JSON.stringify(authData));
    } catch { /* il login corrente continua a funzionare tramite il ref */ }
    sessionTokenRef.current = authData.access_token;

    const meta = authData.user.user_metadata ?? {};
    const tempUser: User = {
      id:          authData.user.id,
      name:        (meta.name as string) || email.split('@')[0],
      email:       authData.user.email ?? email,
      role:        (meta.role as User['role']) ?? 'buyer',
      city:        (meta.city as string) ?? '',
      avatar:      `https://ui-avatars.com/api/?name=${encodeURIComponent((meta.name as string) || email)}&background=8B6A3E&color=FAF7F2&size=200`,
      bio:         '',
      rating:      0,
      reviewCount: 0,
      joinedAt:    authData.user.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      specialties: [],
      verified:    false,
      salesCount:  0,
    };
    dispatch({ type: 'LOGIN', payload: tempUser });

    void directRequest('GET', `profiles?id=eq.${encodeURIComponent(authData.user.id)}&limit=1`)
      .then(({ ok, data: profiles }) => {
        const profile = ok && Array.isArray(profiles) ? profiles[0] : null;
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
      email, password,
      options: { data: { name, city, role } },
    });
    if (error) return error.message;

    if (data.user) {
      const tempUser: User = {
        id:          data.user.id,
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
      dispatch({ type: 'LOGIN', payload: tempUser });
    }
    return null;
  };

  const openAuth  = (mode: 'login' | 'register') => dispatch({ type: 'OPEN_AUTH', mode });
  const closeAuth = () => dispatch({ type: 'CLOSE_AUTH' });

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
      saves:          0,
    }).then(({ error }) => {
      if (error) {
        console.error('addProduct:', error);
        dispatch({ type: 'DELETE_PRODUCT', productId: product.id });
        notifyErr(`Errore nel salvataggio del prodotto: ${error.message}`);
      }
    });
  };

  const updateProduct = (product: Product) => {
    const previous = stateRef.current.products.find(p => p.id === product.id);
    dispatch({ type: 'UPDATE_PRODUCT', product });
    // Se il venditore rimette disponibile un prodotto che era sold in localStorage, rimuovilo
    if (product.status !== 'sold') {
      try {
        const prev: string[] = JSON.parse(localStorage.getItem('_sold_ids') ?? '[]');
        const updated = prev.filter(id => id !== product.id);
        if (updated.length !== prev.length) localStorage.setItem('_sold_ids', JSON.stringify(updated));
      } catch { /* ignore */ }
    }
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
        return;
      }
      // Aggiunge al fee cart se appena messo in evidenza
      const wasNotFeatured = !previous?.featured;
      if (product.featured && wasNotFeatured && stateRef.current.featureFee > 0) {
        dispatch({
          type: 'ADD_TO_FEE_CART',
          item: {
            id:             `fc_fp_${product.id}`,
            type:           'feature_product',
            referenceId:    product.id,
            referenceTitle: product.title,
            amount:         stateRef.current.featureFee,
          },
        });
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
  const addEvent = async (event: Event): Promise<string | null> => {
    if (!HAS_SUPABASE) {
      dispatch({ type: 'ADD_EVENT', event });
      return null;
    }

    // La chiamata REST diretta evita il mutex della sessione di supabase-js,
    // che su alcuni browser può lasciare il form in attesa indefinitamente.
    const { ok, error } = await directRequest('POST', 'events', {
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
      tags:              event.tags,
      price:             event.price,
      products_count:    event.productsCount,
      max_attendees:     event.maxAttendees ?? null,
      current_attendees: event.currentAttendees,
      featured:          event.featured,
      slot_max_capacity: event.slotMaxCapacity ?? null,
    }, 'return=minimal');

    if (!ok) {
      console.error('addEvent:', error);
      return error ?? 'Errore sconosciuto durante il salvataggio';
    }

    dispatch({ type: 'ADD_EVENT', event });

    // ── Dispatch fee cart voci SUBITO (sincrono/ottimistico) ────────────────
    // Deve avvenire PRIMA della navigazione a /checkout-quote, non nel .then()
    // che su PC veloce arriva dopo la navigazione e lascerebbe il cart vuoto.
    const feeItemIds: string[] = [];
    if (stateRef.current.eventFee > 0) {
      const feeId = `fc_ep_${event.id}`;
      feeItemIds.push(feeId);
      dispatch({
        type: 'ADD_TO_FEE_CART',
        item: {
          id:             feeId,
          type:           'event_publish',
          referenceId:    event.id,
          referenceTitle: event.title,
          amount:         stateRef.current.eventFee,
        },
      });
    }
    if (event.featured && stateRef.current.featureFee > 0) {
      const feeId = `fc_fe_${event.id}`;
      feeItemIds.push(feeId);
      dispatch({
        type: 'ADD_TO_FEE_CART',
        item: {
          id:             feeId,
          type:           'feature_event',
          referenceId:    event.id,
          referenceTitle: event.title,
          amount:         stateRef.current.featureFee,
        },
      });
    }

    return null;
  };

  const updateEvent = (event: Event) => {
    const previous = stateRef.current.events.find(e => e.id === event.id);
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
      tags:              event.tags,
      price:             event.price,
      products_count:    event.productsCount,
      max_attendees:     event.maxAttendees ?? null,
      current_attendees: event.currentAttendees,
      featured:          event.featured,
      slot_max_capacity: event.slotMaxCapacity ?? null,
    }).eq('id', event.id).then(({ error }) => {
      if (error) {
        console.error('updateEvent:', error);
        notifyErr(`Errore nell'aggiornamento dell'evento: ${error.message}`);
        return;
      }
      // Quota evidenza se appena attivata
      const wasNotFeatured = !previous?.featured;
      if (event.featured && wasNotFeatured && stateRef.current.featureFee > 0) {
        dispatch({
          type: 'ADD_TO_FEE_CART',
          item: {
            id:             `fc_fe_${event.id}`,
            type:           'feature_event',
            referenceId:    event.id,
            referenceTitle: event.title,
            amount:         stateRef.current.featureFee,
          },
        });
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

  // ── Cart prodotti ─────────────────────────────────────────────────────────
  const addToCart      = (product: Product)               => dispatch({ type: 'ADD_TO_CART', product });
  const removeFromCart = (productId: string)              => dispatch({ type: 'REMOVE_FROM_CART', productId });
  const updateQuantity = (productId: string, qty: number) => dispatch({ type: 'UPDATE_QUANTITY', productId, quantity: qty });
  const clearCart      = ()                               => dispatch({ type: 'CLEAR_CART' });

  // ── Fee cart ─────────────────────────────────────────────────────────────
  const addToFeeCart      = (item: FeeCartItem) => dispatch({ type: 'ADD_TO_FEE_CART', item });
  const removeFromFeeCart = (itemId: string)    => dispatch({ type: 'REMOVE_FROM_FEE_CART', itemId });
  const clearFeeCart      = ()                  => dispatch({ type: 'CLEAR_FEE_CART' });

  /** Conferma pagamento: registra pending_fees in DB e svuota il fee cart */
  const checkoutFeeCart = async (): Promise<boolean> => {
    const s = stateRef.current;
    if (!s.user || s.feeCart.length === 0) return false;

    const now = new Date().toISOString().slice(0, 10);
    const results = await Promise.all(
      s.feeCart.map(item => {
        const feeId = `fee_${item.id}_${Date.now()}`;
        const fee: PendingFee = {
          id: feeId, type: item.type,
          sellerId: s.user!.id, sellerName: s.user!.name,
          referenceId: item.referenceId, referenceTitle: item.referenceTitle,
          amount: item.amount, status: 'pending', createdAt: now,
        };

        if (!HAS_SUPABASE) {
          dispatch({ type: 'ADD_PENDING_FEE', fee });
          return Promise.resolve(true);
        }

        return directRequest('POST', 'pending_fees', {
          id:              feeId,
          type:            item.type,
          seller_id:       s.user!.id,
          reference_id:    item.referenceId,
          reference_title: item.referenceTitle,
          amount:          String(item.amount),
          status:          'pending',
        }, 'return=minimal').then(({ ok, error }) => {
          if (!ok) { console.error('checkoutFeeCart:', error); return false; }
          dispatch({ type: 'ADD_PENDING_FEE', fee });
          return true;
        });
      })
    );

    const allOk = results.every(Boolean);
    if (allOk) dispatch({ type: 'CLEAR_FEE_CART' });
    return allOk;
  };

  const feeCartCount = state.feeCart.length;
  const feeCartTotal = state.feeCart.reduce((s, i) => s + i.amount, 0);

  // ── Orders ────────────────────────────────────────────────────────────────
  const cartTotal = state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);

  const placeOrder = async (address: string, city: string): Promise<Order | null> => {
    const s = stateRef.current;
    if (!s.user || s.cart.length === 0) return null;

    const subtotal = s.cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 8.9;
    const orderId  = `ord_${Date.now()}`;
    const order: Order = {
      id: orderId, userId: s.user.id, items: [...s.cart],
      subtotal, shipping, total: subtotal + shipping,
      status: 'confermato', address, city,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    dispatch({ type: 'PLACE_ORDER', order });

    if (!HAS_SUPABASE) return order;

    // ── Usa directRequest per TUTTO (bypass mutex supabase-js su Chrome) ─────
    const { ok: orderOk, error: orderError } = await directRequest('POST', 'orders', {
      id:       orderId,
      user_id:  s.user.id,
      status:   'confermato',
      total:    order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      address,
      city,
    }, 'return=minimal');

    if (!orderOk) {
      console.error('placeOrder (orders):', orderError);
      dispatch({ type: 'NOTIFY', message: `Errore nel salvataggio dell'ordine: ${orderError}`, notifType: 'error' });
      setTimeout(() => dispatch({ type: 'CLEAR_NOTIFY' }), 4000);
      return null;
    }

    // Inserisce le righe ordine in parallelo
    const ts = Date.now();
    await Promise.all(
      s.cart.map((item, idx) =>
        directRequest('POST', 'order_items', {
          id:          `oi_${ts}_${idx}`,
          order_id:    orderId,
          product_id:  item.product.id,
          title:       item.product.title,
          price:       item.product.price,
          image:       item.product.images[0] ?? '',
          seller_id:   item.product.sellerId,
          seller_name: s.users.find(u => u.id === item.product.sellerId)?.name ?? '',
        }, 'return=minimal')
          .then(({ ok, error }) => { if (!ok) console.error(`placeOrder item ${idx}:`, error); })
      )
    );

    // ── Segna i prodotti come venduti ────────────────────────────────────────
    const purchasedIds = s.cart.map(i => i.product.id);

    // 1. Aggiorna lo stato locale subito (ottimistico)
    dispatch({ type: 'MARK_PRODUCTS_SOLD', productIds: purchasedIds });

    // 2. Persisti in localStorage così il sold status sopravvive al reload
    //    (funziona anche prima che la RLS policy DB venga applicata)
    try {
      const prev: string[] = JSON.parse(localStorage.getItem('_sold_ids') ?? '[]');
      const merged = Array.from(new Set([...prev, ...purchasedIds]));
      localStorage.setItem('_sold_ids', JSON.stringify(merged));
    } catch { /* ignore */ }

    // 3. Aggiorna il DB via directRequest (bypass mutex + usa token attivo)
    //    Richiede la policy "products: buyer mark sold" — vedi migration 005.
    for (const pid of purchasedIds) {
      directRequest('PATCH', `products?id=eq.${encodeURIComponent(pid)}`, { status: 'sold' }, 'return=minimal')
        .then(({ ok, error }) => { if (!ok) console.warn(`mark sold ${pid}:`, error); });
    }

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
      id: bookingId, slot_id: sid, event_id: eid, user_id: user.id, status: 'confirmed',
    }).then(({ error }) => {
      if (error) {
        console.error('bookSlot:', error);
        dispatch({ type: 'CANCEL_BOOKING', eventId: eid, slotId: sid });
        notifyErr(`Errore nella prenotazione: ${error.message}`);
      }
    });
  };

  const cancelBooking = (eid: string, sid: string) => {
    dispatch({ type: 'CANCEL_BOOKING', eventId: eid, slotId: sid });
    if (!HAS_SUPABASE || !stateRef.current.user) return;
    const uid = stateRef.current.user.id;
    supabase.from('bookings').delete().match({ slot_id: sid, user_id: uid })
      .then(({ error }) => {
        if (error) {
          console.error('cancelBooking:', error);
          notifyErr(`Errore nella cancellazione: ${error.message}`);
        }
      });
  };

  const setSlotCapacity    = (eid: string, sid: string, cap: number) =>
    dispatch({ type: 'SET_SLOT_CAPACITY', eventId: eid, slotId: sid, capacity: cap });

  const toggleSlotDisabled = (eid: string, sid: string) => {
    dispatch({ type: 'TOGGLE_SLOT_DISABLED', eventId: eid, slotId: sid });
    if (!HAS_SUPABASE) return;
    const current = stateRef.current.slots[eid]?.find(s => s.id === sid);
    if (!current) return;
    supabase.from('time_slots').update({ disabled: !current.disabled }).eq('id', sid)
      .then(({ error }) => { if (error) console.error('toggleSlotDisabled:', error); });
  };

  const initEventSlots = (eid: string, ts: string, te: string, cap: number) => {
    dispatch({ type: 'INIT_EVENT_SLOTS', eventId: eid, timeStart: ts, timeEnd: te, capacity: cap });
    if (!HAS_SUPABASE) return;
    const generated = generateSlots(eid, ts, te, cap);
    if (generated.length === 0) return;
    const rows = generated.map(slot => ({
      id: slot.id, event_id: eid,
      start_time: slot.startTime, end_time: slot.endTime,
      max_capacity: slot.maxCapacity, disabled: false,
    }));
    supabase.from('time_slots').upsert(rows, { onConflict: 'id' })
      .then(({ error }) => { if (error) console.error('initEventSlots:', error); });
  };

  // ── Admin ─────────────────────────────────────────────────────────────────
  const upsertSetting = async (key: string, value: number): Promise<boolean> => {
    if (!HAS_SUPABASE) return true;
    const { ok, error } = await directRequest('POST', 'app_settings',
      { key, value: String(value) },
      'resolution=merge-duplicates,return=minimal',
    );
    if (!ok) {
      console.error(`upsertSetting(${key}):`, error);
      notifyErr(`Errore nel salvataggio: ${error}`);
    }
    return ok;
  };

  const updateEventFee = async (fee: number): Promise<boolean> => {
    dispatch({ type: 'SET_EVENT_FEE', fee });
    return upsertSetting('event_fee', fee);
  };

  const updateFeatureFee = async (fee: number): Promise<boolean> => {
    dispatch({ type: 'SET_FEATURE_FEE', fee });
    return upsertSetting('feature_fee', fee);
  };

  /** Carica TUTTE le pending_fees (admin) — usa fetch diretto per evitare mutex hang */
  const loadAllPendingFees = async (): Promise<void> => {
    if (!HAS_SUPABASE) return;
    const { ok, data, error } = await directRequest(
      'GET',
      'pending_fees?select=*&order=created_at.desc',
    );
    if (!ok) { console.error('loadAllPendingFees:', error); return; }

    const usersMap: Record<string, string> = {};
    for (const u of stateRef.current.users) usersMap[u.id] = u.name;

    const fees = ((data as Record<string, unknown>[]) ?? []).map(r => rowToPendingFee(r, usersMap));
    dispatch({ type: 'SET_PENDING_FEES', fees });
  };

  const markFeeAsPaid = async (feeId: string): Promise<boolean> => {
    const paidAt = new Date().toISOString().slice(0, 10);
    const { ok, error } = await directRequest(
      'PATCH',
      `pending_fees?id=eq.${encodeURIComponent(feeId)}`,
      { status: 'paid', paid_at: new Date().toISOString() },
      'return=minimal',
    );
    if (!ok) { notifyErr(`Errore: ${error}`); return false; }
    dispatch({ type: 'UPDATE_PENDING_FEE', id: feeId, status: 'paid', paidAt });
    return true;
  };

  const markFeeAsWaived = async (feeId: string): Promise<boolean> => {
    const { ok, error } = await directRequest(
      'PATCH',
      `pending_fees?id=eq.${encodeURIComponent(feeId)}`,
      { status: 'waived' },
      'return=minimal',
    );
    if (!ok) { notifyErr(`Errore: ${error}`); return false; }
    dispatch({ type: 'UPDATE_PENDING_FEE', id: feeId, status: 'waived' });
    return true;
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
      addToFeeCart, removeFromFeeCart, clearFeeCart, checkoutFeeCart,
      feeCartCount, feeCartTotal,
      placeOrder, toggleWishlist, notify, cartCount, cartTotal,
      bookSlot, cancelBooking, setSlotCapacity, toggleSlotDisabled,
      initEventSlots, getUserBookedSlot,
      updateEventFee, updateFeatureFee,
      markFeeAsPaid, markFeeAsWaived, loadAllPendingFees,
      refreshFees: () => {
        const uid = stateRef.current.user?.id;
        return uid ? loadUserFees(uid) : Promise.resolve();
      },
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
