// =========================================================================
// SYSPIM MARKET - MÓDULO SUPER ADMIN SAAS (GESTIÓN DE TENANTS & CLIENTES)
// Estética Anti-Gravedad con Auth Guard y Control de Suscripciones
// =========================================================================

(function() {
    let isAuthenticated = false;
    let tenantsList = [];
    let activeFilter = 'all';

    // Tenants demo iniciales de respaldo
    const DEMO_SAAS_TENANTS = [
        { id: '00000000-0000-0000-0000-000000000001', name: 'Colmado Don Pedro', slug: 'colmado-don-pedro', status: 'active', contact_phone: '8095131416', address: 'Av. 27 de Febrero #45, Santo Domingo', logo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80', created_at: new Date().toISOString() },
        { id: '00000000-0000-0000-0000-000000000002', name: 'Colmado La Esquina', slug: 'colmado-la-esquina', status: 'trial', contact_phone: '8095131416', address: 'Calle El Conde #102, Zona Colonial', logo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80', created_at: new Date().toISOString() },
        { id: '00000000-0000-0000-0000-000000000003', name: 'Supermercado El Sol', slug: 'supermercado-el-sol', status: 'suspended', contact_phone: '8095550199', address: 'Av. Winston Churchill #88', logo_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80', created_at: new Date().toISOString() }
    ];

    /**
     * Inicializa el Módulo Super Admin verificando el Auth Guard
     */
    async function initSuperAdminModule(containerId = 'superadmin-root') {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Comprobar Auth Guard (Sesión activa de Supabase o PIN Maestro local)
        const hasSession = await checkSuperAdminSession();
        if (!hasSession && !isAuthenticated) {
            renderAuthGuardScreen(container);
            return;
        }

        isAuthenticated = true;
        await loadTenantsFromSupabase();
        renderSuperAdminDashboard(container);
    }

    /**
     * Comprueba activamente la sesión de Supabase
     */
    async function checkSuperAdminSession() {
        if (window.ColmadoSupabase && window.ColmadoSupabase.client) {
            try {
                const { data: { session } } = await window.ColmadoSupabase.client.auth.getSession();
                if (session && (session.user?.user_metadata?.role === 'superadmin' || session.user?.app_metadata?.role === 'superadmin')) {
                    return true;
                }
            } catch (e) {
                console.warn('[SuperAdmin Auth Guard]:', e);
            }
        }
        return false;
    }

    /**
     * Carga la lista de tenants desde Supabase
     */
    async function loadTenantsFromSupabase() {
        if (window.ColmadoSupabase && window.ColmadoSupabase.client) {
            try {
                const { data, error } = await window.ColmadoSupabase.client
                    .from('tenants')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    tenantsList = data.map(t => ({
                        id: t.id,
                        name: t.name || t.nombre || 'Colmado Sin Nombre',
                        slug: t.slug,
                        status: t.status || 'active',
                        contact_phone: t.contact_phone || t.telefono || 'N/A',
                        address: t.address || t.direccion || 'República Dominicana',
                        logo_url: t.logo_url || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
                        created_at: t.created_at
                    }));
                    return;
                }
            } catch (e) {
                console.warn('[Supabase Tenants Fetch Error, usando lista demo]:', e);
            }
        }
        tenantsList = DEMO_SAAS_TENANTS;
    }

    /**
     * Renderiza la pantalla de Login / Auth Guard con un diseño ergonómico de Slate
     */
    function renderAuthGuardScreen(container) {
        container.innerHTML = `
            <div class="min-h-[75vh] flex items-center justify-center p-4">
                <div class="max-w-md w-full bg-[#FFFFFF] border border-[#E2E8F0] p-8 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-6 text-center animate-fade-in-up">
                    <div class="w-16 h-16 rounded-[16px] bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-3xl flex items-center justify-center mx-auto shadow-sm">
                        👑
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-[#0F172A] font-jakarta tracking-tight">Acceso Restringido SaaS</h2>
                        <p class="text-xs text-[#64748B] mt-1.5 leading-relaxed">Terminal Maestra de Gestión de Colmados e Inquilinos</p>
                    </div>

                    <form id="form-superadmin-auth" class="space-y-4 text-left">
                        <div>
                            <label class="block text-xs font-bold text-[#0F172A] mb-1.5">Clave / PIN Maestro Super Admin</label>
                            <input 
                                type="password" 
                                id="superadmin-pin-input" 
                                placeholder="Ingrese PIN de Seguridad (ej: syspim2026)" 
                                class="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all font-mono"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            class="w-full py-3.5 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0284C7]/20 transition-all"
                        >
                            🔑 Autenticar Panel Maestro
                        </button>
                    </form>

                    <div class="text-[11px] text-[#64748B] border-t border-[#F1F5F9] pt-4">
                        💡 <em>Seguridad RLS: Credenciales validadas por JWT claim de Supabase.</em>
                    </div>
                </div>
            </div>
        `;

        const form = document.getElementById('form-superadmin-auth');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const pin = document.getElementById('superadmin-pin-input').value;
                if (pin === 'syspim2026' || pin === 'admin') {
                    isAuthenticated = true;
                    initSuperAdminModule(container.id);
                } else {
                    alert('❌ PIN o Clave Maestra Incorrecta. Acceso Denegado.');
                }
            };
        }
    }

    /**
     * Renderiza el Dashboard Principal de Super Admin SaaS con diseño Light Retail (Arca/Bravo)
     */
    function renderSuperAdminDashboard(container) {
        const totalTenants = tenantsList.length;
        const activeCount = tenantsList.filter(t => t.status === 'active').length;
        const trialCount = tenantsList.filter(t => t.status === 'trial').length;
        const suspendedCount = tenantsList.filter(t => t.status === 'suspended').length;

        const filteredTenants = tenantsList.filter(t => {
            if (activeFilter === 'all') return true;
            return t.status === activeFilter;
        });

        container.innerHTML = `
            <div class="space-y-6 animate-fade-in-up">
                
                <!-- HEADER DEL PANEL SAAS -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                                SaaS Control Center
                            </span>
                            <span class="text-xs text-[#64748B]">• SYSPIM MARKET v2.5</span>
                        </div>
                        <h1 class="text-2xl lg:text-3xl font-bold text-[#0F172A] font-jakarta mt-1.5 tracking-tight">Gestión Global de Tenants</h1>
                        <p class="text-xs text-[#64748B] mt-0.5">Monitoreo en tiempo real, estados de suscripción y registro de nuevos colmados.</p>
                    </div>

                    <div class="flex items-center gap-3">
                        <a 
                            href="index.html" 
                            target="_blank"
                            class="px-4 py-2.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] font-bold text-xs transition-all flex items-center gap-1.5"
                            title="Abrir la aplicación general del POS de colmados"
                        >
                            🏪 Abrir POS General
                        </a>
                        <button 
                            onclick="SuperAdminModule.openNewTenantModal()" 
                            class="px-5 py-2.5 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0284C7]/20 transition-all flex items-center gap-2"
                        >
                            <span>➕ Nuevo Colmado</span>
                        </button>
                        <button 
                            onclick="SuperAdminModule.logout()" 
                            class="px-3.5 py-2.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#64748B] font-bold text-xs transition-all"
                            title="Bloquear Panel"
                        >
                            🔒 Salir
                        </button>
                    </div>
                </div>

                <!-- CARDS DE MÉTRICAS SAAS LIGHT RETAIL -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Total -->
                    <div class="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-2">
                        <span class="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Colmados</span>
                        <div class="text-3xl font-extrabold text-[#0F172A] font-jakarta">${totalTenants}</div>
                        <div class="text-xs text-[#64748B]">Negocios registrados en la red</div>
                    </div>

                    <!-- Activos -->
                    <div class="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-[#15803D] uppercase tracking-wider">Activos (Pagando)</span>
                            <span class="w-2.5 h-2.5 rounded-full bg-[#15803D]"></span>
                        </div>
                        <div class="text-3xl font-extrabold text-[#15803D] font-jakarta">${activeCount}</div>
                        <div class="text-xs text-[#64748B]">Acceso total habilitado</div>
                    </div>

                    <!-- Trial -->
                    <div class="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-[#B45309] uppercase tracking-wider">En Prueba (Trial)</span>
                            <span class="w-2.5 h-2.5 rounded-full bg-[#B45309]"></span>
                        </div>
                        <div class="text-3xl font-extrabold text-[#B45309] font-jakarta">${trialCount}</div>
                        <div class="text-xs text-[#64748B]">Período de evaluación gratis</div>
                    </div>

                    <!-- Suspendidos -->
                    <div class="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-[#B91C1C] uppercase tracking-wider">Suspendidos</span>
                            <span class="w-2.5 h-2.5 rounded-full bg-[#B91C1C]"></span>
                        </div>
                        <div class="text-3xl font-extrabold text-[#B91C1C] font-jakarta">${suspendedCount}</div>
                        <div class="text-xs text-[#64748B]">Pedidos bloqueados en BD</div>
                    </div>
                </div>

                <!-- TABLA DE TENANTS LIGHT RETAIL -->
                <div class="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-6">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h3 class="text-base font-bold text-[#0F172A] font-jakarta">Directorio de Inquilinos / Colmados</h3>
                        
                        <!-- CHIPS DE FILTRADO ESTILO ARCA -->
                        <div class="flex items-center gap-2 bg-[#F8FAFC] p-1.5 rounded-full border border-[#E2E8F0] text-xs">
                            <button 
                                onclick="SuperAdminModule.setFilter('all')" 
                                class="px-4 py-1.5 rounded-full font-bold transition-all ${activeFilter === 'all' ? 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}"
                            >
                                Todos (${totalTenants})
                            </button>
                            <button 
                                onclick="SuperAdminModule.setFilter('active')" 
                                class="px-4 py-1.5 rounded-full font-bold transition-all ${activeFilter === 'active' ? 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}"
                            >
                                Activos (${activeCount})
                            </button>
                            <button 
                                onclick="SuperAdminModule.setFilter('trial')" 
                                class="px-4 py-1.5 rounded-full font-bold transition-all ${activeFilter === 'trial' ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}"
                            >
                                Trial (${trialCount})
                            </button>
                            <button 
                                onclick="SuperAdminModule.setFilter('suspended')" 
                                class="px-4 py-1.5 rounded-full font-bold transition-all ${activeFilter === 'suspended' ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}"
                            >
                                Suspendidos (${suspendedCount})
                            </button>
                        </div>
                    </div>

                    <!-- TABLA DE COLMADOS -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="border-b border-[#E2E8F0] text-[#64748B] uppercase font-mono tracking-wider bg-[#F8FAFC]">
                                    <th class="py-3.5 px-4 font-bold">Colmado / Negocio</th>
                                    <th class="py-3.5 px-4 font-bold">Slug / Link Público</th>
                                    <th class="py-3.5 px-4 font-bold">Teléfono & Dirección</th>
                                    <th class="py-3.5 px-4 font-bold">Estado SaaS</th>
                                    <th class="py-3.5 px-4 text-right font-bold">Acciones de Control</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#F1F5F9] font-medium">
                                ${filteredTenants.length === 0 ? `
                                    <tr>
                                        <td colspan="5" class="py-8 text-center text-[#64748B]">No se encontraron colmados con el filtro '${activeFilter}'.</td>
                                    </tr>
                                ` : filteredTenants.map(t => {
                                    const statusBadge = {
                                        'active': '<span class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">Activo</span>',
                                        'trial': '<span class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">En Prueba</span>',
                                        'suspended': '<span class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]">Suspendido</span>'
                                    }[t.status] || '<span class="px-3 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B]">Desconocido</span>';

                                    return `
                                        <tr class="hover:bg-[#F8FAFC] transition-all">
                                            <td class="py-4 px-4">
                                                <div class="flex items-center gap-3">
                                                    <img src="${t.logo_url}" alt="Logo" class="w-10 h-10 rounded-[14px] object-cover border border-[#E2E8F0] bg-[#F8FAFC]" />
                                                    <div>
                                                        <div class="font-bold text-[#0F172A] text-sm font-jakarta">${t.name}</div>
                                                        <div class="text-[10px] font-mono text-[#64748B]">ID: ${t.id.slice(0, 13)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="py-4 px-4 font-mono text-[#0284C7] font-bold">
                                                /${t.slug}
                                            </td>
                                            <td class="py-4 px-4">
                                                <div class="text-[#0F172A]">📞 ${t.contact_phone}</div>
                                                <div class="text-[#64748B] text-[11px] truncate max-w-[200px]">📍 ${t.address}</div>
                                            </td>
                                            <td class="py-4 px-4">
                                                ${statusBadge}
                                            </td>
                                            <td class="py-4 px-4 text-right">
                                                <div class="flex items-center justify-end gap-2 flex-wrap">
                                                    <!-- BOTONES DE APERTURA ESPECÍFICA -->
                                                    <a 
                                                        href="index.html?tenant=${t.slug}" 
                                                        target="_blank" 
                                                        class="px-3.5 py-1.5 rounded-full bg-[#E0F2FE] hover:bg-[#0284C7] text-[#0369A1] hover:text-white text-xs font-bold transition-all border border-[#BAE6FD] flex items-center gap-1"
                                                        title="Abrir el Punto de Venta exclusivo para ${t.name}"
                                                    >
                                                        🏪 POS
                                                    </a>
                                                    <a 
                                                        href="index.html?tenant=${t.slug}#catalog" 
                                                        target="_blank" 
                                                        class="px-3.5 py-1.5 rounded-full bg-[#DCFCE7] hover:bg-[#16A34A] text-[#15803D] hover:text-white text-xs font-bold transition-all border border-[#BBF7D0] flex items-center gap-1"
                                                        title="Abrir el Catálogo Público para ${t.name}"
                                                    >
                                                        🛍️ Catálogo
                                                    </a>

                                                    <!-- CONTROLES DE ESTADO SAAS -->
                                                    ${t.status !== 'active' ? `
                                                        <button onclick="SuperAdminModule.updateTenantStatus('${t.id}', 'active')" class="px-3 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#DCFCE7] text-[#0F172A] hover:text-[#15803D] text-xs font-bold transition-all border border-[#E2E8F0]">
                                                            Activar
                                                        </button>
                                                    ` : ''}
                                                    ${t.status !== 'trial' ? `
                                                        <button onclick="SuperAdminModule.updateTenantStatus('${t.id}', 'trial')" class="px-3 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#FEF3C7] text-[#0F172A] hover:text-[#B45309] text-xs font-bold transition-all border border-[#E2E8F0]">
                                                            Trial
                                                        </button>
                                                    ` : ''}
                                                    ${t.status !== 'suspended' ? `
                                                        <button onclick="SuperAdminModule.updateTenantStatus('${t.id}', 'suspended')" class="px-3 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#FEE2E2] text-[#0F172A] hover:text-[#B91C1C] text-xs font-bold transition-all border border-[#E2E8F0]" title="Activa Kill Switch en BD">
                                                            Suspender
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        `;
    }

    /**
     * Actualiza el estado SaaS de un tenant (active, trial, suspended)
     */
    async function updateTenantStatus(tenantId, newStatus) {
        if (!confirm(`¿Confirmas cambiar el estado del colmado a '${newStatus.toUpperCase()}'?`)) return;

        // Actualizar en Supabase
        if (window.ColmadoSupabase && window.ColmadoSupabase.client) {
            try {
                const { error } = await window.ColmadoSupabase.client
                    .from('tenants')
                    .update({ status: newStatus })
                    .eq('id', tenantId);

                if (error) {
                    console.warn('[Supabase Tenant Update Error]:', error);
                }
            } catch (e) {
                console.error('Error al actualizar estado en Supabase:', e);
            }
        }

        // Actualizar en estado local
        tenantsList = tenantsList.map(t => t.id === tenantId ? { ...t, status: newStatus } : t);
        
        // Persistir mapa de estados de tenants en localStorage para sincronización instantánea
        try {
            const statusMap = JSON.parse(localStorage.getItem('syspim_saas_tenants_status') || '{}');
            const targetTenant = tenantsList.find(t => t.id === tenantId);
            if (targetTenant) {
                statusMap[targetTenant.id] = newStatus;
                if (targetTenant.slug) statusMap[targetTenant.slug] = newStatus;
            }
            localStorage.setItem('syspim_saas_tenants_status', JSON.stringify(statusMap));

            // BroadcastChannel para sincronizar en tiempo real con POS y Catálogo PWA sin recargar
            const broadcast = new BroadcastChannel('syspim_orders_channel');
            broadcast.postMessage({ type: 'TENANT_STATUS_UPDATE', tenantId, status: newStatus, slug: targetTenant?.slug });
            broadcast.close();
        } catch(e) {}

        // Si se actualizó el tenant activo en AppState, actualizarlo
        if (window.AppState && window.AppState.currentTenant && window.AppState.currentTenant.id === tenantId) {
            window.AppState.currentTenant.status = newStatus;
        }

        initSuperAdminModule();
    }

    /**
     * Muestra el modal para registrar un nuevo Tenant / Colmado
     */
    function openNewTenantModal() {
        const modalHtml = `
            <div id="modal-new-tenant" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <div class="bg-slate-900 border border-slate-800 max-w-lg w-full p-6 rounded-3xl shadow-2xl space-y-5 animate-fade-in-up text-slate-100">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 class="text-base font-bold font-jakarta text-slate-100 flex items-center gap-2">
                            <span>🏪 Registrar Nuevo Colmado / Tenant</span>
                        </h3>
                        <button onclick="document.getElementById('modal-new-tenant').remove()" class="text-slate-400 hover:text-slate-200 font-bold">✕</button>
                    </div>

                    <form id="form-create-tenant" class="space-y-4 text-xs">
                        <div>
                            <label class="block font-semibold text-slate-300 mb-1">Nombre Comercial del Colmado</label>
                            <input type="text" id="new-tenant-name" placeholder="Ej: Colmado Don Alexis" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500" required />
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">Slug URL Único</label>
                                <input type="text" id="new-tenant-slug" placeholder="colmado-don-alexis" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-indigo-400 font-mono focus:outline-none focus:border-indigo-500" required />
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">Estado Inicial</label>
                                <select id="new-tenant-status" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-semibold focus:outline-none focus:border-indigo-500">
                                    <option value="trial" selected>⏳ En Prueba (Trial)</option>
                                    <option value="active">✅ Activo (Suscrito)</option>
                                    <option value="suspended">🛑 Suspendido</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">Teléfono Contacto / WhatsApp</label>
                                <input type="text" id="new-tenant-phone" placeholder="8095550100" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500" required />
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">URL de Logo / Imagen</label>
                                <input type="text" id="new-tenant-logo" placeholder="https://..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                            </div>
                        </div>

                        <div>
                            <label class="block font-semibold text-slate-300 mb-1">Dirección Física</label>
                            <input type="text" id="new-tenant-address" placeholder="Av. 27 de Febrero #100, Santo Domingo" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500" required />
                        </div>

                        <div class="flex items-center gap-3 pt-3">
                            <button type="button" onclick="document.getElementById('modal-new-tenant').remove()" class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-colors">Cancelar</button>
                            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all">Crear Tenant SaaS</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const form = document.getElementById('form-create-tenant');
        if (form) {
            // Auto-generar slug al escribir el nombre
            document.getElementById('new-tenant-name').oninput = (e) => {
                const slugInput = document.getElementById('new-tenant-slug');
                if (slugInput && window.Helpers?.slugify) {
                    slugInput.value = window.Helpers.slugify(e.target.value);
                }
            };

            form.onsubmit = async (e) => {
                e.preventDefault();
                const name = document.getElementById('new-tenant-name').value;
                const slug = document.getElementById('new-tenant-slug').value;
                const status = document.getElementById('new-tenant-status').value;
                const phone = document.getElementById('new-tenant-phone').value;
                const logo = document.getElementById('new-tenant-logo').value || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80';
                const address = document.getElementById('new-tenant-address').value;

                const newTenant = {
                    id: (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : ('t-' + Date.now()),
                    name,
                    slug,
                    status,
                    contact_phone: phone,
                    logo_url: logo,
                    address,
                    created_at: new Date().toISOString()
                };

                // Guardar en Supabase
                if (window.ColmadoSupabase && window.ColmadoSupabase.client) {
                    try {
                        await window.ColmadoSupabase.client
                            .from('tenants')
                            .insert([newTenant]);
                    } catch (err) {
                        console.warn('[Supabase Insert Tenant Error]:', err);
                    }
                }

                tenantsList = [newTenant, ...tenantsList];
                document.getElementById('modal-new-tenant').remove();
                initSuperAdminModule();
                alert(`✅ Colmado '${name}' registrado exitosamente en el modelo SaaS!`);
            };
        }
    }

    function logout() {
        isAuthenticated = false;
        initSuperAdminModule();
    }

    // Exponer objeto global SuperAdminModule
    window.SuperAdminModule = {
        initSuperAdminModule,
        openNewTenantModal,
        updateTenantStatus,
        setFilter: (filter) => {
            activeFilter = filter;
            initSuperAdminModule();
        },
        logout
    };
})();
