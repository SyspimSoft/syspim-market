// Módulo Administrador: POS, Inventario y Gestión de Pedidos/Delivery
(function() {
    // Estado local del POS
    let posCart = [];
    let currentCategory = 'all';
    let selectedPaymentMethod = 'efectivo';

    // Lista de IDs de productos populares para "Más Vendidos"
    const TOP_SELLER_IDS = ['p-1', 'p-2', 'p-3', 'p-5', 'p-6', 'p-8'];

    /**
     * Inicializa los componentes del Módulo Administrador
     */
    function initAdminModule(appState) {
        renderPOSProducts(appState);
        renderPOSCart();
        renderInventoryTable(appState);
        renderOrdersList(appState);
        bindAdminEvents(appState);
        setupKeyboardShortcuts();
    }

    /**
     * Filtra los productos del POS por categoría usando los chips horizontales
     */
    function filterByCategory(cat, btnElement) {
        currentCategory = cat;
        
        // Actualizar visualmente la clase active en los chips
        document.querySelectorAll('#pos-category-chips .chip-btn').forEach(b => b.classList.remove('active'));
        if (btnElement) {
            btnElement.classList.add('active');
        }

        renderPOSProducts(window.AppState);
    }

    /**
     * Selecciona el método de pago activo (Efectivo, Tarjeta, Transferencia, Fiado)
     */
    function selectPaymentMethod(method) {
        selectedPaymentMethod = method;
        
        document.querySelectorAll('.pay-btn').forEach(btn => {
            if (btn.getAttribute('data-method') === method) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Configura escuchadores de teclado globales (Atajos de Velocidad)
     */
    function setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // F2: Buscar producto
            if (e.key === 'F2') {
                e.preventDefault();
                const searchInput = document.getElementById('pos-search-product');
                if (searchInput) searchInput.focus();
            }
            // F4: Cobrar ahora
            else if (e.key === 'F4') {
                e.preventDefault();
                if (posCart.length > 0) {
                    checkout();
                }
            }
            // ESC: Limpiar carrito (si no hay modal activo)
            else if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal-overlay.active');
                if (!activeModal && posCart.length > 0) {
                    if (confirm('¿Deseas limpiar el carrito actual?')) {
                        clearCart();
                    }
                }
            }
        });
    }

    /**
     * Renderiza la grilla de productos en el Punto de Venta (POS)
     */
    function renderPOSProducts(appState) {
        const grid = document.getElementById('pos-products-grid');
        if (!grid) return;

        const searchInput = document.getElementById('pos-search-product');
        const query = (searchInput ? searchInput.value : '').toLowerCase();

        const filtered = (appState.productos || []).filter(p => {
            const matchesQuery = p.nombre.toLowerCase().includes(query) || (p.categoria || '').toLowerCase().includes(query);
            
            let matchesCat = true;
            if (currentCategory === 'mas_vendidos') {
                matchesCat = TOP_SELLER_IDS.includes(p.id) || p.stock > 30;
            } else if (currentCategory !== 'all') {
                matchesCat = p.categoria === currentCategory;
            }

            return matchesQuery && matchesCat;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; padding: 24px; text-align: center;">No se encontraron productos en esta categoría.</div>`;
            return;
        }

        grid.innerHTML = filtered.map(p => `
            <div class="pos-product-card" onclick="AdminModule.addToCart('${p.id}')">
                <div class="product-info">
                    <span class="product-cat-tag">${p.categoria || 'General'}</span>
                    <h4 class="product-title" title="${p.nombre}">${p.nombre}</h4>
                    <div class="product-price-row">
                        <span class="product-price">${window.Helpers.formatRD$(p.precio)}</span>
                        <span class="product-stock ${p.stock <= 5 ? 'stock-low' : ''}">${p.stock} unid.</span>
                    </div>
                </div>
                <button class="btn-add-pos" title="Agregar producto">+</button>
            </div>
        `).join('');
    }

    /**
     * Añade un producto al carrito del POS
     */
    function addToCart(productId) {
        const product = (window.AppState.productos || []).find(p => p.id === productId);
        if (!product) return;

        const existing = posCart.find(item => item.id === productId);
        if (existing) {
            if (existing.cantidad < product.stock) {
                existing.cantidad++;
            } else {
                alert(`Stock máximo alcanzado para ${product.nombre}`);
            }
        } else {
            posCart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: 1,
                maxStock: product.stock
            });
        }

        renderPOSCart();
    }

    /**
     * Renderiza el resumen del carrito del POS
     */
    function renderPOSCart() {
        const container = document.getElementById('pos-cart-items');
        const countBadge = document.getElementById('pos-cart-count');
        const subtotalText = document.getElementById('pos-cart-subtotal-text');
        const totalEl = document.getElementById('pos-cart-total');
        const btnCheckout = document.getElementById('btn-pos-checkout');

        if (!container) return;

        const totalItemsCount = posCart.reduce((sum, i) => sum + i.cantidad, 0);
        if (countBadge) countBadge.textContent = `🛒 ${totalItemsCount} ${totalItemsCount === 1 ? 'ítem' : 'ítems'}`;

        if (posCart.length === 0) {
            container.innerHTML = `<div class="empty-cart-msg" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem;">El carrito está vacío. Haz clic en un producto para agregarlo.</div>`;
            if (subtotalText) subtotalText.textContent = 'Subtotal: RD$ 0.00';
            if (totalEl) totalEl.textContent = window.Helpers.formatRD$(0);
            if (btnCheckout) btnCheckout.disabled = true;
            return;
        }

        let total = 0;
        container.innerHTML = posCart.map(item => {
            const itemTotal = item.precio * item.cantidad;
            total += itemTotal;
            return `
                <div class="pos-cart-item">
                    <div class="cart-item-info">
                        <strong>${item.nombre}</strong>
                        <span>${window.Helpers.formatRD$(item.precio)} c/u</span>
                    </div>
                    <div class="cart-item-qty">
                        <button onclick="AdminModule.updateCartQty('${item.id}', -1)">-</button>
                        <span>${item.cantidad}</span>
                        <button onclick="AdminModule.updateCartQty('${item.id}', 1)">+</button>
                    </div>
                    <div class="cart-item-subtotal">
                        ${window.Helpers.formatRD$(itemTotal)}
                    </div>
                    <button class="btn-remove-item" onclick="AdminModule.removeFromCart('${item.id}')">✕</button>
                </div>
            `;
        }).join('');

        if (subtotalText) subtotalText.textContent = `Subtotal: ${window.Helpers.formatRD$(total)}`;
        if (totalEl) totalEl.textContent = window.Helpers.formatRD$(total);
        if (btnCheckout) btnCheckout.disabled = false;

        // Auto-scroll hacia abajo para mostrar siempre el último producto agregado al final
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 50);
    }

    function updateCartQty(productId, delta) {
        const item = posCart.find(i => i.id === productId);
        if (!item) return;

        item.cantidad += delta;
        if (item.cantidad <= 0) {
            removeFromCart(productId);
        } else {
            renderPOSCart();
        }
    }

    function removeFromCart(productId) {
        posCart = posCart.filter(i => i.id !== productId);
        renderPOSCart();
    }

    function clearCart() {
        posCart = [];
        renderPOSCart();
    }

    /**
     * Ejecuta el cobro directo en el POS
     */
    async function checkout() {
        if (posCart.length === 0) return;

        const customerSelect = document.getElementById('pos-customer-select');
        const customerVal = customerSelect ? customerSelect.value : 'consumidor_final';

        let clienteNombre = 'Consumidor Final';
        if (customerVal === 'fiado_carlos') clienteNombre = 'Carlos Mendoza (Fiado)';
        if (customerVal === 'fiado_maria') clienteNombre = 'María Rodríguez (Fiado)';

        const total = posCart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const deliveryToken = window.Helpers.generateDeliveryToken();

        const nuevoPedido = {
            id: 'ped-' + Date.now(),
            tenant_id: window.AppState.currentTenant.id,
            cliente_nombre: clienteNombre,
            cliente_telefono: '809-555-0000',
            direccion_entrega: 'Venta Directa de Caja',
            delivery_token: deliveryToken,
            monto_total: total,
            metodo_pago: selectedPaymentMethod,
            estado: 'entregado',
            created_at: new Date().toISOString(),
            detalles: posCart.map(i => ({
                producto_id: i.id,
                cantidad: i.cantidad,
                precio_unitario: i.precio,
                nombre: i.nombre
            }))
        };

        await window.AppRouter.savePedido(nuevoPedido);
        
        const count = posCart.reduce((sum, i) => sum + i.cantidad, 0);
        clearCart();
        renderOrdersList(window.AppState);

        alert(`✅ VENTA COBRADA CON ÉXITO!\n\n▪ Artículos: ${count}\n▪ Cliente: ${clienteNombre}\n▪ Método de Pago: ${selectedPaymentMethod.toUpperCase()}\n▪ Total Cobrado: RD$ ${total.toFixed(2)}`);
    }

    /**
     * Renderiza la tabla de productos / inventario
     */
    function renderInventoryTable(appState) {
        const tbody = document.getElementById('inventory-table-body');
        if (!tbody) return;

        const productos = appState.productos || [];
        if (productos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">No hay productos registrados en el inventario.</td></tr>`;
            return;
        }

        tbody.innerHTML = productos.map(p => `
            <tr>
                <td>
                    <img src="${p.imagen_url || 'public/assets/placeholder.svg'}" class="table-thumb" alt="${p.nombre}" onerror="this.onerror=null; this.src='public/assets/placeholder.svg';">
                </td>
                <td><strong>${p.nombre}</strong></td>
                <td><span class="badge badge-secondary">${p.categoria || 'Sin Cat.'}</span></td>
                <td>${window.Helpers.formatRD$(p.precio)}</td>
                <td><span class="${p.stock <= 5 ? 'text-danger font-bold' : ''}">${p.stock} unid.</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="AdminModule.openEditProductModal('${p.id}')">✏️ Editar</button>
                    <button class="btn btn-sm btn-danger-outline" onclick="AdminModule.deleteProduct('${p.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Renderiza el listado de pedidos recientes
     */
    function renderOrdersList(appState) {
        const container = document.getElementById('orders-list-container');
        if (!container) return;

        const pedidos = appState.pedidos || [];
        if (pedidos.length === 0) {
            container.innerHTML = `<div class="empty-state">No hay pedidos registrados en este colmado.</div>`;
            return;
        }

        // Ordenar por fecha descendente
        const sorted = [...pedidos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const deliveryPhone = (appState.currentTenant && appState.currentTenant.delivery_telefono) || (window.TEST_PHONES ? window.TEST_PHONES.delivery : '8094965148');

        container.innerHTML = sorted.map(ped => {
            const deliveryLink = `${window.location.origin}${window.location.pathname}#delivery/${ped.delivery_token}`;
            const deliveryMessage = `🛵 *NUEVO PEDIDO PARA REPARTIDOR*\n\n` +
                                    `👤 *Cliente:* ${ped.cliente_nombre}\n` +
                                    `📞 *Teléfono:* ${ped.cliente_telefono}\n` +
                                    `📍 *Dirección:* ${ped.direccion_entrega}\n` +
                                    `💰 *Total:* ${window.Helpers.formatRD$(ped.monto_total)} (${ped.metodo_pago})\n\n` +
                                    `🔗 *Abrir Detalle Entrega:* ${deliveryLink}`;

            const waDeliveryUrl = window.Helpers.buildWhatsAppLink(deliveryPhone, deliveryMessage);
            const clientPhone = ped.cliente_telefono || (window.TEST_PHONES ? window.TEST_PHONES.cliente : '8095131416');
            const clientMessage = `👋 Hola ${ped.cliente_nombre}, tu pedido #${ped.id.slice(-6)} en ${appState.currentTenant ? appState.currentTenant.nombre : 'el Colmado'} está ${ped.estado.replace('_', ' ').toUpperCase()}.\n\n` +
                                  `🛵 *Rastreo en vivo:* ${deliveryLink}`;
            const waClientUrl = window.Helpers.buildWhatsAppLink(clientPhone, clientMessage);

            return `
                <div class="order-card" id="order-card-${ped.id}">
                    <div class="order-card-header">
                        <div>
                            <strong>Pedido #${ped.id.slice(-6)}</strong>
                            <span class="text-muted" style="display:block; font-size:0.8rem;">${window.Helpers.formatDate(ped.created_at)}</span>
                        </div>
                        ${window.Helpers.statusBadge(ped.estado)}
                    </div>
                    <div class="order-card-body">
                        <p>👤 <strong>${ped.cliente_nombre || ped.customer_info?.nombre || 'Cliente General'}</strong> (📞 ${ped.cliente_telefono || ped.customer_info?.telefono || 'N/A'})</p>
                        <p>📍 ${ped.direccion_entrega || ped.customer_info?.direccion || 'Recogida en local'}</p>
                        <p>💰 Total: <strong class="text-amber">${window.Helpers.formatRD$(ped.monto_total || ped.total)}</strong> (${ped.metodo_pago || ped.customer_info?.metodo_pago || 'efectivo'})</p>
                        <p>🔑 Token Delivery: <code style="font-size:1.1rem; font-weight:bold; color:#f59e0b;">${ped.delivery_token || 'Generando...'}</code></p>
                    </div>
                    <div class="order-card-actions" style="gap:6px; flex-wrap:wrap;">
                        <button onclick="AdminModule.acceptAndPrintOrder('${ped.id}')" class="btn btn-sm btn-glow-amber" style="background:#f59e0b; color:#000; font-weight:bold;">
                            🖨️ Aceptar e Imprimir
                        </button>
                        <select onchange="AdminModule.changeOrderStatus('${ped.id}', this.value)" class="select-sm">
                            <option value="pendiente" ${ped.estado === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                            <option value="preparando" ${ped.estado === 'preparando' ? 'selected' : ''}>👨‍🍳 Preparando</option>
                            <option value="en_camino" ${ped.estado === 'en_camino' ? 'selected' : ''}>🛵 En Camino</option>
                            <option value="entregado" ${ped.estado === 'entregado' ? 'selected' : ''}>✅ Entregado</option>
                            <option value="cancelado" ${ped.estado === 'cancelado' ? 'selected' : ''}>❌ Cancelado</option>
                        </select>
                        <a href="${waDeliveryUrl}" target="_blank" class="btn btn-sm btn-whatsapp" title="Enviar a Delivery (${deliveryPhone})">🛵 WhatsApp Delivery</a>
                        <a href="${waClientUrl}" target="_blank" class="btn btn-sm btn-outline" title="Avisar a Cliente (${clientPhone})">💬 WhatsApp Cliente</a>
                        <a href="#delivery/${ped.delivery_token}" class="btn btn-sm btn-outline">👁️ Ver Delivery</a>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function changeOrderStatus(pedidoId, nuevoEstado) {
        // Actualizar en Supabase si está disponible
        if (window.ColmadoSupabase && window.ColmadoSupabase.client) {
            await window.ColmadoSupabase.client
                .from('orders')
                .update({ status: nuevoEstado })
                .eq('id', pedidoId);
        }
        await window.AppRouter.updatePedidoEstado(pedidoId, nuevoEstado);
        renderOrdersList(window.AppState);
    }

    // =========================================================================
    // IMPRESIÓN TÉRMICA DE TICKET (58mm/80mm) Y CAMBIO DE ESTADO A 'PREPARANDO'
    // =========================================================================
    async function acceptAndPrintOrder(pedidoId, orderData) {
        const pedidos = window.AppState?.pedidos || [];
        const order = orderData || pedidos.find(p => p.id === pedidoId);

        if (!order) {
            alert('No se encontró la información del pedido.');
            return;
        }

        const targetId = order.id || pedidoId;

        // 1. Cambiar estado a 'preparando' en Supabase y estado local
        if (targetId) {
            await changeOrderStatus(targetId, 'preparando');
        }

        // 2. Formatear y poblar la plantilla de recibo térmico (#thermal-receipt)
        const receiptContainer = document.getElementById('thermal-receipt');
        if (!receiptContainer) {
            console.error('No se encontró el contenedor #thermal-receipt para imprimir');
            return;
        }

        const tenant = window.AppState?.currentTenant || { nombre: 'SYSPIM MARKET', telefono: '809-555-0100', direccion: 'Santo Domingo, R.D.' };
        const clienteNombre = order.cliente_nombre || order.customer_info?.nombre || 'Cliente General';
        const clienteTel = order.cliente_telefono || order.customer_info?.telefono || 'N/A';
        const clienteDir = order.direccion_entrega || order.customer_info?.direccion || 'Recogida en local';
        const clientePago = (order.metodo_pago || order.customer_info?.metodo_pago || 'Efectivo').toUpperCase();
        const items = order.detalles || order.items || [];
        const total = order.monto_total || order.total || 0;
        const token = order.delivery_token || 'DEL-000000';
        const fechaStr = new Date(order.created_at || Date.now()).toLocaleString('es-DO');

        const formatMoney = (num) => {
            if (window.Helpers && window.Helpers.formatRD$) return window.Helpers.formatRD$(num);
            return 'RD$ ' + (num || 0).toFixed(2);
        };

        let itemsRowsHtml = items.map(item => `
            <tr>
                <td style="width:15%;">${item.cantidad}x</td>
                <td style="width:55%;">${item.nombre || item.producto_id}</td>
                <td style="width:30%; text-align:right;">${formatMoney((item.precio_unitario || item.precio || 0) * item.cantidad)}</td>
            </tr>
        `).join('');

        receiptContainer.innerHTML = `
            <div class="receipt-header">
                <h2 id="receipt-biz-name" class="receipt-title">${tenant.nombre || 'SYSPIM MARKET'}</h2>
                <p id="receipt-biz-address" class="receipt-meta">${tenant.direccion || 'Santo Domingo, República Dominicana'}</p>
                <p id="receipt-biz-phone" class="receipt-meta">Tel: ${tenant.telefono || '809-555-0100'}</p>
                <p id="receipt-meta-info" class="receipt-meta">Fecha: ${fechaStr} | Pedido #${(order.id || '').slice(-6)}</p>
            </div>

            <div id="receipt-customer-info" class="receipt-customer-box">
                <strong>CLIENTE:</strong> ${clienteNombre}<br>
                <strong>TELÉFONO:</strong> ${clienteTel}<br>
                <strong>DIRECCIÓN:</strong> ${clienteDir}<br>
                <strong>PAGO:</strong> ${clientePago}
            </div>

            <table class="receipt-items-table">
                <thead>
                    <tr>
                        <th style="width:15%;">CANT</th>
                        <th style="width:55%;">DESCRIPCIÓN</th>
                        <th style="width:30%; text-align:right;">IMPORTE</th>
                    </tr>
                </thead>
                <tbody id="receipt-items-list">
                    ${itemsRowsHtml}
                </tbody>
            </table>

            <div id="receipt-totals" class="receipt-totals-box" style="text-align:right; font-weight:bold; font-size:11px; margin-top:6px; border-top:1px solid #000; padding-top:4px;">
                TOTAL A PAGAR: ${formatMoney(total)}
                ${order.recibido ? `<br>EFECTIVO RECIBIDO: ${formatMoney(order.recibido)}` : ''}
                ${order.devuelta !== undefined && order.recibido ? `<br>DEVUELTA (CAMBIO): ${formatMoney(order.devuelta)}` : ''}
            </div>

            <div class="receipt-token-box ticket-token">
                <div class="receipt-token-title">CÓDIGO REPARTIDOR / DELIVERY TOKEN</div>
                <div id="receipt-delivery-token" class="receipt-token-code ticket-token-code">${token}</div>
            </div>
            
            <div style="text-align:center; font-size:9px; margin-top:8px; border-top:1px dashed #000; padding-top:4px;">
                ¡Gracias por su preferencia! - SYSPIM MARKET POS
            </div>
        `;

        // 3. Disparar impresión nativa del navegador
        setTimeout(() => {
            window.print();
        }, 150);
    }

    // =========================================================================
    // REPRODUCCIÓN SONORA (AUDIO CONTEXT) Y TIEMPO REAL CON SUPABASE
    // =========================================================================
    let audioCtx = null;
    let realtimeChannel = null;

    function unlockAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playOrderNotificationSound() {
        try {
            unlockAudioContext();
            if (!audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        } catch (e) {
            console.warn('[Audio Alert Error]:', e);
        }
    }

    function initRealtimeOrders(tenantId) {
        if (!window.ColmadoSupabase || !window.ColmadoSupabase.client) {
            console.log('[Realtime]: Cliente de Supabase no activo aún');
            return;
        }

        const supabase = window.ColmadoSupabase.client;
        
        if (realtimeChannel) {
            supabase.removeChannel(realtimeChannel);
        }

        realtimeChannel = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders'
                },
                (payload) => {
                    console.log('[Supabase Realtime Order Event]:', payload);
                    
                    if (payload.eventType === 'INSERT') {
                        const newOrder = payload.new;
                        // Sonar alerta de audio
                        playOrderNotificationSound();

                        // Formatear pedido para el estado local si viene de la tabla orders
                        const formattedOrder = {
                            id: newOrder.id,
                            tenant_id: newOrder.tenant_id,
                            cliente_nombre: newOrder.customer_info?.nombre || 'Cliente',
                            cliente_telefono: newOrder.customer_info?.telefono || '',
                            direccion_entrega: newOrder.customer_info?.direccion || '',
                            delivery_token: newOrder.delivery_token,
                            monto_total: newOrder.total,
                            metodo_pago: newOrder.customer_info?.metodo_pago || 'efectivo',
                            estado: newOrder.status || 'pendiente',
                            created_at: newOrder.created_at,
                            detalles: newOrder.items || []
                        };

                        // Agregar al estado global
                        if (window.AppState) {
                            const exists = (window.AppState.pedidos || []).some(p => p.id === formattedOrder.id);
                            if (!exists) {
                                window.AppState.pedidos = [formattedOrder, ...(window.AppState.pedidos || [])];
                                renderOrdersList(window.AppState);
                            }
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new;
                        if (window.AppState && window.AppState.pedidos) {
                            window.AppState.pedidos = window.AppState.pedidos.map(p => {
                                if (p.id === updated.id) {
                                    return {
                                        ...p,
                                        estado: updated.status || p.estado,
                                        delivery_token: updated.delivery_token || p.delivery_token
                                    };
                                }
                                return p;
                            });
                            renderOrdersList(window.AppState);
                        }
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Supabase Realtime Subscription Status]:', status);
            });
    }

    function bindAdminEvents(appState) {
        const searchInput = document.getElementById('pos-search-product');
        if (searchInput) searchInput.oninput = () => renderPOSProducts(appState);

        // Desbloquear contexto de audio en cualquier interacción con la pantalla de administración
        document.addEventListener('click', unlockAudioContext, { once: true });
        document.addEventListener('keydown', unlockAudioContext, { once: true });

        const formAddProduct = document.getElementById('form-add-product');
        if (formAddProduct) {
            formAddProduct.onsubmit = async (e) => {
                e.preventDefault();
                const nombre = document.getElementById('prod-name').value;
                const precio = parseFloat(document.getElementById('prod-price').value) || 0;
                const stock = parseInt(document.getElementById('prod-stock').value) || 0;
                const categoria = document.getElementById('prod-category').value;
                const imagen_url = document.getElementById('prod-image').value || 'public/assets/placeholder.svg';

                const newProd = {
                    id: 'prod-' + Date.now(),
                    tenant_id: window.AppState.currentTenant.id,
                    nombre,
                    precio,
                    stock,
                    categoria,
                    imagen_url,
                    created_at: new Date().toISOString()
                };

                await window.AppRouter.saveProduct(newProd);
                formAddProduct.reset();
                renderPOSProducts(window.AppState);
                renderInventoryTable(window.AppState);
                alert('📦 Producto agregado al inventario!');
            };
        }

        // Inicializar suscripción a Supabase Realtime si existe tenant activo
        if (appState.currentTenant) {
            initRealtimeOrders(appState.currentTenant.id);
        }
    }

    // Exponer objeto AdminModule en window
    window.AdminModule = {
        initAdminModule,
        renderPOSProducts,
        renderPOSCart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        filterByCategory,
        selectPaymentMethod,
        checkout,
        renderInventoryTable,
        renderOrdersList,
        changeOrderStatus,
        acceptAndPrintOrder,
        unlockAudioContext,
        openEditProductModal: (id) => alert(`Modificar producto ${id}`),
        deleteProduct: async (id) => {
            if (confirm('¿Deseas eliminar este producto del inventario?')) {
                await window.AppRouter.deleteProduct(id);
                renderPOSProducts(window.AppState);
                renderInventoryTable(window.AppState);
            }
        }
    };
})();

