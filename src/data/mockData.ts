import { User, Event, Product, Review, TimeSlot, Booking } from '../types';

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Maria Rossi',
    email: 'maria@example.com',
    password: 'password',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    bio: 'Appassionata di moda anni \'60 e \'70. Colleziono abiti e accessori vintage da oltre vent\'anni. Ogni pezzo nella mia collezione ha una storia da raccontare.',
    city: 'Milano',
    rating: 4.9,
    reviewCount: 134,
    joinedAt: '2020-03-15',
    specialties: ['Abbigliamento', 'Accessori', 'Gioielli'],
    verified: true,
    salesCount: 287,
  },
  {
    id: 'u2',
    name: 'Carlo Bianchi',
    email: 'carlo@example.com',
    password: 'password',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    bio: 'Designer di interni con una passione per il design mid-century. Trovo pezzi unici in tutta Italia e li restauro con cura.',
    city: 'Roma',
    rating: 4.7,
    reviewCount: 89,
    joinedAt: '2021-06-01',
    specialties: ['Mobili', 'Design', 'Illuminazione'],
    verified: true,
    salesCount: 156,
  },
  {
    id: 'u3',
    name: 'Elena Conti',
    email: 'elena@example.com',
    password: 'password',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    bio: 'Gioielliera e collezionista di argenti antichi. Specializzo in bigiotteria vintage e gioielli artigianali del Novecento.',
    city: 'Firenze',
    rating: 5.0,
    reviewCount: 62,
    joinedAt: '2022-01-10',
    specialties: ['Gioielli', 'Argenti', 'Bigiotteria'],
    verified: true,
    salesCount: 98,
  },
  {
    id: 'u4',
    name: 'Giorgio Ferretti',
    email: 'giorgio@example.com',
    password: 'password',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    bio: 'Dj e collezionista di vinili. Appassionato di elettronica vintage e audio hi-fi degli anni \'70 e \'80.',
    city: 'Torino',
    rating: 4.8,
    reviewCount: 201,
    joinedAt: '2019-09-22',
    specialties: ['Vinili', 'Elettronica', 'Hi-Fi'],
    verified: true,
    salesCount: 432,
  },
  {
    id: 'u5',
    name: 'Sofia Marino',
    email: 'sofia@example.com',
    password: 'password',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    bio: 'Ceramista e appassionata di artigianato italiano. Colleziono ceramiche regionali e oggetti di decoro d\'epoca.',
    city: 'Napoli',
    rating: 4.6,
    reviewCount: 45,
    joinedAt: '2022-08-14',
    specialties: ['Ceramiche', 'Oggettistica', 'Arte'],
    verified: false,
    salesCount: 67,
  },
  {
    id: 'u6',
    name: 'Demo Utente',
    email: 'demo@demo.com',
    password: 'demo',
    role: 'both',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
    bio: 'Account demo per esplorare la piattaforma.',
    city: 'Bologna',
    rating: 4.5,
    reviewCount: 12,
    joinedAt: '2024-01-01',
    specialties: ['Vari'],
    verified: false,
    salesCount: 5,
  },
];

