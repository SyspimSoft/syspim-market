// Módulo Delivery Ultraligero para Repartidores por Token
(function() {
    let currentDeliveryToken = null;
    let activeOrder = null;

    function initDeliveryModule(appState, tokenFromUrl) {
        if (tokenFromUrl) {
            currentDeliveryToken = tokenFromUrl;
            loadOrderByToken(tokenFromUrl, appState);
        } else {
            renderTokenSearchInput();
        }
    }

    function loadOrderByToken(token, appState) {
        const pedidos = appState.pedidos || [];
        activeOrder = pedidos.find(p => p.delivery_token === token || p.id === token);

        const container = document.getElementById('delivery-content-box');
        if (!container) return;

        if (!activeOrder) {
            container.innerHTML = `
                <div class="delivery-card text-center">
                    <div class="delivery-icon">🔍</div>
                    <h3>Pedido No Encontrado</h3>
                    <p class="text-muted">El token <code>${token}</code> no corresponde a un pedido activo o fue completado.</p>
                    <div class="form-group" style="margin-top: 15px;">
                        <input type="text" id="input-delivery-token-manual" placeholder="Ingrese otro token de entrega (ej: DEL-8F3A29)" class="input-text">
                        <button onclick="DeliveryModule.searchTokenManual()" class="btn btn-primary btn-block" style="margin-top:10px;">Buscar Pedido</button>
                    </div>
                </div>
            `;
            return;
        }

        const tenant = appState.tenants.find(t => t.id === activeOrder.tenant_id) || appState.currentTenant || { nombre: 'Colmado Don Pedro', telefono: '809-555-0100' };

        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeOrder.direccion_entrega || 'Santo Domingo, Republica Dominicana')}`;
        const telUrl = `tel:${(activeOrder.cliente_telefono || '').replace(/[^0-9+]/g, '')}`;

        const detallesHtml = (activeOrder.detalles || []).map(d => `
            <div class="delivery-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed rgba(255,255,255,0.1);">
                <div style="flex: 1;">
                    <strong>${d.cantidad}x</strong> ${d.nombre || 'Producto'}
                    <span style="display:block; font-size:0.8rem; color:var(--text-muted);">${window.Helpers.formatRD$(d.precio_unitario)} c/u</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: var(--color-amber);">${window.Helpers.formatRD$((d.precio_unitario || 0) * d.cantidad)}</strong>
                    <button onclick="DeliveryModule.removeDeliveryItem('${d.producto_id}')" class="btn btn-sm btn-danger-outline" title="Eliminar ítem por solicitud del cliente" style="padding: 2px 8px; font-size: 0.8rem;">🗑️ Devolver</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="delivery-card">
                <div class="delivery-card-header">
                    <div>
                        <span class="delivery-badge-tenant">🏪 ${tenant.nombre}</span>
                        <h2>Pedido #${activeOrder.id.slice(-6)}</h2>
                    </div>
                    ${window.Helpers.statusBadge(activeOrder.estado)}
                </div>

                <div class="delivery-section">
                    <div class="info-label">CLIENTE</div>
                    <div class="info-value">👤 <strong>${activeOrder.cliente_nombre || 'Cliente General'}</strong></div>
                    ${activeOrder.cliente_telefono ? `<a href="${telUrl}" class="btn btn-call btn-block">📞 Llamar al Cliente (${activeOrder.cliente_telefono})</a>` : ''}
                </div>

                <div class="delivery-section">
                    <div class="info-label">DIRECCIÓN DE ENTREGA</div>
                    <div class="info-value">📍 ${activeOrder.direccion_entrega || 'Recogida en local'}</div>
                    <a href="${mapsUrl}" target="_blank" class="btn btn-map btn-block">🗺️ Abrir en Google Maps / Waze</a>
                </div>

                <div class="delivery-section">
                    <div class="info-label">DETALLE DEL PEDIDO</div>
                    <div class="delivery-items-list">
                        ${detallesHtml.length > 0 ? detallesHtml : '<p class="text-muted">Sin desglose de ítems.</p>'}
                    </div>
                    <div class="delivery-total-row">
                        <span>TOTAL A COBRAR (${activeOrder.metodo_pago.toUpperCase()}):</span>
                        <strong class="text-amber-large">${window.Helpers.formatRD$(activeOrder.monto_total)}</strong>
                    </div>
                </div>

                <div class="delivery-actions">
                    <button class="btn btn-warning btn-block btn-lg" onclick="DeliveryModule.updateStatus('en_camino')">
                        🛵 Marcar EN CAMINO
                    </button>
                    <button class="btn btn-success btn-block btn-lg" onclick="DeliveryModule.updateStatus('entregado')">
                        ✅ Marcar ENTREGADO
                    </button>
                    <button class="btn btn-danger-outline btn-block" onclick="DeliveryModule.updateStatus('cancelado')">
                        ❌ Cancelar Entrega
                    </button>
                </div>
            </div>
        `;
    }

    function renderTokenSearchInput() {
        const container = document.getElementById('delivery-content-box');
        if (!container) return;

        container.innerHTML = `
            <div class="delivery-card text-center">
                <div class="delivery-icon">🛵</div>
                <h2>Vista de Repartidor (Delivery)</h2>
                <p class="text-muted">Introduce tu código de entrega o escanea el enlace recibido por WhatsApp.</p>
                <div class="form-group" style="margin-top: 20px;">
                    <input type="text" id="input-delivery-token-manual" placeholder="Ej: DEL-8F3A29" class="input-text text-center font-mono">
                    <button onclick="DeliveryModule.searchTokenManual()" class="btn btn-primary btn-block btn-lg" style="margin-top:12px;">
                        🔑 Cargar Pedido
                    </button>
                </div>
            </div>
        `;
    }

    async function updateStatus(nuevoEstado) {
        if (!activeOrder) return;

        await window.AppRouter.updatePedidoEstado(activeOrder.id, nuevoEstado);
        activeOrder.estado = nuevoEstado;
        loadOrderByToken(activeOrder.delivery_token, window.AppState);

        alert(`🛵 Estado del pedido actualizado a: ${nuevoEstado.toUpperCase()}`);
    }

    async function removeDeliveryItem(productoId) {
        if (!activeOrder || !activeOrder.detalles) return;

        const targetIndex = activeOrder.detalles.findIndex(d => d.producto_id === productoId);
        if (targetIndex === -1) return;

        const removedItem = activeOrder.detalles[targetIndex];
        
        if (!confirm(`¿El cliente desea eliminar "${removedItem.nombre}" del pedido?`)) {
            return;
        }

        // Eliminar producto de los detalles del pedido
        activeOrder.detalles.splice(targetIndex, 1);

        // Recalcular total del pedido
        const nuevoTotal = activeOrder.detalles.reduce((sum, d) => sum + ((d.precio_unitario || 0) * d.cantidad), 0);
        activeOrder.monto_total = nuevoTotal;

        // Persistir los cambios en la base de datos local y global
        await window.AppRouter.updatePedidoItems(activeOrder.id, activeOrder.detalles, nuevoTotal);

        // Recargar vista de delivery
        loadOrderByToken(activeOrder.delivery_token, window.AppState);

        alert(`🗑️ Se eliminó "${removedItem.nombre}". El nuevo total a cobrar es: ${window.Helpers.formatRD$(nuevoTotal)}`);
    }

    function searchTokenManual() {
        const input = document.getElementById('input-delivery-token-manual');
        if (!input || !input.value.trim()) {
            alert('Por favor introduce un token válido.');
            return;
        }

        const token = input.value.trim();
        window.location.hash = `#delivery/${token}`;
    }

    window.DeliveryModule = {
        initDeliveryModule,
        updateStatus,
        removeDeliveryItem,
        searchTokenManual
    };
})();
