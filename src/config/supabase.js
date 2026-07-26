// Configuración del Cliente Supabase para el Núcleo Multi-Tenant de Colmados
const SUPABASE_URL = "https://alpityruqgjshqapyutc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscGl0eXJ1cWdqc2hxYXB5dXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjIxNTksImV4cCI6MjA5NzU5ODE1OX0.lz_ZuaZ2gFzrDRrS10YwQC5nF7H1Rj9vwlGefyq9Cf8";

// Dominio Público Configurable para Enlaces de Clientes y Delivery
// Cambiar esta variable cuando vincules un dominio personalizado (ej: https://syspimmarket.com)
const PUBLIC_DOMAIN = window.APP_PUBLIC_DOMAIN || (window.location.origin.includes('localhost') ? window.location.origin : window.location.origin);

// Inicializar cliente Supabase globalmente
let supabaseClient = null;

if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
} else {
    console.warn("Supabase SDK no detectado aún en window.supabase. Se intentará reconectar.");
}

function getSupabase() {
    if (!supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabaseClient;
    }
    return supabaseClient;
}

window.ColmadoSupabase = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    publicDomain: PUBLIC_DOMAIN,
    getPublicUrl: (path) => {
        const base = window.location.origin;
        const cleanPath = path ? (path.startsWith('/') ? path : '/' + path) : '';
        return `${base}${cleanPath}`;
    },
    get client() {
        return getSupabase();
    }
};
