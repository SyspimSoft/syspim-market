// Módulo Catálogo Público para Clientes del Colmado
(function() {
    let customerCart = [];
    let selectedCategory = 'all';

    function initCatalogModule(appState) {
        renderCatalogHeader(appState);
        renderCategoryFilter(appState);
        renderCatalogProducts(appState);
        renderCustomerCart();
        bindCatalogEvents(appState);
    }

    function renderCatalogHeader(appState) {
        const titleEl = document.getElementById('catalog-tenant-name');
        const phoneEl = document.getElementById('catalog-tenant-phone');
        const addressEl = document.getElementById('catalog-tenant-address');

        const tenant = appState.currentTenant || { nombre: 'Mi Colmado', telefono: '809-555-0100', direccion: 'Calle Principal #12' };

        if (titleEl) titleEl.textContent = tenant.nombre;
        if (phoneEl) phoneEl.textContent = `📞 ${tenant.telefono || 'Sin teléfono'}`;
        if (addressEl) addressEl.textContent = `📍 ${tenant.direccion || 'República Dominicana'}`;
    }

    function renderCategoryFilter(appState) {
        const container = document.getElementById('catalog-category-pills');
        if (!container) return;

        const productos = appState.productos || [];
        const categories = ['all', ...new Set(productos.map(p => p.categoria).filter(Boolean))];

        container.innerHTML = categories.map(cat => `
            <button class="pill-btn ${selectedCategory === cat ? 'active' : ''}" onclick="CatalogModule.selectCategory('${cat}')">
                ${cat === 'all' ? '🛍️ Todos' : cat}
            </button>
        `).join('');
    }

    function renderCatalogProducts(appState) {
        const grid = document.getElementById('catalog-products-grid');
        if (!grid) return;

        const searchInput = document.getElementById('catalog-search-input');
        const query = (searchInput ? searchInput.value : '').toLowerCase();

        const filtered = (appState.productos || []).filter(p => {
            const matchesQuery = p.nombre.toLowerCase().includes(query) || (p.categoria || '').toLowerCase().includes(query);
            const matchesCat = selectedCategory === 'all' || p.categoria === selectedCategory;
            return matchesQuery && matchesCat;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-catalog">No hay productos disponibles en esta categoría.</div>`;
            return;
        }

        grid.innerHTML = filtered.map(p => `
            <div class="catalog-card">
                <div class="catalog-card-image">
                    <img src="${p.imagen_url || 'public/assets/placeholder.svg'}" alt="${p.nombre}" onerror="this.onerror=null; this.src='public/assets/placeholder.svg';">
                    ${p.stock <= 3 ? '<span class="badge-tag danger">¡Pocos disponibles!</span>' : ''}
                </div>
                <div class="catalog-card-body">
                    <span class="catalog-category-label">${p.categoria || 'General'}</span>
                    <h3 class="catalog-product-title">${p.nombre}</h3>
                    <div class="catalog-price-row">
                        <span class="catalog-price">${window.Helpers.formatRD$(p.precio)}</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-block" onclick="CatalogModule.addToCustomerCart('${p.id}')">
                    🛒 Agregar al Pedido
                </button>
            </div>
        `).join('');
    }

    function addToCustomerCart(productId) {
        const product = (window.AppState.productos || []).find(p => p.id === productId);
        if (!product) return;

        const existing = customerCart.find(item => item.id === productId);
        if (existing) {
            existing.cantidad++;
        } else {
            customerCart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: 1
            });
        }

        renderCustomerCart();
        // Feedback visual
        const badge = document.getElementById('cart-floating-badge');
        if (badge) {
            badge.classList.add('bounce');
            setTimeout(() => badge.classList.remove('bounce'), 400);
        }
    }

    function renderCustomerCart() {
        const badge = document.getElementById('cart-floating-badge');
        const container = document.getElementById('customer-cart-items');
        const totalEl = document.getElementById('customer-cart-total');

        const totalItems = customerCart.reduce((sum, item) => sum + item.cantidad, 0);
        const totalPrice = customerCart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

        if (badge) badge.textContent = totalItems;
        if (totalEl) totalEl.textContent = window.Helpers.formatRD$(totalPrice);

        if (!container) return;

        if (customerCart.length === 0) {
            container.innerHTML = `<div class="empty-cart-msg">Tu pedido está vacío. Elige tus productos favoritos.</div>`;
            return;
        }

        container.innerHTML = customerCart.map(item => `
            <div class="cart-item-row">
                <div class="cart-item-details">
                    <strong>${item.nombre}</strong>
                    <span>${window.Helpers.formatRD$(item.precio)} c/u</span>
                </div>
                <div class="cart-item-controls">
                    <button onclick="CatalogModule.updateQty('${item.id}', -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="CatalogModule.updateQty('${item.id}', 1)">+</button>
                </div>
                <div class="cart-item-sub">
                    ${window.Helpers.formatRD$(item.precio * item.cantidad)}
                </div>
            </div>
        `).join('');
    }

    function updateQty(productId, delta) {
        const item = customerCart.find(i => i.id === productId);
        if (!item) return;

        item.cantidad += delta;
        if (item.cantidad <= 0) {
            customerCart = customerCart.filter(i => i.id !== productId);
        }
        renderCustomerCart();
    }

    async function sendOrderViaWhatsApp(customerInfo, submitButton) {
        if (customerCart.length === 0) {
            alert('Tu carrito está vacío.');
            return;
        }

        // Prevención de envíos duplicados (Idempotencia en UI)
        if (submitButton) {
            if (submitButton.disabled) return;
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.innerHTML;
            submitButton.innerHTML = `⏳ Procesando pedido...`;
        }

        try {
            const tenant = window.AppState.currentTenant || { id: '00000000-0000-0000-0000-000000000001', nombre: 'Colmado Don Pedro', telefono: '8095550100' };
            const total = customerCart.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
            
            // Generar UUID idempotente para el pedido
            const orderUuid = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : ('ped-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9));

            // 1. Guardar pedido en Supabase/App Local para que el Admin POS lo reciba en tiempo real
            const nuevoPedido = {
                id: orderUuid,
                tenant_id: tenant.id,
                customer_info: {
                    nombre: customerInfo.nombre,
                    telefono: customerInfo.telefono,
                    direccion: customerInfo.direccion,
                    metodo_pago: customerInfo.metodoPago || 'efectivo'
                },
                items: customerCart.map(i => ({
                    id: i.id,
                    nombre: i.nombre,
                    cantidad: i.cantidad,
                    precio_unitario: i.precio
                })),
                total: total,
                status: 'pendiente',
                created_at: new Date().toISOString()
            };

            // Intentar persistir mediante Supabase o AppRouter
            if (window.ColmadoSupabase && window.ColmadoSupabase.client) {
                const { data, error } = await window.ColmadoSupabase.client
                    .from('orders')
                    .insert([nuevoPedido])
                    .select();
                
                if (error) {
                    console.warn('[Supabase Insert Error, guardando localmente]:', error);
                    await window.AppRouter?.savePedido(nuevoPedido);
                } else if (data && data[0]) {
                    nuevoPedido.delivery_token = data[0].delivery_token;
                }
            } else if (window.AppRouter?.savePedido) {
                await window.AppRouter.savePedido(nuevoPedido);
            }

            // 2. Construir mensaje de WhatsApp
            let itemsText = customerCart.map(i => `• ${i.cantidad}x ${i.nombre} - ${window.Helpers.formatRD$(i.precio * i.cantidad)}`).join('%0A');
            const text = `🛍️ *NUEVO PEDIDO - ${(tenant.nombre || 'COLMADO').toUpperCase()}*%0A%0A` +
                         `👤 *Cliente:* ${customerInfo.nombre}%0A` +
                         `📞 *Teléfono:* ${customerInfo.telefono}%0A` +
                         `📍 *Dirección:* ${customerInfo.direccion}%0A` +
                         `💳 *Pago:* ${customerInfo.metodoPago}%0A%0A` +
                         `📝 *PRODUCTOS:*%0A${itemsText}%0A%0A` +
                         `💰 *TOTAL: ${window.Helpers.formatRD$(total)}*%0A%0A` +
                         `🛵 _Por favor confirmar el envío._`;

            const waUrl = window.Helpers.buildWhatsAppLink(tenant.telefono || '8095550100', text);

            // Limpiar carrito y cerrar modal
            customerCart = [];
            renderCustomerCart();
            
            const modal = document.getElementById('modal-catalog-checkout');
            if (modal) modal.classList.remove('active');

            // Abrir WhatsApp en nueva pestaña
            window.open(waUrl, '_blank');
        } catch (err) {
            console.error('Error al procesar el pedido:', err);
            alert('Hubo un inconveniente al enviar tu pedido. Por favor intenta de nuevo.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = submitButton.dataset.originalText || 'Confirmar Pedido';
            }
        }
    }

    function bindCatalogEvents(appState) {
        const searchInput = document.getElementById('catalog-search-input');
        if (searchInput) {
            searchInput.oninput = () => renderCatalogProducts(appState);
        }

        const btnOpenCart = document.getElementById('btn-open-customer-cart');
        if (btnOpenCart) {
            btnOpenCart.onclick = () => {
                const modal = document.getElementById('modal-customer-cart');
                if (modal) modal.classList.add('active');
            };
        }

        const formCheckout = document.getElementById('form-catalog-checkout');
        if (formCheckout) {
            formCheckout.onsubmit = (e) => {
                e.preventDefault();
                const nombre = document.getElementById('cat-client-name').value;
                const telefono = document.getElementById('cat-client-phone').value;
                const direccion = document.getElementById('cat-client-address').value;
                const metodoPago = document.getElementById('cat-payment-method').value;
                const submitBtn = e.submitter || formCheckout.querySelector('button[type="submit"]');

                sendOrderViaWhatsApp({ nombre, telefono, direccion, metodoPago }, submitBtn);
            };
        }
    }

    async function submitOrder(customerInfo, submitButton) {
        return sendOrderViaWhatsApp(customerInfo, submitButton);
    }

    window.CatalogModule = {
        initCatalogModule,
        selectCategory: (cat) => {
            selectedCategory = cat;
            renderCategoryFilter(window.AppState);
            renderCatalogProducts(window.AppState);
        },
        addToCustomerCart,
        updateQty,
        submitOrder,
        sendOrderViaWhatsApp
    };
})();
