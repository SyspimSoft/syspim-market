// SYSPIM MARKET - INTEGRACIÓN DEL CATÁLOGO DE PRODUCTOS (catalogoProductos)
// Código completo funcional con React y Tailwind CSS

const { useState, useEffect, useRef, useMemo } = React;

// --- DATOS DEMO DE COLMADOS MULTI-TENANT ---
const DEMO_TENANTS = [
  { id: 't-001', nombre: 'Colmado Don Pedro', slug: 'colmado-don-pedro', telefono: '8095131416', direccion: 'Av. 27 de Febrero #45, Santo Domingo' },
  { id: 't-002', nombre: 'Colmado La Esquina', slug: 'colmado-la-esquina', telefono: '8095131416', direccion: 'Calle El Conde #102, Zona Colonial' },
  { id: 't-003', nombre: 'Supermercado El Sol', slug: 'supermercado-el-sol', telefono: '8095550199', direccion: 'Av. Winston Churchill #88' }
];

// --- ARREGLO DE PRODUCTOS INTEGRADO DIRECTAMENTE DE LA SOLICITUD DEL USUARIO ---
const catalogoProductos = [
  {
    id: "prod_001",
    tenant_id: "t-001",
    nombre: "Rica Leche Listamilk Lt",
    precio: 76,
    precioAnterior: 78,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 45
  },
  {
    id: "prod_002",
    tenant_id: "t-001",
    nombre: "Rica Leche Descremada Lt",
    precio: 76,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    stock: 30
  },
  {
    id: "prod_003",
    tenant_id: "t-001",
    nombre: "Bravo Leche Uht Entera 1Lt",
    precio: 59,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 50
  },
  {
    id: "prod_004",
    tenant_id: "t-001",
    nombre: "Bravo Leche Uht 1.5% 1Lt",
    precio: 49,
    precioAnterior: 52,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    stock: 24
  },
  {
    id: "prod_005",
    tenant_id: "t-001",
    nombre: "Bravo Dulce De Leche 400 Gr",
    precio: 139,
    precioAnterior: null,
    categoria: "Dulces y caramelos",
    imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80",
    stock: 18
  },
  {
    id: "prod_006",
    tenant_id: "t-001",
    nombre: "Rica Leche S/ Lactosa Lt",
    precio: 79,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 35
  },
  {
    id: "prod_007",
    tenant_id: "t-001",
    nombre: "Parmalat Leche Entera 1 Lt",
    precio: 75,
    precioAnterior: 86,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    stock: 40
  },
  {
    id: "prod_008",
    tenant_id: "t-001",
    nombre: "Rica Leche Semi Descremada Lt",
    precio: 76,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 20
  },
  {
    id: "prod_009",
    tenant_id: "t-001",
    nombre: "Parmalat Leche Semidescremada Lt",
    precio: 75,
    precioAnterior: 86,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    stock: 25
  },
  {
    id: "prod_010",
    tenant_id: "t-001",
    nombre: "Rica Leche Listamilk 250 Ml",
    precio: 30,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 60
  },
  {
    id: "prod_011",
    tenant_id: "t-001",
    nombre: "Parmalat Leche Descremada 1 Lt",
    precio: 75,
    precioAnterior: 86,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    stock: 15
  },
  {
    id: "prod_012",
    tenant_id: "t-001",
    nombre: "Bravo Leche Uht Descremada",
    precio: 49,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 30
  },
  {
    id: "prod_013",
    tenant_id: "t-001",
    nombre: "Bravo Leche Uht Entera S/L (Botella)",
    precio: 69,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    stock: 22
  },
  {
    id: "prod_014",
    tenant_id: "t-001",
    nombre: "Parmalat Leche Zimil Baja Lactosa",
    precio: 98,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 18
  },
  {
    id: "prod_015",
    tenant_id: "t-001",
    nombre: "Bravo Leche Uht Descremada (Botella)",
    precio: 55,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    stock: 14
  },
  {
    id: "prod_016",
    tenant_id: "t-001",
    nombre: "Rica Leche Sin Lactosa 0 % Grasa",
    precio: 79,
    precioAnterior: 84,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 35
  },
  {
    id: "prod_017",
    tenant_id: "t-001",
    nombre: "Bravo Leche Condensada",
    precio: 109,
    precioAnterior: null,
    categoria: "Dulces y caramelos",
    imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80",
    stock: 40
  },
  {
    id: "prod_018",
    tenant_id: "t-001",
    nombre: "Ia Leche Corporal Proteinas",
    precio: 179,
    precioAnterior: null,
    categoria: "Higiene y salud",
    imagen: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
    stock: 12
  },
  {
    id: "prod_019",
    tenant_id: "t-001",
    nombre: "Caf Tres Leches",
    precio: 139,
    precioAnterior: null,
    categoria: "Dulces y caramelos",
    imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80",
    stock: 15
  },
  {
    id: "prod_020",
    tenant_id: "t-001",
    nombre: "Carnation Leche Evaporada",
    precio: 69,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80",
    stock: 80
  },
  {
    id: "prod_021",
    tenant_id: "t-001",
    nombre: "Nido Leche Crecimiento",
    precio: 315,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    stock: 25
  },
  {
    id: "prod_022",
    tenant_id: "t-001",
    nombre: "Parmalat Leche Con Avena Lt",
    precio: 124,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    stock: 16
  },
  {
    id: "prod_023",
    tenant_id: "t-001",
    nombre: "Bravo Chocolate Con Leche",
    precio: 129,
    precioAnterior: null,
    categoria: "Dulces y caramelos",
    imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80",
    stock: 22
  },
  {
    id: "prod_024",
    tenant_id: "t-001",
    nombre: "Bravo Leche Evaporada 315 Ml",
    precio: 44,
    precioAnterior: 52,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80",
    stock: 65
  },
  {
    id: "prod_025",
    tenant_id: "t-001",
    nombre: "Bravo Crema Leche 200 Ml",
    precio: 64,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 28
  },
  {
    id: "prod_026",
    tenant_id: "t-001",
    nombre: "Bravo Crema Leche 1 L",
    precio: 279,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    stock: 10
  },
  {
    id: "prod_027",
    tenant_id: "t-001",
    nombre: "Bravo Leche Evaporada 1 Lt",
    precio: 159,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 35
  },
  {
    id: "prod_028",
    tenant_id: "t-001",
    nombre: "Bravo Leche Evaporada 200 Ml",
    precio: 36,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    stock: 50
  },
  {
    id: "prod_029",
    tenant_id: "t-001",
    nombre: "Bravo Leche Coco 10,5 Oz",
    precio: 60,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80",
    stock: 35
  },
  {
    id: "prod_030",
    tenant_id: "t-001",
    nombre: "Mubravo Mozzarella",
    precio: 259,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=400&q=80",
    stock: 10
  },
  {
    id: "prod_031",
    tenant_id: "t-001",
    nombre: "Bravo Leche Uht Proteina",
    precio: 99,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    stock: 25
  },
  {
    id: "prod_032",
    tenant_id: "t-001",
    nombre: "La Famosa Leche Coco 1...",
    precio: 139,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80",
    stock: 18
  },
  {
    id: "prod_033",
    tenant_id: "t-001",
    nombre: "Pan Leche Y Vainilla 8 Und",
    precio: 89,
    precioAnterior: null,
    categoria: "Dulces y caramelos",
    imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
    stock: 20
  },
  {
    id: "prod_034",
    tenant_id: "t-001",
    nombre: "Milex Leche Refill 1500 Gr",
    precio: 1424,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    stock: 15
  },
  {
    id: "prod_035",
    tenant_id: "t-001",
    nombre: "Nido Leche Fortificada 2200 Gr",
    precio: 1639,
    precioAnterior: 1784,
    categoria: "Lácteos",
    imagen: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    stock: 12
  }
];

