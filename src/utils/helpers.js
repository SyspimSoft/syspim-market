// Utilidades generales para la aplicación de Colmados Multi-Tenant

/**
 * Formatea un número al formato de moneda en Pesos Dominicanos (RD$)
 * @param {number|string} amount 
 * @returns {string} Ej: "RD$ 1,250.00"
 */
function formatRD$(amount) {
    const val = parseFloat(amount) || 0;
    return 'RD$ ' + val.toLocaleString('es-DO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Genera un token único corto para envíos rápidos de delivery
 * @returns {string} Ej: "DEL-8F3A29"
 */
function generateDeliveryToken() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let token = 'DEL-';
    for (let i = 0; i < 6; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Convierte un texto en un slug URL-friendly
 * @param {string} text 
 * @returns {string} Ej: "colmado-don-pedro"
 */
function slugify(text) {
    return (text || '')
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

/**
 * Genera el badge HTML estilizado según el estado del pedido
 * @param {string} estado - 'pendiente' | 'en_camino' | 'entregado' | 'cancelado'
 * @returns {string} HTML string del badge
 */
function statusBadge(estado) {
    const statusMap = {
        'pendiente': { label: '⏳ Pendiente', class: 'badge-warning' },
        'en_camino': { label: '🛵 En Camino', class: 'badge-info' },
        'entregado': { label: '✅ Entregado', class: 'badge-success' },
        'cancelado': { label: '❌ Cancelado', class: 'badge-danger' }
    };

    const config = statusMap[estado] || { label: estado || 'Desconocido', class: 'badge-secondary' };
    return `<span class="badge ${config.class}">${config.label}</span>`;
}

/**
 * Formatea una fecha/hora para visualización
 * @param {string|Date} dateInput 
 * @returns {string} Ej: "24/07/2026 08:45 PM"
 */
function formatDate(dateInput) {
    if (!dateInput) return '---';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    
    return date.toLocaleDateString('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Construye un link de WhatsApp estructurado
 * @param {string} phone 
 * @param {string} message 
 * @returns {string} URL de WhatsApp
 */
function buildWhatsAppLink(phone, message) {
    let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && (cleanPhone.startsWith('809') || cleanPhone.startsWith('829') || cleanPhone.startsWith('849'))) {
        cleanPhone = '1' + cleanPhone;
    }
    const encodedMessage = encodeURIComponent(message || '');
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
}

function copyCustomerLink() {
    const tenant = (window.AppState && window.AppState.currentTenant) || { slug: 'colmado-don-pedro' };
    const slug = tenant.slug || tenant.id;
    const link = `${window.location.origin}${window.location.pathname}#catalog/${slug}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
            alert(`📋 ¡Enlace del Catálogo Copiado!\n\nEnvía este enlace a tus clientes por WhatsApp:\n${link}`);
        }).catch(() => {
            prompt('Copia este enlace para enviárselo a tus clientes:', link);
        });
    } else {
        prompt('Copia este enlace para enviárselo a tus clientes:', link);
    }
}

function shareCatalogToClientWhatsApp(phoneOverride) {
    const tenant = (window.AppState && window.AppState.currentTenant) || { nombre: 'Colmado Don Pedro', slug: 'colmado-don-pedro' };
    const slug = tenant.slug || tenant.id;
    const link = `${window.location.origin}${window.location.pathname}#catalog/${slug}`;
    const targetPhone = phoneOverride || (window.TEST_PHONES ? window.TEST_PHONES.cliente : '8095131416');

    const message = `*HAZ TU PEDIDO EN ${tenant.nombre.toUpperCase()}*\n\n` +
                    `Hola! Puedes ver nuestro catálogo actualizado de productos y hacer tu pedido en línea aquí:\n\n` +
                    `${link}\n\n` +
                    `¡Esperamos tu pedido!`;

    const waUrl = buildWhatsAppLink(targetPhone, message);
    window.open(waUrl, '_blank');
}

window.copyCustomerLink = copyCustomerLink;
window.shareCatalogToClientWhatsApp = shareCatalogToClientWhatsApp;

import { applyInventoryDiscount, applyInventoryIncrease, createInventoryMovementRecord, InventoryService } from '../services/inventoryService.js';

export { applyInventoryDiscount, applyInventoryIncrease, createInventoryMovementRecord, InventoryService };

// Exportar funciones globales para compatibilidad
if (typeof window !== 'undefined') {
    window.formatRD$ = formatRD$;
    window.generateDeliveryToken = generateDeliveryToken;
    window.slugify = slugify;
    window.statusBadge = statusBadge;
    window.formatDate = formatDate;
    window.buildWhatsAppLink = buildWhatsAppLink;
    window.copyCustomerLink = copyCustomerLink;
    window.applyInventoryDiscount = applyInventoryDiscount;
}

// Exportar globalmente para disponibilidad en scripts vanilla JS
window.Helpers = {
    formatRD$,
    generateDeliveryToken,
    slugify,
    statusBadge,
    formatDate,
    buildWhatsAppLink,
    copyCustomerLink,
    shareCatalogToClientWhatsApp,
    applyInventoryDiscount
};