export const EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Vendita in Casa — Moda Anni \'60 e \'70',
    description: 'Apro le porte della mia casa milanese per una selezione esclusiva di abbigliamento e accessori degli anni \'60 e \'70. Troverete pezzi originali firmati, abiti da cocktail, pellicce sintetiche colorate e molto altro. Ogni pezzo è autenticato e in ottimo stato. Caffè e dolci per tutti gli ospiti!',
    type: 'casa_privata',
    sellerId: 'u1',
    address: 'Via Brera 12',
    city: 'Milano',
    date: '2026-05-10',
    timeStart: '10:00',
    timeEnd: '18:00',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=500&fit=crop',
    ],
    tags: ['abbigliamento', 'anni60', 'anni70', 'moda', 'vintage'],
    status: 'upcoming',
    productsCount: 84,
    maxAttendees: 30,
    currentAttendees: 18,
    price: 0,
    featured: true,
    slotMaxCapacity: 4,
  },
  {
    id: 'e2',
    title: 'Mostra Mercato — Design Mid-Century',
    description: 'Una straordinaria selezione di mobili e oggetti di design degli anni \'50, \'60 e \'70. Poltrone Eames originali, lampade Arteluce, tavoli in teak scandinavo e molto altro. Tutto pezzo è stato selezionato per la sua qualità e autenticità.',
    type: 'mostra',
    sellerId: 'u2',
    address: 'Via del Babuino 45',
    city: 'Roma',
    date: '2026-05-15',
    endDate: '2026-05-16',
    timeStart: '09:00',
    timeEnd: '19:00',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=500&fit=crop',
    tags: ['mobili', 'design', 'mid-century', 'modernariato'],
    status: 'upcoming',
    productsCount: 62,
    currentAttendees: 0,
    price: 0,
    featured: true,
  },
  {
    id: 'e3',
    title: 'Mercatino Vinili & Elettronica Vintage',
    description: 'Il grande mercatino dei vinili torna a Torino! Migliaia di dischi da ogni genere e epoca, attrezzatura hi-fi vintage, radio d\'epoca e molto altro. Per audiofili e appassionati di musica.',
    type: 'mercatino',
    sellerId: 'u4',
    address: 'Piazza della Repubblica',
    city: 'Torino',
    date: '2026-05-22',
    timeStart: '08:00',
    timeEnd: '19:00',
    image: 'https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=800&h=500&fit=crop',
    tags: ['vinili', 'musica', 'hi-fi', 'elettronica'],
    status: 'upcoming',
    productsCount: 210,
    currentAttendees: 0,
    price: 0,
    featured: false,
  },
  {
    id: 'e4',
    title: 'Pop-Up Gioielli & Argenti Antichi',
    description: 'Due giorni dedicati al gioiello vintage fiorentino. Spille, collane, bracciali e orecchini degli anni \'20-\'80, argenti da tavola e bigiotteria di alta qualità. Possibilità di valutazione gratuita dei vostri gioielli.',
    type: 'pop_up',
    sellerId: 'u3',
    address: 'Borgo San Jacopo 18',
    city: 'Firenze',
    date: '2026-05-08',
    endDate: '2026-05-09',
    timeStart: '10:00',
    timeEnd: '17:00',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=500&fit=crop',
    tags: ['gioielli', 'argenti', 'bigiotteria', 'anni20', 'anni50'],
    status: 'upcoming',
    productsCount: 150,
    maxAttendees: 20,
    currentAttendees: 14,
    price: 0,
    featured: true,
    slotMaxCapacity: 3,
  },
  {
    id: 'e5',
    title: 'Vendita in Casa — Ceramiche & Oggetti Napoletani',
    description: 'Svendo la mia collezione di ceramiche campane, oggetti di folklore e decoro domestico d\'epoca. Pezzi di Capodimonte, maioliche di Vietri e oggetti artigianali rari.',
    type: 'casa_privata',
    sellerId: 'u5',
    address: 'Via San Gregorio Armeno 7',
    city: 'Napoli',
    date: '2026-06-01',
    timeStart: '10:00',
    timeEnd: '16:00',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=500&fit=crop',
    tags: ['ceramiche', 'capodimonte', 'napoli', 'artigianato'],
    status: 'upcoming',
    productsCount: 45,
    maxAttendees: 15,
    currentAttendees: 5,
    price: 0,
    featured: false,
    slotMaxCapacity: 2,
  },
  {
    id: 'e6',
    title: 'Mercatino Vintage di Primavera',
    description: 'Il grande mercatino primaverile con oltre 30 espositori. Abbigliamento, libri, dischi, oggetti da casa, giocattoli e collezionismo. Ingresso libero.',
    type: 'mercatino',
    sellerId: 'u1',
    address: 'Parco Sempione',
    city: 'Milano',
    date: '2026-04-20',
    timeStart: '09:00',
    timeEnd: '20:00',
    image: 'https://images.unsplash.com/photo-1532635248-cdd3d399f56a?w=800&h=500&fit=crop',
    tags: ['mercatino', 'primavera', 'vintage', 'abbigliamento'],
    status: 'completed',
    productsCount: 380,
    currentAttendees: 450,
    price: 0,
    featured: false,
  },
];

