# 🗺️ MAPA MAESTRO DE ARQUITECTURA & HISTORIAL DE ACTUALIZACIONES
> **PROYECTO:** SYSPIM MARKET (SaaS Multi-Tenant de Colmados, Minimarkets & Delivery)  
> **FECHA DE ÚLTIMA ACTUALIZACIÓN:** 2026-07-26  
> **ESTADO DEL PROYECTO:** En Producción / Totalmente Funcional

---

## 📌 1. REGLA DE ORO PARA FUTURAS MODIFICACIONES
> ⚠️ **INSTRUCCIÓN PERMANENTE DE DESARROLLO:**  
> Antes de realizar cualquier cambio, ajuste visual o nueva funcionalidad en el código, **SIEMPRE DEBES CONSULTAR ESTE MAPA MAESTRO**. Ninguna actualización debe alterar o romper las estructuras base listadas en este documento.

---

## 🏗️ 2. ARQUITECTURA TÉCNICA DEL SISTEMA

### **Stack Tecnológico Core:**
* **Frontend UI:** HTML5 + JavaScript ES6+ + React 18 (in-browser Babel transform para compilación instantánea sin build step complejo).
* **Estilos & Diseño:** Tailwind CSS (Vanilla utilities + clases CSS personalizadas en `styles.css`).
* **Base de Datos & Realtime:** Supabase Cloud (Autenticación, tablas `pedidos`, `productos`, `tenants`, `clientes` y canales en tiempo real WebSocket / BroadcastChannel).
* **Impresión Térmica:** Módulo `AdminModule.acceptAndPrintOrder` configurado para impresoras térmicas de tickets de 80mm en formato de solo texto (oculta imágenes en `@media print`).
* **PWA & Delivery:** PWA independiente en `catalog.html` optimizada para clientes finales de pedimentos a domicilio.

---

## 🧩 3. MÓDULOS PRINCIPALES Y SU ESTRUCTURA

### 🛒 A. Terminal de Punto de Venta (POS Cajero - `src/app.js`)
* **Diseño Arquitectónico:** 2 Columnas Adheridas (70% Izquierda / 30% Derecha - Estándar SyspimFarma / Farmacia San José).
  * **Columna Izquierda (70%):**
    * **Buscador Superior Amplio:** Campo de entrada con margen interno amplio (`px-2 py-1`), tipografía grande `text-base / text-lg font-extrabold` que evita el recorte de letras.
    * **Autocompletado de Alta Legibilidad:** Menú desplegable amplio con borde azul de contraste, indicadores de `Stock (EA)`, categoría, precio y badge `Enter (1ro)`.
    * **Botones de Acción Rápida:** `⏸️ F8 Pausar`, `▶️ F9 Recup.`, `🗑️ Limpiar`.
    * **Tabla "Detalle de la Venta":** Columnas `PRODUCTO`, `EA` (Stock Existencia), `CANT.`, `PRECIO`, `TOTAL`, `ACCIÓN (✕)`. Desplazamiento automático hacia el último producto agregado al final de la lista.
  * **Columna Derecha (30% - Panel "RESUMEN DE COBRO"):**
    * **Banner Gigante "TOTAL A PAGAR RD$":** Tipografía `4XL` azul/teal.
    * **Selector de Método de Pago:** `💵 EFECTIVO`, `💳 TARJETA`, `📲 TRANSFER`.
    * **Calculadora de Efectivo & Devuelta:** Campo de entrada **Efectivo Recibido RD$ (F2)** con recuadro destacado de **DEVUELTA** con cálculo en tiempo real.
    * **Comprobante Fiscal (NCF):** Casilla `[ ] ¿Requiere Comprobante Fiscal (RNC)?` con campo desplegable para RNC / Cédula.
    * **Botón Principal:** `🧾 COBRAR E IMPRIMIR` de alto impacto.

---