// Categorías del Colmado
const CATEGORIAS = [
  { id: 'all', nombre: '⭐ Todos los Productos', icon: '🛒' },
  { id: 'Lácteos', nombre: '🥛 Lácteos', icon: '🥛' },
  { id: 'Dulces y caramelos', nombre: '🍬 Dulces & Caramelos', icon: '🍬' },
  { id: 'Higiene y salud', nombre: '🧴 Higiene & Salud', icon: '🧴' },
  { id: 'Bebidas', nombre: '🍺 Bebidas', icon: '🍺' },
  { id: 'Víveres y Granos', nombre: '🌾 Víveres & Granos', icon: '🌾' },
  { id: 'Embutidos', nombre: '🍖 Embutidos', icon: '🍖' }
];

const CLIENTES = [
  { id: 'consumidor_final', nombre: '👤 Consumidor Final', tipo: 'contado' },
  { id: 'fiado_carlos', nombre: '📒 Carlos Mendoza (Fiado/Crédito)', tipo: 'credito' },
  { id: 'fiado_maria', nombre: '📒 María Rodríguez (Fiado/Crédito)', tipo: 'credito' },
  { id: 'fiado_jose', nombre: '📒 José Luis Almonte (Fiado/Crédito)', tipo: 'credito' }
];

function SuperAdminContainer() {
  useEffect(() => {
    if (window.SuperAdminModule && window.SuperAdminModule.initSuperAdminModule) {
      window.SuperAdminModule.initSuperAdminModule('superadmin-root');
    }
  }, []);

  return <div id="superadmin-root" className="w-full"></div>;
}