export const PRODUCTS: Product[] = [
  // Abbigliamento
  {
    id: 'p1',
    title: 'Abito Cocktail Anni \'60 — Verde Smeraldo',
    description: 'Stupendo abito da cocktail originale degli anni \'60 in tessuto di seta verde smeraldo. Perfette proporzioni, vita segnata con gonna a campana. Etichetta originale presente. Taglia 42 italiana.',
    price: 185,
    originalPrice: 220,
    category: 'Abbigliamento',
    subcategory: 'Abiti',
    condition: 'ottimo',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop',
    ],
    sellerId: 'u1',
    eventId: 'e1',
    tags: ['abito', 'anni60', 'cocktail', 'seta', 'verde'],
    era: '1960s',
    brand: 'Senza etichetta',
    material: 'Seta',
    status: 'available',
    createdAt: '2026-04-10',
    featured: true,
    views: 234,
    saves: 18,
  },
  {
    id: 'p2',
    title: 'Cappotto Lana Cammello Anni \'70',
    description: 'Elegante cappotto in pura lana color cammello, tipico dello stile anni \'70. Doppiopetto con grandi bottoni dorati. Fodera in raso. Taglia 44.',
    price: 145,
    category: 'Abbigliamento',
    subcategory: 'Cappotti',
    condition: 'buono',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop',
    ],
    sellerId: 'u1',
    eventId: 'e1',
    tags: ['cappotto', 'lana', 'anni70', 'cammello'],
    era: '1970s',
    material: 'Lana',
    status: 'available',
    createdAt: '2026-04-10',
    featured: false,
    views: 89,
    saves: 7,
  },
  {
    id: 'p3',
    title: 'Borsa a Mano in Coccodrillo Anni \'50',
    description: 'Borsa in autentico coccodrillo (antecedente alle normative CITES) degli anni \'50. Colore cognac scuro, chiusura a morsa in ottone. Interno in seta avorio. Rara e in ottime condizioni.',
    price: 320,
    category: 'Accessori',
    subcategory: 'Borse',
    condition: 'ottimo',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop',
    ],
    sellerId: 'u1',
    eventId: 'e1',
    tags: ['borsa', 'anni50', 'coccodrillo', 'vintage'],
    era: '1950s',
    material: 'Coccodrillo',
    status: 'available',
    createdAt: '2026-04-11',
    featured: true,
    views: 412,
    saves: 41,
  },

  // Mobili
  {
    id: 'p4',
    title: 'Poltrona Eames Replica Anni \'60',
    description: 'Poltrona ispirata al design Eames degli anni \'60. Struttura in legno di noce, rivestimento in pelle marrone originale in ottimo stato. Piedini a slitta in metallo cromato.',
    price: 890,
    originalPrice: 1100,
    category: 'Mobili',
    subcategory: 'Poltrone',
    condition: 'ottimo',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=800&fit=crop',
    ],
    sellerId: 'u2',
    eventId: 'e2',
    tags: ['poltrona', 'design', 'mid-century', 'eames', 'pelle'],
    era: '1960s',
    brand: 'Design italiano',
    material: 'Noce / Pelle',
    dimensions: '80×90×75 cm',
    status: 'available',
    createdAt: '2026-04-08',
    featured: true,
    views: 567,
    saves: 55,
  },
  {
    id: 'p5',
    title: 'Lampada Arco — Stile Castiglioni Anni \'70',
    description: 'Lampada ad arco in stile Castiglioni. Base in marmo di Carrara, fusto in acciaio inox, paralume in alluminio spazzolato. Cablaggio rifatto. Altezza regolabile fino a 240 cm.',
    price: 340,
    category: 'Illuminazione',
    subcategory: 'Lampade da terra',
    condition: 'ottimo',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=800&fit=crop',
    ],
    sellerId: 'u2',
    eventId: 'e2',
    tags: ['lampada', 'arco', 'design', 'mid-century', 'marmo'],
    era: '1970s',
    material: 'Marmo / Acciaio',
    status: 'available',
    createdAt: '2026-04-08',
    featured: true,
    views: 289,
    saves: 34,
  },
  {
    id: 'p6',
    title: 'Credenza in Teak Scandinava Anni \'60',
    description: 'Credenza in teak massello di produzione scandinava, anni \'60. Quattro ante scorrevoli, tre cassetti interni. Gamba conico in teak. Restaurata con oli naturali. Dimensioni: 180×45×80 cm.',
    price: 1250,
    category: 'Mobili',
    subcategory: 'Credenze',
    condition: 'ottimo',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=800&fit=crop',
    ],
    sellerId: 'u2',
    eventId: 'e2',
    tags: ['credenza', 'teak', 'scandinavo', 'anni60', 'design'],
    era: '1960s',
    material: 'Teak',
    dimensions: '180×45×80 cm',
    status: 'reserved',
    createdAt: '2026-04-09',
    featured: false,
    views: 198,
    saves: 22,
  },

  // Gioielli
  {
    id: 'p7',
    title: 'Collana Art Déco in Argento & Onice',
    description: 'Raffinata collana Art Déco in argento 925 con pietre di onice nera. Lavorazione a filigrana tipica degli anni \'30. Lunghezza 50 cm. Certificato di autenticità incluso.',
    price: 285,
    category: 'Gioielli',
    subcategory: 'Collane',
    condition: 'come_nuovo',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop',
    ],
    sellerId: 'u3',
    eventId: 'e4',
    tags: ['collana', 'argento', 'art-deco', 'onice', 'anni30'],
    era: '1930s',
    material: 'Argento 925 / Onice',
    status: 'available',
    createdAt: '2026-04-05',
    featured: true,
    views: 345,
    saves: 29,
  },
  {
    id: 'p8',
    title: 'Set Bracciale & Orecchini Bakelite Anni \'40',
    description: 'Elegante set composto da bracciale e orecchini clip in bakelite cherry amber degli anni \'40. Colore caramello con sfumature dorate. Pezzo raro in perfette condizioni.',
    price: 125,
    category: 'Gioielli',
    subcategory: 'Set',
    condition: 'ottimo',
    images: [
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=800&fit=crop',
    ],
    sellerId: 'u3',
    eventId: 'e4',
    tags: ['bakelite', 'anni40', 'set', 'bracciale', 'orecchini'],
    era: '1940s',
    material: 'Bakelite',
    status: 'available',
    createdAt: '2026-04-05',
    featured: false,
    views: 156,
    saves: 15,
  },
  {
    id: 'p9',
    title: 'Spilla Vintage Chanel Anni \'80',
    description: 'Spilla vintage Chanel con logo CC in metallo dorato e strass bianchi. Anni \'80. Completa di scatola originale e certificato. Condizioni eccellenti.',
    price: 480,
    category: 'Gioielli',
    subcategory: 'Spille',
    condition: 'come_nuovo',
    images: [
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=800&fit=crop',
    ],
    sellerId: 'u3',
    eventId: 'e4',
    tags: ['chanel', 'spilla', 'anni80', 'designer', 'dorato'],
    era: '1980s',
    brand: 'Chanel',
    material: 'Metallo dorato / Strass',
    status: 'available',
    createdAt: '2026-04-06',
    featured: true,
    views: 623,
    saves: 78,
  },

  // Vinili & Elettronica
  {
    id: 'p10',
    title: 'Giradischi Thorens TD-160 Anni \'70',
    description: 'Leggendario giradischi Thorens TD-160, produzione svizzera anni \'70. Revisione completa: nuovo cinghia, cuscinetto rigenerato, testina Ortofon OM10 nuova. Suona magnificamente.',
    price: 620,
    category: 'Elettronica',
    subcategory: 'Giradischi',
    condition: 'ottimo',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=800&fit=crop',
    ],
    sellerId: 'u4',
    eventId: 'e3',
    tags: ['giradischi', 'thorens', 'hi-fi', 'anni70', 'vinile'],
    era: '1970s',
    brand: 'Thorens',
    status: 'available',
    createdAt: '2026-04-12',
    featured: true,
    views: 789,
    saves: 92,
  },
  {
    id: 'p11',
    title: 'Vinile — Pink Floyd "The Wall" 1979 Prima Stampa',
    description: 'Prima stampa italiana de "The Wall" dei Pink Floyd (1979). Matrice A/B. Copertina in condizioni molto buone (VG+), disco praticamente nuovo (NM). Rarità assoluta.',
    price: 280,
    category: 'Vinili',
    subcategory: 'Rock',
    condition: 'ottimo',
    images: [
      'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=800&fit=crop',
    ],
    sellerId: 'u4',
    eventId: 'e3',
    tags: ['pink-floyd', 'the-wall', 'vinile', '1979', 'rock'],
    era: '1970s',
    brand: 'Pink Floyd',
    status: 'available',
    createdAt: '2026-04-12',
    featured: false,
    views: 445,
    saves: 56,
  },
  {
    id: 'p12',
    title: 'Radio Transistor Philips Anni \'60 — Rossa',
    description: 'Radio transistor Philips modello L4X90T degli anni \'60 in plastica rossa brillante. Restaurata elettricamente. Riceve AM/FM perfettamente. Oggetto d\'arredo straordinario.',
    price: 95,
    category: 'Elettronica',
    subcategory: 'Radio',
    condition: 'buono',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop',
    ],
    sellerId: 'u4',
    eventId: 'e3',
    tags: ['radio', 'philips', 'anni60', 'transistor', 'rossa'],
    era: '1960s',
    brand: 'Philips',
    status: 'available',
    createdAt: '2026-04-13',
    featured: false,
    views: 234,
    saves: 31,
  },

  // Ceramiche
  {
    id: 'p13',
    title: 'Vaso Capodimonte — Manifattura Anni \'50',
    description: 'Vaso in porcellana di Capodimonte, manifattura originale napoletana anni \'50. Decorazione floreale dipinta a mano in smalti policromi. Base con marchio della manifattura. H. 35 cm.',
    price: 220,
    category: 'Ceramiche',
    subcategory: 'Vasi',
    condition: 'come_nuovo',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=800&fit=crop',
    ],
    sellerId: 'u5',
    eventId: 'e5',
    tags: ['capodimonte', 'porcellana', 'napoli', 'anni50', 'vaso'],
    era: '1950s',
    material: 'Porcellana',
    dimensions: 'H 35 cm',
    status: 'available',
    createdAt: '2026-04-14',
    featured: true,
    views: 178,
    saves: 19,
  },
  {
    id: 'p14',
    title: 'Set 6 Piatti Maiolica di Vietri Anni \'70',
    description: 'Set di sei piatti in maiolica di Vietri sul Mare, anni \'70. Decoro tradizionale con gallo e fiori in blu cobalto e giallo. Diametro 26 cm. Tutti in perfette condizioni.',
    price: 160,
    category: 'Ceramiche',
    subcategory: 'Stoviglie',
    condition: 'ottimo',
    images: [
      'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=600&h=800&fit=crop',
    ],
    sellerId: 'u5',
    eventId: 'e5',
    tags: ['vietri', 'maiolica', 'piatti', 'anni70', 'cucina'],
    era: '1970s',
    material: 'Ceramica / Maiolica',
    status: 'available',
    createdAt: '2026-04-14',
    featured: false,
    views: 112,
    saves: 8,
  },
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    authorId: 'u6',
    authorName: 'Giulia T.',
    authorAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    targetId: 'u1',
    rating: 5,
    comment: 'Maria è una venditrice eccezionale! Pezzi autentici, prezzi onesti e un\'accoglienza calorosa. La sua casa è un vero museo della moda vintage. Tornerò sicuramente!',
    createdAt: '2026-03-15',
    type: 'seller',
  },
  {
    id: 'r2',
    authorId: 'u6',
    authorName: 'Marco B.',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    targetId: 'u2',
    rating: 5,
    comment: 'Carlo ha un occhio straordinario per il design. Ho trovato una poltrona degli anni \'60 perfettamente restaurata. Spedizione rapida e imballaggio ottimo.',
    createdAt: '2026-03-20',
    type: 'seller',
  },
  {
    id: 'r3',
    authorId: 'u6',
    authorName: 'Laura M.',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    targetId: 'u3',
    rating: 5,
    comment: 'Elena è la migliore! I suoi gioielli vintage sono autentici e in condizioni perfette. La collana Art Déco che ho acquistato è semplicemente meravigliosa.',
    createdAt: '2026-04-01',
    type: 'seller',
  },
  {
    id: 'r4',
    authorId: 'u6',
    authorName: 'Andrea F.',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    targetId: 'u4',
    rating: 5,
    comment: 'Giorgio è il paradiso per gli audiofili! Il Thorens che ho acquistato suona come nuovo. Consiglio a tutti gli appassionati di hi-fi vintage.',
    createdAt: '2026-04-05',
    type: 'seller',
  },
];