### 🛵 B. Catálogo Digital del Cliente / PWA (`catalog.html`)
* **Diseño Arquitectónico:** App Móvil Estilo Delivery GO / E-Commerce.
  * **Header Superior Degradado:** Nombre del colmado activo (`DeliveryGO • COLMADO DON PEDRO`), dirección de envío editable (`📍`) e insignia de perfil.
  * **Barra de Búsqueda y Categorías Fijas (Sticky Header `sticky top-0 z-30`):** La lupa de búsqueda y las pestañas de categorías no se ocultan al desplazarse hacia abajo.
  * **Grilla de Productos:** Foto en alta definición, nombre, categoría, precio y botón azul `+` con contador flotante rojo por producto.
  * **Carrito Flotante Inferior Expandible (Bottom Cart Sheet):**
    * Panel fijado en la parte inferior cuando hay productos en el carrito (`cartCount > 0`).
    * Muestra resumen de subtotal e ítems.
    * Botón interactivo **`▲ Ver Productos Guardados`** que despliega una lista dentro de la pantalla para ajustar cantidades (`-` / `+`), eliminar artículos o vaciar el carrito.
    * Botón principal `📲 Solicitar Pedido a Domicilio →`.

---

### 📦 C. Inventario & Catálogo de Productos (`catalogoProductos`)
* Mantenimiento de más de 80 productos precargados divididos en categorías:
  * 🥛 **Lácteos & Huevos** (Rica Leche Listamilk, Descremada, Milex, Nido, Bravo, Huevos Frescos Cartón 30 Unid, etc.).
  * 🍎 **Frutas y Vegetales** (45+ rubros de mercado precargados: Plátano Verde, Guineo, Tomate Bugalú, Cebolla Roja, Papa, Aguacate, Ajo, etc.).
  * 🥤 **Bebidas & Refrescos** (Coca-Cola 2L, jugos, etc.).
  * 🍞 **Panadería & Abarrotes**.

---

### 👑 D. SuperAdmin SaaS Multi-Tenant (`src/modules/superadmin/superadmin.js`)
* Administración centralizada de múltiples colmados/tenants.
* Control de suscripciones, configuración de slugs y sucursales.

---

## 📜 4. HISTORIAL DE ACTUALIZACIONES (CHANGELOG)

### **[2026-07-26] - Rediseño POS 2 Columnas & Catálogo Delivery GO**
* **POS Cajero (src/app.js & admin.js):**
  1. Reestructuración completa a la arquitectura de 2 columnas de SyspimFarma (70% Detalle Venta / 30% Resumen Cobro).
  2. Implementación del banner `TOTAL A PAGAR RD$` en tamaño 4XL.
  3. Adición del campo `Efectivo Recibido (F2)` con caja verde de `DEVUELTA` en vivo.
  4. Incorporación del checkbox para Comprobante Fiscal (NCF/RNC).
  5. Desplazamiento automático al agregar productos (antiguos suben, nuevo aparece abajo).
  6. Desplegable de búsqueda ampliado con alta legibilidad y eliminación de recortes en la primera letra.
  7. Impresión térmica optimizada en tickets de 80mm sin imágenes.
* **Catálogo Digital PWA (catalog.html):**
  1. Transformación visual al estilo Delivery GO / Instacart / Bravo App con degradados, ubicación e insignias.
  2. **Header Adhesivo Unificado Fijo (`sticky top-0 z-40`):** Integra el nombre del colmado, la dirección de envío, la **Barra de Búsqueda con Lupa 🔍** y las pestañas de categorías dentro de un solo bloque fijo en la parte superior. La barra de búsqueda permanece 100% visible sin ocultarse al desplazarse en celular.
  3. Rediseño del catálogo en **Carruseles Horizontales Seccionados por Categoría** con desplazamiento táctil `scroll-snap-x mandatory`, encabezados con botón "Ver todos" y tarjetas de producto de ancho fijo (145px - 170px) con botón flotante `+`.
  4. Implementación del Carrito Flotante Inferior Expandible (Bottom Cart Sheet) que muestra los productos guardados con controles de incremento/decremento (`-` / `+`).
* **Imágenes de Inventario:**
  1. Generación de imágenes oficiales de producto para *Rica Leche Listamilk Lt* y *Rica Leche Descremada Lt*.
  2. Integración de 45+ productos agrícolas a la categoría *Frutas y Vegetales*.

---

## 🔐 5. PROTOCOLO DE VERIFICACIÓN ANTES DE CADA COMMIT
1. **Validación de Sintaxis JSX:** Ejecutar `node scratch/validate_jsx.js` para asegurar que todas las etiquetas JSX en `src/app.js` estén perfectamente cerradas.
2. **Prueba de Servidor Local:** Verificar que `npx serve` responda en puerto 3000 sin advertencias de consola.
3. **Revisión contra este MAPA MAESTRO:** Confirmar que no se hayan roto los componentes de POS 2 Columnas ni el Carrito Flotante en `catalog.html`.