function App() {
  const [tenants] = useState(DEMO_TENANTS);
  const [activeTenantId, setActiveTenantId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    if (tenantParam) {
      const found = DEMO_TENANTS.find(t => t.slug === tenantParam || t.id === tenantParam);
      if (found) return found.id;
    }
    return 't-001';
  });
  const [productos, setProductos] = useState(catalogoProductos);
  const [activeTab, setActiveTab] = useState(() => {
    if (window.location.hash.includes('orders')) return 'orders';
    if (window.location.hash.includes('inventory')) return 'inventory';
    return 'pos';
  });

  // ESTADO REALTIME DE PEDIDOS SOLICITADOS POR CLIENTES
  const [pedidos, setPedidos] = useState(() => {
    return window.AppState?.pedidos || [
      {
        id: 'PED-9081',
        cliente_nombre: 'Carlos Mendoza',
        cliente_telefono: '8095550199',
        direccion_entrega: 'Calle Pepillo Salcedo #14, Ens. La Fe',
        monto_total: 545.00,
        metodo_pago: 'Efectivo (Paga con $1,000 - Devuelta: $455.00)',
        estado: 'pendiente',
        delivery_token: 'DEL-8F3A29',
        created_at: new Date().toISOString(),
        detalles: [{ cantidad: 2, nombre: 'Rica Leche Listamilk Lt', precio_unitario: 76 }]
      }
    ];
  });

  // Búsqueda y Filtros POS / Catálogo
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Carrito y Caja POS
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('consumidor_final');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  // ESTADO DEL DIRECTORIO DE CLIENTES DEL COLMADO
  const [clientesList, setClientesList] = useState(() => {
    try {
      const saved = localStorage.getItem('syspim_clientes_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'c-101', nombre: 'Carlos Mendoza', telefono: '8095550199', direccion: 'Calle Pepillo Salcedo #14, Ens. La Fe', tipo: 'credito', pedidosCount: 14, totalComprado: 8950.00, ultimoPedido: 'Hoy 18:30' },
      { id: 'c-102', nombre: 'María Rodríguez', telefono: '8095131416', direccion: 'Av. 27 de Febrero #45, Apt. 3B', tipo: 'contado', pedidosCount: 8, totalComprado: 4320.00, ultimoPedido: 'Ayer' },
      { id: 'c-103', nombre: 'José Luis Almonte', telefono: '8095550122', direccion: 'Calle El Conde #102', tipo: 'credito', pedidosCount: 22, totalComprado: 15400.00, ultimoPedido: 'Hace 2 días' },
      { id: 'c-104', nombre: 'Ana Julia Peralta', telefono: '8095550188', direccion: 'Calle Sol #5, Los Prados', tipo: 'contado', pedidosCount: 5, totalComprado: 2890.00, ultimoPedido: 'Hace 3 días' }
    ];
  });

  // Sincronizar directorio de clientes con localStorage
  useEffect(() => {
    try {
      localStorage.setItem('syspim_clientes_list', JSON.stringify(clientesList));
    } catch (e) {}
  }, [clientesList]);

  // Estados para modales de clientes y compartir PWA por WhatsApp
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustType, setNewCustType] = useState('contado');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const [showSharePwaModal, setShowSharePwaModal] = useState(false);
  const [sharePhone, setSharePhone] = useState('');

  // Modales & Toast
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [toast, setToast] = useState(null);

  const searchInputRef = useRef(null);

  // ESCUCHADOR REALTIME CROSS-TAB & SUPABASE PARA NUEVOS PEDIDOS DE CLIENTES
  useEffect(() => {
    const handleNewOrder = (newOrder) => {
      setPedidos(prev => {
        if (prev.some(p => p.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });

      // Auto-registrar cliente en el directorio del colmado si no existe
      if (newOrder.cliente_nombre) {
        setClientesList(prev => {
          const phone = newOrder.cliente_telefono || '';
          const existingIdx = prev.findIndex(c => (phone && c.telefono === phone) || c.nombre.toLowerCase() === newOrder.cliente_nombre.toLowerCase());
          const orderAmount = newOrder.monto_total || newOrder.total || 0;
          
          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...updated[existingIdx],
              pedidosCount: (updated[existingIdx].pedidosCount || 0) + 1,
              totalComprado: (updated[existingIdx].totalComprado || 0) + orderAmount,
              ultimoPedido: 'Hoy',
              direccion: newOrder.direccion_entrega || updated[existingIdx].direccion
            };
            return updated;
          } else {
            const newCustomerObj = {
              id: 'c-' + Date.now(),
              nombre: newOrder.cliente_nombre,
              telefono: newOrder.cliente_telefono || '',
              direccion: newOrder.direccion_entrega || '',
              tipo: 'contado',
              pedidosCount: 1,
              totalComprado: orderAmount,
              ultimoPedido: 'Hoy'
            };
            return [newCustomerObj, ...prev];
          }
        });
      }

      // Actualizar memoria global
      if (window.AppState) {
        window.AppState.pedidos = window.AppState.pedidos || [];
        if (!window.AppState.pedidos.some(p => p.id === newOrder.id)) {
          window.AppState.pedidos.unshift(newOrder);
        }
      }

      setToast(`🛎️ ¡Nuevo pedido ${newOrder.id} de ${newOrder.cliente_nombre || 'Cliente'}!`);

      // Alerta Sonora
      if (window.AdminModule && window.AdminModule.playNotificationSound) {
        window.AdminModule.playNotificationSound();
      }
    };

    // 1. Escuchador de BroadcastChannel
    let broadcast;
    try {
      broadcast = new BroadcastChannel('syspim_orders_channel');
      broadcast.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_ORDER' && event.data.order) {
          handleNewOrder(event.data.order);
        }
      };
    } catch (e) {
      console.log('BroadcastChannel error:', e);
    }

    // 2. Escuchador de localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'syspim_last_order' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleNewOrder(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Escuchador de Supabase Realtime si está configurado
    let supabaseSubscription;
    if (window.supabaseClient) {
      supabaseSubscription = window.supabaseClient
        .channel('public:pedidos')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
          if (payload.new) handleNewOrder(payload.new);
        })
        .subscribe();
    }

    return () => {
      if (broadcast) broadcast.close();
      window.removeEventListener('storage', handleStorageChange);
      if (supabaseSubscription && window.supabaseClient) {
        window.supabaseClient.removeChannel(supabaseSubscription);
      }
    };
  }, []);

  // Teclas de Atajo POS (F2, F4, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (searchInputRef.current) searchInputRef.current.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) handleCheckout();
      } else if (e.key === 'Escape') {
        if (cart.length > 0) {
          setCart([]);
          showToast('🧹 Carrito limpiado');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  const activeTenant = useMemo(() => {
    return tenants.find(t => t.id === activeTenantId) || tenants[0];
  }, [tenants, activeTenantId]);

  const tenantProducts = useMemo(() => {
    return productos.filter(p => p.tenant_id === activeTenantId);
  }, [productos, activeTenantId]);

  const filteredProducts = useMemo(() => {
    return tenantProducts.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.categoria && p.categoria.toLowerCase().includes(searchQuery.toLowerCase()));
      if (selectedCategory === 'all') return matchSearch;
      return matchSearch && p.categoria === selectedCategory;
    });
  }, [tenantProducts, searchQuery, selectedCategory]);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast('⚠️ Producto agotado');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          showToast('⚠️ Stock máximo alcanzado');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`➕ ${product.nombre} agregado`);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.precio * item.qty), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const receipt = {
      id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cliente: CLIENTES.find(c => c.id === selectedCustomer)?.nombre || 'Consumidor Final',
      metodo: paymentMethod.toUpperCase(),
      items: [...cart],
      total: cartTotal
    };

    setCheckoutResult(receipt);
    setCart([]);
    showToast('🎉 ¡Venta procesada con éxito!');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-jakarta flex flex-col antialiased selection:bg-[#E0F2FE] selection:text-[#0284C7]">
      
      {/* Ambient Soft Mesh Background */}
      <div className="mesh-bg">
        <div className="mesh-blob-1"></div>
        <div className="mesh-blob-2"></div>
      </div>

      {/* TOAST FLOATER */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in-up">
          <span className="text-[#0284C7]">✨</span>
          <span>{toast}</span>
        </div>
      )}

      {/* 1. HEADER / TOP NAV LIGHT MINIMAL RETAIL */}
      {activeTab !== 'catalog' ? (
        /* HEADER PARA CAJERO / ADMINISTRADOR DEL COLMADO */
        <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] text-[#0F172A] px-4 lg:px-8 py-3.5 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* BRAND LOGO */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-[#0284C7] flex items-center justify-center text-white font-bold text-xl shadow-md shadow-[#0284C7]/20">
                🛒
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-xl tracking-tight text-[#0F172A]">
                    SYSPIM<span className="text-[#0284C7]">MARKET</span>
                  </h1>
                  <span className="text-[10px] font-bold tracking-wider bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-2.5 py-0.5 rounded-full">
                    MULTI-TENANT
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] font-medium">POS • Inventario • Pedidos & Delivery</p>
              </div>
            </div>

            {/* BADGE DE COLMADO ACTIVO & BOTONES DE COMPARTIR */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#E0F2FE] border border-[#BAE6FD] px-3.5 py-1.5 rounded-full text-xs">
                <span className="text-[#0369A1] font-bold text-[11px]">🏪 COLMADO:</span>
                <span className="text-[#0284C7] font-extrabold text-xs">{activeTenant?.nombre || 'Colmado Don Pedro'}</span>
              </div>

              <button 
                onClick={() => {
                  const slug = activeTenant?.slug || 'colmado-don-pedro';
                  const link = `${window.location.origin}${window.location.pathname.replace(/\/index\.html$/, '')}/catalog.html?tenant=${slug}`;
                  navigator.clipboard?.writeText(link);
                  setToast('🔗 Enlace del catálogo digital copiado');
                }} 
                className="bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
              >
                🔗 Copiar Link
              </button>
              <button 
                onClick={() => setShowSharePwaModal(true)} 
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-[#0284C7]/20 flex items-center gap-1.5"
              >
                <span>📲 Enviar a Cliente por WhatsApp</span>
              </button>
            </div>

          </div>

          {/* NAVEGACIÓN MÓDULOS POS TENANT */}
          <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2">
              {[
                { id: 'pos', icon: '🛒', label: 'Punto de Venta (POS)' },
                { id: 'inventory', icon: '📦', label: `Inventario (${tenantProducts.length})` },
                { id: 'orders', icon: '📋', label: `Pedidos & Delivery (${pedidos.length})` },
                { id: 'customers', icon: '👥', label: `Clientes (${clientesList.length})` }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === m.id
                      ? 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <span>{m.icon}</span> {m.label}
                </button>
              ))}
            </div>

            {/* BOTÓN APERTURA PANTALLA CLIENTE INDEPENDIENTE */}
            <a
              href={`catalog.html?tenant=${activeTenant?.slug || 'colmado-don-pedro'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#E0F2FE] hover:bg-[#0284C7] text-[#0369A1] hover:text-white border border-[#BAE6FD] transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              title="Abrir el catálogo digital independiente en una nueva ventana para el cliente"
            >
              <span>🛍️ Abrir Pantalla Cliente</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </header>
      ) : null}

      {/* 2. MAIN BODY GENERAL LIGHT RETAIL */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex-1">
        {/* ================= MODULO 1: PUNTO DE VENTA (POS ESCRITORIO) ================= */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LADO IZQUIERDO: BUSCADOR, CATEGORIAS Y GRID DE PRODUCTOS */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col lg:h-[calc(100vh-6rem)]">
              
              {/* HEADER FIJO: BUSCADOR Y CATEGORÍAS (NO SE ESCONDE AL HACER SCROLL) */}
              <div className="sticky top-0 bg-[#F8FAFC] z-20 pb-3 pt-1 space-y-3 border-b border-[#E2E8F0] mb-3">
                {/* BUSCADOR ROUNDED PILL (ESTILO ARCA CON LECTOR) */}
                <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex items-center gap-3">
                  <span className="text-lg text-[#94A3B8] ml-2">🔍</span>
                  <input 
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar 'leche', 'listamilk', 'parmalat', 'carnation', 'bravo'..."
                    className="bg-transparent w-full text-[#0F172A] font-medium placeholder-[#94A3B8] focus:outline-none text-sm"
                  />
                  <span className="hidden sm:inline-block text-[#94A3B8] font-mono text-xs pr-2">[|||]</span>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-xs text-[#94A3B8] hover:text-[#0F172A] pr-2">
                      ✕
                    </button>
                  )}
                </div>

                {/* CHIPS DE CONTEO Y CATEGORÍAS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIAS.map(cat => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                            isActive
                              ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD] shadow-sm'
                              : 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.nombre}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-[#64748B] whitespace-nowrap ml-2">
                    {filteredProducts.length} prods
                  </span>
                </div>
              </div>

              {/* RUEDA / SCROLLBAR INDEPENDIENTE PARA LA LISTA DE PRODUCTOS */}
              <div className="flex-1 overflow-y-auto pr-2 pb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    const pricePrev = product.precioAnterior || product.precio_anterior;

                    return (
                      <div 
                        key={product.id}
                        className={`bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all hover:shadow-md hover:border-[#BAE6FD] relative ${
                          isOutOfStock ? 'opacity-50 grayscale' : ''
                        }`}
                        onClick={() => !isOutOfStock && addToCart(product)}
                      >
                        {/* IMAGEN DEL PRODUCTO */}
                        <div className="w-full h-32 bg-[#FFFFFF] rounded-xl overflow-hidden mb-3 flex items-center justify-center p-2">
                          <img 
                            src={product.imagen || product.imagen_url} 
                            alt={product.nombre}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* INFORMACION DEL PRODUCTO */}
                        <div>
                          <h4 className="font-bold text-xs text-[#0F172A] line-clamp-2 leading-snug font-jakarta">
                            {product.nombre}
                          </h4>
                          <span className="text-[11px] text-[#64748B] block mt-0.5">
                            {product.categoria}
                          </span>
                          
                          <div className="flex items-center justify-between mt-1.5 text-[10px]">
                            <span className="text-[#64748B] font-medium">Stock: {product.stock}</span>
                            {isOutOfStock && (
                              <span className="text-[#EF4444] font-bold uppercase">Agotado</span>
                            )}
                          </div>
                        </div>

                        {/* PRECIO & BOTÓN "+" CIRCULAR ROJO (ESTILO EXACTO ARCA / BRAVO) */}
                        <div className="flex items-end justify-between pt-3 mt-2 border-t border-[#F1F5F9]">
                          <div>
                            <span className="font-bold text-sm text-[#0F172A] block font-jakarta">
                              RD$ {product.precio}
                            </span>
                            {pricePrev && (
                              <span className="text-[10px] text-[#EF4444] line-through font-normal">
                                RD$ {pricePrev}
                              </span>
                            )}
                          </div>

                          <button 
                            disabled={isOutOfStock}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className={`w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#FEE2E2] shadow-sm flex items-center justify-center text-[#EF4444] font-bold text-lg hover:bg-[#FEF2F2] hover:scale-105 active:scale-95 transition-all ${
                              isOutOfStock ? 'opacity-40 cursor-not-allowed text-[#64748B] bg-[#F1F5F9]' : ''
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* LADO DERECHO: PANEL DE CAJA (ESTILO ARCA LIGHT) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pr-1">
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                
                <div>
                  {/* HEADER CAJA */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] font-bold text-sm">
                        🧾
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#0F172A] font-jakarta">Caja / Venta</h3>
                        <p className="text-[11px] text-[#64748B]">Resumen de la transacción</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] font-bold text-xs px-3 py-1 rounded-full">
                        🛒 {cartCount} items
                      </span>
                      {cart.length > 0 && (
                        <button
                          onClick={() => setCart([])}
                          className="text-xs font-bold text-[#EF4444] hover:text-[#DC2626] bg-[#FEE2E2] border border-[#FECACA] px-2.5 py-1 rounded-full transition-all"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SELECTOR DE CLIENTE */}
                  <div className="mt-4">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 block">
                      CLIENTE / CUENTA:
                    </label>
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0284C7] transition-all"
                    >
                      {CLIENTES.map(c => (
                        <option key={c.id} value={c.id} className="bg-white text-[#0F172A]">{c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* LISTA DE ITEMS EN CARRITO */}
                  <div className="mt-4 max-h-[180px] overflow-y-auto space-y-2.5 pr-1">
                    {cart.length === 0 ? (
                      <div className="py-10 text-center border border-dashed border-[#E2E8F0] rounded-[16px] bg-[#F8FAFC]">
                        <span className="text-3xl block mb-1.5 opacity-40">🛒</span>
                        <p className="font-bold text-xs text-[#0F172A]">El carrito de caja está vacío</p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">Haz clic en "+" en cualquier tarjeta para agregar</p>
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.id} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-[14px] flex items-center justify-between gap-3">
                          <img src={item.imagen || item.imagen_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-white" />
                          
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs text-[#0F172A] truncate font-jakarta">{item.nombre}</h5>
                            <span className="text-[11px] font-semibold text-[#64748B] block">
                              RD$ {item.precio.toFixed(2)} c/u
                            </span>
                          </div>

                          {/* CONTROLES DE CANTIDAD */}
                          <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-full p-1 shadow-sm">
                            <button
                              onClick={() => updateCartQty(item.id, -1)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-bold text-[#0F172A] px-1 min-w-[18px] text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.id, 1)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]"
                            >
                              +
                            </button>
                          </div>

                          {/* MONTO ITEM TOTAL */}
                          <div className="text-right min-w-[65px]">
                            <span className="font-bold text-xs text-[#0F172A] block font-jakarta">
                              RD$ {(item.precio * item.qty).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>

                {/* PIE DEL PANEL DE CAJA Y SELECCION DE METODO DE PAGO */}
                <div className="mt-5 pt-4 border-t border-[#F1F5F9]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2 block">
                    MÉTODO DE PAGO:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 mb-4">
                    {[
                      { id: 'efectivo', label: '💵 EFECTIVO' },
                      { id: 'tarjeta', label: '💳 TARJETA' },
                      { id: 'transferencia', label: '📲 TRANSFER' },
                      { id: 'fiado', label: '📒 FIADO' }
                    ].map(m => {
                      const active = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id)}
                          className={`py-2 rounded-full text-[10px] font-bold transition-all border ${
                            active
                              ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD] shadow-sm'
                              : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* BLOQUE DE TOTAL LIGHT RETAIL */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] p-4 rounded-[16px] flex items-center justify-between mb-4 shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] block">
                        TOTAL A COBRAR
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Subtotal: RD$ {cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="font-extrabold text-2xl tracking-tight text-[#0284C7] font-jakarta">
                      RD$ {cartTotal.toFixed(2)}
                    </div>
                  </div>

                  {/* BOTON GIGANTE COBRAR AHORA F4 */}
                  <button
                    disabled={cart.length === 0}
                    onClick={handleCheckout}
                    className={`w-full py-3.5 rounded-[14px] font-bold text-sm tracking-wide flex items-center justify-center gap-3 transition-all ${
                      cart.length === 0
                        ? 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed'
                        : 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-lg shadow-[#0284C7]/20 cursor-pointer'
                    }`}
                  >
                    <span>COBRAR AHORA</span>
                    <kbd className="bg-white text-[#0F172A] font-mono text-xs px-2.5 py-0.5 rounded-md border border-[#E2E8F0]">
                      F4
                    </kbd>
                  </button>

                </div>

              </div>
            </div>

          </div>
        )}



        {/* ================= MODULO 2: INVENTARIO ================= */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in-up">
            
            {/* FORMULARIO AGREGAR PRODUCTO */}
            <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="font-bold text-base text-[#0F172A] font-jakarta">➕ Agregar Producto al Inventario</h3>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">Nombre del producto</label>
                  <input type="text" placeholder="Ej: Parmalat Leche Entera 1L" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] font-medium" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">Clasificación / Categoría</label>
                  <select className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] font-bold focus:outline-none focus:border-[#0284C7] transition-all">
                    <option value="">Seleccionar Clasificación...</option>
                    {CATEGORIAS.filter(c => c.id !== 'todos').map(c => (
                      <option key={c.id} value={c.nombre}>{c.icon} {c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">Precio RD$</label>
                    <input type="number" placeholder="RD$ 0.00" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">Stock Inicial</label>
                    <input type="number" placeholder="Unidades" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] font-medium" />
                  </div>
                </div>

                <button type="button" onClick={() => showToast('📦 Producto Guardado')} className="w-full py-3 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs shadow-md shadow-[#0284C7]/20 transition-all">
                  Guardar Producto
                </button>
              </form>
            </div>

            {/* TABLA DE PRODUCTOS EN INVENTARIO (CLARO RETAIL) */}
            <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <h3 className="font-bold text-base text-[#0F172A] font-jakarta mb-4">📦 Productos Registrados ({tenantProducts.length})</h3>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-mono tracking-wider bg-[#F8FAFC]">
                      <th className="py-3.5 px-4 font-bold">ID</th>
                      <th className="py-3.5 px-4 font-bold">Producto</th>
                      <th className="py-3.5 px-4 font-bold">Categoría</th>
                      <th className="py-3.5 px-4 font-bold">Precio</th>
                      <th className="py-3.5 px-4 font-bold">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] font-medium">
                    {tenantProducts.map(p => (
                      <tr key={p.id} className="hover:bg-[#F8FAFC] transition-all">
                        <td className="py-3.5 px-4 font-mono text-[10px] text-[#64748B]">{p.id}</td>
                        <td className="py-3.5 px-4 font-bold text-[#0F172A] font-jakarta">{p.nombre}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                            {p.categoria}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#0284C7] font-bold">RD$ {p.precio}</td>
                        <td className="py-3.5 px-4 text-[#0F172A] font-semibold">{p.stock} unid</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= MODULO 3: PEDIDOS ================= */}
        {activeTab === 'orders' && (
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#0F172A] font-jakarta">📋 Pedidos del Colmado & Delivery</h3>
              <button 
                onClick={() => {
                  if (window.AdminModule && window.AdminModule.unlockAudioContext) {
                    window.AdminModule.unlockAudioContext();
                  }
                  showToast('🔔 Alertas de audio y Realtime activas');
                }}
                className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-full text-xs font-bold shadow-md shadow-[#0284C7]/20 transition-all"
              >
                🔔 Conectar POS / Activar Sonido
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {pedidos.map(ped => (
                <div key={ped.id} className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-[16px] space-y-3 shadow-sm hover:border-[#BAE6FD] transition-all">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                    <div>
                      <span className="font-extrabold text-sm text-[#0F172A] font-jakarta block">#{ped.id.slice(-8)} • {ped.cliente_nombre || ped.customer_info?.nombre || 'Cliente'}</span>
                      <span className="text-[11px] text-[#64748B] font-mono">📞 {ped.cliente_telefono || 'Sin Teléfono'}</span>
                    </div>
                    {/* SELECTOR DE ESTADO INTERACTIVO */}
                    <select
                      value={ped.estado || ped.status || 'pendiente'}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setPedidos(prev => prev.map(p => {
                          if (p.id === ped.id) {
                            const updated = { ...p, estado: newStatus, status: newStatus };
                            try {
                              const broadcast = new BroadcastChannel('syspim_orders_channel');
                              broadcast.postMessage({ type: 'STATUS_UPDATE', order: updated });
                              broadcast.close();
                            } catch (err) {}
                            return updated;
                          }
                          return p;
                        }));
                        setToast(`✅ Estado del pedido marcado como: ${newStatus.toUpperCase()}`);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border cursor-pointer focus:outline-none transition-all ${
                        (ped.estado || ped.status) === 'completado' || (ped.estado || ped.status) === 'entregado'
                          ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                          : (ped.estado || ped.status) === 'en_camino' || (ped.estado || ped.status) === 'despachado'
                          ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]'
                          : (ped.estado || ped.status) === 'cancelado'
                          ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                          : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                      }`}
                    >
                      <option value="pendiente" className="bg-white text-[#B45309]">🟡 PENDIENTE</option>
                      <option value="en_camino" className="bg-white text-[#0284C7]">🛵 EN CAMINO</option>
                      <option value="completado" className="bg-white text-[#15803D]">✅ ENTREGADO</option>
                      <option value="cancelado" className="bg-white text-[#DC2626]">❌ CANCELADO</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-[#64748B]">
                    <p><strong className="text-[#0F172A]">📍 Dirección:</strong> {ped.direccion_entrega || ped.customer_info?.direccion || 'Recogida local'}</p>
                    <p><strong className="text-[#0F172A]">💳 Pago:</strong> <span className="text-[#0369A1] font-bold">{ped.metodo_pago}</span></p>
                    <p className="font-mono text-[11px]"><strong className="text-[#0F172A]">🔑 Token Repartidor:</strong> <strong className="text-[#0284C7] font-bold">{ped.delivery_token || 'DEL-000000'}</strong></p>
                  </div>

                  {/* DESGLOSE DE PRODUCTOS SOLICITADOS */}
                  {ped.detalles && ped.detalles.length > 0 && (
                    <div className="bg-white border border-[#E2E8F0] p-2.5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#64748B] block">Productos Solicitados:</span>
                      {ped.detalles.map((d, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-[#0F172A]">
                          <span>• {d.cantidad}x {d.nombre}</span>
                          <span className="font-mono text-[#64748B]">RD$ {(d.precio_unitario * d.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-3 border-t border-[#E2E8F0]">
                    <span className="font-extrabold text-[#15803D] text-base font-jakarta">
                      RD$ {(ped.monto_total || ped.total || 0).toFixed(2)}
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* BOTÓN RÁPIDO PARA CAMBIAR DE ESTADO PENDIENTE -> EN CAMINO -> ENTREGADO */}
                      {(ped.estado || ped.status || 'pendiente') === 'pendiente' && (
                        <button
                          onClick={() => {
                            setPedidos(prev => prev.map(p => p.id === ped.id ? { ...p, estado: 'en_camino', status: 'en_camino' } : p));
                            setToast(`🛵 Pedido marcado como EN CAMINO`);
                          }}
                          className="flex-1 sm:flex-initial px-3 py-2 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309] border border-[#FDE68A] font-extrabold rounded-full text-xs flex items-center justify-center gap-1 transition-all"
                        >
                          🛵 Despachar
                        </button>
                      )}

                      {((ped.estado || ped.status) === 'en_camino' || (ped.estado || ped.status) === 'despachado') && (
                        <button
                          onClick={() => {
                            setPedidos(prev => prev.map(p => p.id === ped.id ? { ...p, estado: 'completado', status: 'completado' } : p));
                            setToast(`✅ Pedido completado y marcado como ENTREGADO`);
                          }}
                          className="flex-1 sm:flex-initial px-3 py-2 bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] border border-[#86EFAC] font-extrabold rounded-full text-xs flex items-center justify-center gap-1 transition-all"
                        >
                          ✅ Completar
                        </button>
                      )}

                      {/* BOTÓN 1: IMPRIMIR TICKET TÉRMICO */}
                      <button 
                        onClick={() => {
                          if (window.AdminModule && window.AdminModule.acceptAndPrintOrder) {
                            window.AdminModule.acceptAndPrintOrder(ped.id, ped);
                          } else {
                            const receipt = document.getElementById('thermal-receipt');
                            if (receipt) {
                              receipt.innerHTML = `
                                <div style="text-align:center; font-family:monospace; font-size:12px; padding:10px;">
                                  <h2>${activeTenant?.nombre || 'COLMADO DON PEDRO'}</h2>
                                  <p>PEDIDO #${ped.id.slice(-8)}</p>
                                  <hr/>
                                  <p style="text-align:left;">
                                    <strong>CLIENTE:</strong> ${ped.cliente_nombre || 'Cliente'}<br/>
                                    <strong>TEL:</strong> ${ped.cliente_telefono || ''}<br/>
                                    <strong>DIR:</strong> ${ped.direccion_entrega || ''}<br/>
                                    <strong>PAGO:</strong> ${ped.metodo_pago || 'Efectivo'}
                                  </p>
                                  <hr/>
                                  <p style="font-size:14px; font-weight:bold;">TOTAL: RD$ ${(ped.monto_total || 0).toFixed(2)}</p>
                                  <p style="background:#000; color:#fff; padding:4px; font-weight:bold;">TOKEN: ${ped.delivery_token || 'DEL-000000'}</p>
                                </div>
                              `;
                            }
                            window.print();
                          }
                        }}
                        className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-full text-xs shadow-md shadow-[#0284C7]/20 flex items-center justify-center gap-1 transition-all"
                      >
                        🖨️ Imprimir Ticket
                      </button>

                      {/* BOTÓN 2: ENVIAR PEDIDO AL WHATSAPP DEL REPARTIDOR / DELIVERY */}
                      <button
                        onClick={() => {
                          const repartidorPhone = prompt('Ingresa el WhatsApp del Delivery / Repartidor:', '8095550199');
                          if (!repartidorPhone) return;

                          // Construir enlace directo de ejecución para el repartidor
                          const baseUrl = window.location.origin + window.location.pathname.replace(/\/index\.html$/, '/');
                          const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
                          const deliveryLink = `${cleanBaseUrl}delivery.html?token=${ped.delivery_token || ped.id}`;

                          const colmado = activeTenant?.nombre || 'COLMADO DON PEDRO';
                          const rawMsg = `🛵 DESPACHO DE DELIVERY - ${colmado}\n\n` +
                                         `📦 Pedido #${ped.id.slice(-8)}\n` +
                                         `👤 Cliente: ${ped.cliente_nombre || 'Cliente'}\n` +
                                         `📞 Teléfono: ${ped.cliente_telefono || 'N/A'}\n` +
                                         `📍 Dirección: ${ped.direccion_entrega}\n\n` +
                                         `💳 Forma de Pago: ${ped.metodo_pago}\n` +
                                         `💵 TOTAL A COBRAR: RD$ ${(ped.monto_total || 0).toFixed(2)}\n\n` +
                                         `🔑 Abrir en Panel de Delivery:\n${deliveryLink}`;

                          const encodedMsg = encodeURIComponent(rawMsg);
                          window.open(`https://wa.me/${repartidorPhone.replace(/[^0-9]/g, '')}?text=${encodedMsg}`, '_blank');
                        }}
                        className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-full text-xs shadow-md shadow-[#15803D]/20 flex items-center justify-center gap-1 transition-all"
                      >
                        📲 Enviar a Delivery
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= MODULO: DIRECTORIO DE CLIENTES DEL COLMADO ================= */}
        {activeTab === 'customers' && (
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-6 animate-fade-in-up">
            
            {/* HEADER DEL MÓDULO DE CLIENTES */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="font-extrabold text-xl text-[#0F172A] font-jakarta flex items-center gap-2">
                  <span>👥 Directorio de Clientes</span>
                  <span className="text-xs bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] px-3 py-0.5 rounded-full font-bold">
                    {clientesList.length} registrados
                  </span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">Gestión de clientes, historial de compras, fiaos/créditos y envío de catálogo por WhatsApp.</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowSharePwaModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] font-bold text-xs rounded-full border border-[#BAE6FD] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>📲 Compartir Catálogo PWA</span>
                </button>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs rounded-full shadow-md shadow-[#0284C7]/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>+ Agregar Cliente</span>
                </button>
              </div>
            </div>

            {/* BARRA DE BÚSQUEDA DE CLIENTES */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-full flex items-center gap-3 shadow-sm">
              <span className="text-base text-[#94A3B8] ml-2">🔍</span>
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                placeholder="Buscar cliente por nombre, teléfono o dirección..."
                className="bg-transparent w-full text-[#0F172A] text-xs font-bold placeholder-[#94A3B8] focus:outline-none"
              />
              {customerSearchQuery && (
                <button onClick={() => setCustomerSearchQuery('')} className="text-xs text-[#94A3B8] hover:text-[#0F172A] pr-2">✕</button>
              )}
            </div>

            {/* TARJETAS / DIRECTORIO DE CLIENTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientesList
                .filter(c => {
                  const q = customerSearchQuery.toLowerCase();
                  return c.nombre.toLowerCase().includes(q) || (c.telefono || '').includes(q) || (c.direccion || '').toLowerCase().includes(q);
                })
                .map(cust => {
                  const cleanPhone = (cust.telefono || '').replace(/[^0-9]/g, '');
                  const initial = cust.nombre ? cust.nombre.charAt(0).toUpperCase() : '👤';
                  
                  return (
                    <div key={cust.id} className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-[18px] flex flex-col justify-between gap-4 shadow-sm hover:border-[#BAE6FD] hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center font-extrabold text-base shadow-sm">
                            {initial}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-[#0F172A] font-jakarta flex items-center gap-2">
                              {cust.nombre}
                              {cust.tipo === 'credito' && (
                                <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                  📒 Fiado / Crédito
                                </span>
                              )}
                            </h4>
                            <span className="text-[11px] font-mono text-[#64748B] block mt-0.5">
                              📞 {cust.telefono || 'Sin teléfono'}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-[#64748B] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-full whitespace-nowrap">
                          {cust.pedidosCount || 0} pedidos
                        </span>
                      </div>

                      <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl space-y-1 text-xs">
                        <div className="flex items-start gap-1.5 text-[#64748B]">
                          <span className="flex-shrink-0">📍</span>
                          <span className="font-semibold text-[#0F172A] leading-tight">{cust.direccion || 'Dirección no registrada'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9] text-[11px]">
                          <span className="text-[#64748B]">Total Comprado: <strong className="text-[#15803D]">RD$ {(cust.totalComprado || 0).toFixed(2)}</strong></span>
                          <span className="text-[#94A3B8] text-[10px]">Último: {cust.ultimoPedido || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            const slug = activeTenant?.slug || 'colmado-don-pedro';
                            const link = `${window.location.origin}${window.location.pathname.replace(/\/index\.html$/, '')}/catalog.html?tenant=${slug}`;
                            const msg = `Hola ${cust.nombre}! 🛍️ Te compartimos nuestro Catálogo Digital Oficial de ${activeTenant?.nombre || 'Colmado Don Pedro'}.\n\nHaz tu pedido a domicilio aquí:\n${link}`;
                            window.open(`https://wa.me/${cleanPhone ? '1' + cleanPhone : ''}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="flex-1 px-3 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-full shadow-sm flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>📲 WhatsApp</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(cust.id);
                            setActiveTab('pos');
                            setToast(`👤 Cliente ${cust.nombre} seleccionado en Caja`);
                          }}
                          className="flex-1 px-3 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-full shadow-sm flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>🛒 Vender en POS</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        )}

        {/* ================= MODULO 4: SUPER ADMIN SAAS ================= */}
        {activeTab === 'superadmin' && (
          <SuperAdminContainer />
        )}

      </main>

      {/* MODAL: REGISTRAR NUEVO CLIENTE */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-[24px] shadow-2xl border border-[#E2E8F0] space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                <span>👤 Registrar Nuevo Cliente</span>
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="w-8 h-8 rounded-full bg-[#F1F5F9] text-gray-500 font-bold">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newCustName.trim()) return;
              const newC = {
                id: 'c-' + Date.now(),
                nombre: newCustName.trim(),
                telefono: newCustPhone.trim(),
                direccion: newCustAddress.trim(),
                tipo: newCustType,
                pedidosCount: 0,
                totalComprado: 0,
                ultimoPedido: 'Reciente'
              };
              setClientesList(prev => [newC, ...prev]);
              setNewCustName('');
              setNewCustPhone('');
              setNewCustAddress('');
              setShowAddCustomerModal(false);
              setToast(`✅ Cliente ${newC.nombre} guardado`);
            }} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="text-[#64748B] block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-[#64748B] block mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Ej: 809-555-0100"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-[#64748B] block mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  placeholder="Ej: Calle Principal #45, Apt 2B"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-[#64748B] block mb-1">Tipo de Cuenta</label>
                <select
                  value={newCustType}
                  onChange={(e) => setNewCustType(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="contado">Contado (Pago Inmediato)</option>
                  <option value="credito">Fiado / Crédito</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddCustomerModal(false)} className="px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-full">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-full shadow-md shadow-[#0284C7]/20">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPARTIR CATÁLOGO PWA POR WHATSAPP */}
      {showSharePwaModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-[24px] shadow-2xl border border-[#E2E8F0] space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                <span>📲 Compartir PWA por WhatsApp</span>
              </h3>
              <button onClick={() => setShowSharePwaModal(false)} className="w-8 h-8 rounded-full bg-[#F1F5F9] text-gray-500 font-bold">✕</button>
            </div>

            <p className="text-xs text-[#64748B]">Envía el catálogo digital de tu colmado a tus clientes para que hagan pedidos a domicilio fácilmente desde su celular.</p>

            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-[#64748B] block mb-1">Teléfono del Cliente (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="Ej: 809-555-0100"
                  value={sharePhone}
                  onChange={(e) => setSharePhone(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="bg-[#E0F2FE] border border-[#BAE6FD] p-3 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#0369A1]">Mensaje que recibirá el cliente:</span>
                <p className="text-[11px] text-[#0284C7] font-normal leading-relaxed">
                  "¡Hola! Te compartimos nuestro Catálogo Digital Oficial de {activeTenant?.nombre || 'Colmado Don Pedro'} 🛍️. Haz tus pedidos a domicilio directamente desde aquí: {window.location.origin}/catalog.html?tenant={activeTenant?.slug || 'colmado-don-pedro'}"
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowSharePwaModal(false)} className="px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-full">Cancelar</button>
                <button 
                  type="button" 
                  onClick={() => {
                    const cleanPhone = sharePhone.replace(/[^0-9]/g, '');
                    const slug = activeTenant?.slug || 'colmado-don-pedro';
                    const pwaUrl = `${window.location.origin}${window.location.pathname.replace(/\/index\.html$/, '')}/catalog.html?tenant=${slug}`;
                    const msg = `¡Hola! 🛍️ Te compartimos nuestro Catálogo Digital Oficial de ${activeTenant?.nombre || 'Colmado Don Pedro'}.\n\nHaz tus pedidos a domicilio directamente desde aquí:\n${pwaUrl}`;
                    window.open(`https://wa.me/${cleanPhone ? '1' + cleanPhone : ''}?text=${encodeURIComponent(msg)}`, '_blank');
                    setShowSharePwaModal(false);
                    setToast('📲 WhatsApp abierto');
                  }} 
                  className="px-5 py-2 text-xs font-bold bg-[#15803D] hover:bg-[#166534] text-white rounded-full shadow-md shadow-[#15803D]/20 flex items-center gap-1.5"
                >
                  <span>📲 Abrir WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHECKOUT CONFIRMACION */}
      {checkoutResult && (
        <div className="fixed inset-0 z-50 bg-[#060B14]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111827] max-w-md w-full p-6 rounded-[18px] shadow-[0_12px_32px_rgba(0,0,0,0.35)] border border-[#2A364B] text-center space-y-4 animate-fade-in-up">
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-2xl flex items-center justify-center mx-auto font-bold">
              ✓
            </div>
            <h3 className="font-bold text-xl text-[#F8FAFC] font-jakarta">¡Venta Completada con Éxito!</h3>
            <p className="text-xs text-[#94A3B8] font-mono">Ticket: {checkoutResult.id} • {checkoutResult.fecha}</p>

            <div className="bg-[#182235] border border-[#2A364B] p-4 rounded-[14px] text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#2A364B] pb-2">
                <span className="text-[#94A3B8]">Cliente:</span>
                <span className="font-bold text-[#F8FAFC]">{checkoutResult.cliente}</span>
              </div>
              <div className="flex justify-between border-b border-[#2A364B] pb-2">
                <span className="text-[#94A3B8]">Método Pago:</span>
                <span className="font-bold text-[#F8FAFC]">{checkoutResult.metodo}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span className="text-[#F8FAFC]">TOTAL COBRADO:</span>
                <span className="text-[#22C55E] font-bold">RD$ {checkoutResult.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => {
                  if (window.AdminModule && window.AdminModule.acceptAndPrintOrder) {
                    const printOrderData = {
                      id: checkoutResult.id,
                      cliente_nombre: checkoutResult.cliente,
                      monto_total: checkoutResult.total,
                      metodo_pago: checkoutResult.metodo,
                      created_at: new Date().toISOString(),
                      delivery_token: 'POS-DIRECTO',
                      detalles: (checkoutResult.items || []).map(i => ({ cantidad: i.qty, nombre: i.nombre, precio_unitario: i.precio }))
                    };
                    window.AdminModule.acceptAndPrintOrder(checkoutResult.id, printOrderData);
                  } else {
                    window.print();
                  }
                }} 
                className="flex-1 bg-[#1E293B] hover:bg-[#2A364B] text-[#F8FAFC] font-semibold text-xs py-3 rounded-[12px] border border-[#2A364B] flex items-center justify-center gap-1 transition-all"
              >
                🖨️ Imprimir Ticket
              </button>
              <button onClick={() => setCheckoutResult(null)} className="flex-1 bg-[#5B4BFF] hover:bg-[#6D5FFF] text-white font-bold text-xs py-3 rounded-[12px] shadow-lg shadow-[#5B4BFF]/25 transition-all">NUEVA VENTA</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Exportar globalmente por si se importa en otros módulos
window.catalogoProductos = catalogoProductos;

// Render React App into #root
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