export const CATEGORIES = [
  { id: 'abbigliamento', name: 'Abbigliamento', icon: '👗', count: 156 },
  { id: 'mobili', name: 'Mobili & Design', icon: '🛋️', count: 89 },
  { id: 'gioielli', name: 'Gioielli', icon: '💎', count: 74 },
  { id: 'elettronica', name: 'Elettronica & Vinili', icon: '📻', count: 132 },
  { id: 'ceramiche', name: 'Ceramiche & Arte', icon: '🏺', count: 61 },
  { id: 'accessori', name: 'Accessori', icon: '👜', count: 98 },
  { id: 'libri', name: 'Libri & Stampe', icon: '📚', count: 43 },
  { id: 'altro', name: 'Curiosità & Altro', icon: '✨', count: 55 },
];

export const CONDITIONS: Record<string, { label: string; color: string }> = {
  come_nuovo: { label: 'Come nuovo', color: 'text-emerald-700 bg-emerald-50' },
  ottimo: { label: 'Ottimo', color: 'text-blue-700 bg-blue-50' },
  buono: { label: 'Buono', color: 'text-amber-700 bg-amber-50' },
  discreto: { label: 'Discreto', color: 'text-orange-700 bg-orange-50' },
};

export const EVENT_TYPES: Record<string, { label: string; color: string; icon: string }> = {
  casa_privata: { label: 'Casa Privata', color: 'text-rose-700 bg-rose-50', icon: '🏠' },
  mercatino: { label: 'Mercatino', color: 'text-amber-700 bg-amber-50', icon: '🏪' },
  mostra: { label: 'Mostra', color: 'text-purple-700 bg-purple-50', icon: '🎨' },
  pop_up: { label: 'Pop-Up', color: 'text-sky-700 bg-sky-50', icon: '⚡' },
};

// ─── Slot helpers ────────────────────────────────────────────────────────────

export function generateSlots(
  eventId: string,
  timeStart: string,
  timeEnd: string,
  maxCapacity: number
): TimeSlot[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTime = (min: number) => {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const slots: TimeSlot[] = [];
  let cur = toMin(timeStart);
  const end = toMin(timeEnd);

  while (cur + 30 <= end) {
    const id = `${eventId}_${toTime(cur).replace(':', '')}`;
    slots.push({
      id,
      eventId,
      startTime: toTime(cur),
      endTime: toTime(cur + 30),
      maxCapacity,
      bookings: [],
      disabled: false,
    });
    cur += 30;
  }
  return slots;
}

// Pre-populated demo bookings for event e1 (Maria Rossi – Milano)
const demoVisitors: Array<{ userId: string; userName: string; userAvatar: string }> = [
  { userId: 'v1', userName: 'Giulia T.', userAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face' },
  { userId: 'v2', userName: 'Marco B.', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face' },
  { userId: 'v3', userName: 'Laura M.', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face' },
  { userId: 'v4', userName: 'Andrea F.', userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
  { userId: 'v5', userName: 'Sara C.', userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
];

function makeBooking(slotId: string, eventId: string, visitor: typeof demoVisitors[0], idx: number): Booking {
  return {
    id: `bk_${slotId}_${idx}`,
    slotId,
    eventId,
    userId: visitor.userId,
    userName: visitor.userName,
    userAvatar: visitor.userAvatar,
    createdAt: '2026-04-20T10:00:00Z',
  };
}

function buildInitialSlots(): Record<string, TimeSlot[]> {
  const result: Record<string, TimeSlot[]> = {};

  // Event e1: 10:00–18:00, cap 4 – partially fill several slots
  const e1Slots = generateSlots('e1', '10:00', '18:00', 4);
  // 10:00 → full (4/4)
  e1Slots[0].bookings = demoVisitors.slice(0, 4).map((v, i) => makeBooking(e1Slots[0].id, 'e1', v, i));
  // 10:30 → 3/4
  e1Slots[1].bookings = demoVisitors.slice(0, 3).map((v, i) => makeBooking(e1Slots[1].id, 'e1', v, i));
  // 11:00 → 2/4
  e1Slots[2].bookings = demoVisitors.slice(0, 2).map((v, i) => makeBooking(e1Slots[2].id, 'e1', v, i));
  // 11:30 → full (4/4)
  e1Slots[3].bookings = demoVisitors.slice(0, 4).map((v, i) => makeBooking(e1Slots[3].id, 'e1', v, i));
  // 12:00 → 1/4
  e1Slots[4].bookings = demoVisitors.slice(0, 1).map((v, i) => makeBooking(e1Slots[4].id, 'e1', v, i));
  // 14:00 (slot index 8) → 3/4
  e1Slots[8].bookings = demoVisitors.slice(0, 3).map((v, i) => makeBooking(e1Slots[8].id, 'e1', v, i));
  // 15:00 (slot 10) → full
  e1Slots[10].bookings = demoVisitors.slice(0, 4).map((v, i) => makeBooking(e1Slots[10].id, 'e1', v, i));
  result['e1'] = e1Slots;

  // Event e4: 10:00–17:00, cap 3
  const e4Slots = generateSlots('e4', '10:00', '17:00', 3);
  e4Slots[0].bookings = demoVisitors.slice(0, 3).map((v, i) => makeBooking(e4Slots[0].id, 'e4', v, i));
  e4Slots[1].bookings = demoVisitors.slice(0, 2).map((v, i) => makeBooking(e4Slots[1].id, 'e4', v, i));
  e4Slots[3].bookings = demoVisitors.slice(0, 3).map((v, i) => makeBooking(e4Slots[3].id, 'e4', v, i));
  result['e4'] = e4Slots;

  // Event e5: 10:00–16:00, cap 2
  const e5Slots = generateSlots('e5', '10:00', '16:00', 2);
  e5Slots[0].bookings = demoVisitors.slice(0, 2).map((v, i) => makeBooking(e5Slots[0].id, 'e5', v, i));
  e5Slots[2].bookings = demoVisitors.slice(0, 1).map((v, i) => makeBooking(e5Slots[2].id, 'e5', v, i));
  result['e5'] = e5Slots;

  return result;
}

export const INITIAL_SLOTS: Record<string, TimeSlot[]> = buildInitialSlots();
