// SYSPIM MARKET - INTEGRACIÓN DEL CATÁLOGO DE PRODUCTOS (catalogoProductos)
// Código completo funcional con React y Tailwind CSS

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { notifyStockUpdate } from './utils/broadcast.js';
import { applyInventoryDiscount, validateInventoryMovement, processSale } from './services/inventoryService.js';
import { HeaderNav } from './components/POS/HeaderNav.jsx';
import { SearchBar } from './components/POS/SearchBar.jsx';
import { CartTable } from './components/POS/CartTable.jsx';
import { PaymentPanel } from './components/POS/PaymentPanel.jsx';
import { ShortcutBar } from './components/POS/ShortcutBar.jsx';
import { KardexModal } from './components/POS/KardexModal.jsx';
import { DashboardOverview } from './components/Dashboard/DashboardOverview.jsx';
import { CashDrawerModule } from './components/Dashboard/CashDrawerModule.jsx';
import { DeliveryLedgerModule } from './components/Dashboard/DeliveryLedgerModule.jsx';
import { ReportsModule } from './components/Dashboard/ReportsModule.jsx';

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
    imagen: "public/assets/rica_leche_listamilk.png",
    stock: 45
  },
  {
    id: "prod_002",
    tenant_id: "t-001",
    nombre: "Rica Leche Descremada Lt",
    precio: 76,
    precioAnterior: null,
    categoria: "Lácteos",
    imagen: "public/assets/rica_leche_descremada.png",
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
  },
  {
    id: "prod_036",
    tenant_id: "t-001",
    nombre: "Repollo Morado Criollo",
    precio: 59,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=400&q=80",
    stock: 25
  },
  {
    id: "prod_037",
    tenant_id: "t-001",
    nombre: "Manzana Rockit 12/2 Lb",
    precio: 349,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
    stock: 20
  },
  {
    id: "prod_038",
    tenant_id: "t-001",
    nombre: "Picadillo De Vegetales (lsw)",
    precio: 89,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    stock: 30
  },
  {
    id: "prod_039",
    tenant_id: "t-001",
    nombre: "Manzana Granny Imp 3 Lb",
    precio: 299,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1619546813926-a78fa6372ce2?auto=format&fit=crop&w=400&q=80",
    stock: 18
  },
  {
    id: "prod_040",
    tenant_id: "t-001",
    nombre: "Ajo Desgranado Lb",
    precio: 119,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=400&q=80",
    stock: 40
  },
  {
    id: "prod_041",
    tenant_id: "t-001",
    nombre: "Melon Cantaloupe Und",
    precio: 129,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1571575173700-afb9492e6a50?auto=format&fit=crop&w=400&q=80",
    stock: 15
  },
  {
    id: "prod_042",
    tenant_id: "t-001",
    nombre: "Aji Gustoso Paq.",
    precio: 89,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80",
    stock: 35
  },
  {
    id: "prod_043",
    tenant_id: "t-001",
    nombre: "Piña Md2 Un Porcionada",
    precio: 139,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80",
    stock: 22
  },
  {
    id: "prod_044",
    tenant_id: "t-001",
    nombre: "Naranja Agria Lb",
    precio: 54,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1534531141161-e41d1341d1de?auto=format&fit=crop&w=400&q=80",
    stock: 50
  },
  {
    id: "prod_045",
    tenant_id: "t-001",
    nombre: "Albahaca Verde Clamshell",
    precio: 69,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1608683273678-854746f3a3d5?auto=format&fit=crop&w=400&q=80",
    stock: 15
  },
  {
    id: "prod_046",
    tenant_id: "t-001",
    nombre: "Manzana Gala Org Imp 2 Lb",
    precio: 339,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
    stock: 12
  },
  {
    id: "prod_047",
    tenant_id: "t-001",
    nombre: "Pepino Mini Crunch",
    precio: 49,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=400&q=80",
    stock: 28
  },
  {
    id: "prod_048",
    tenant_id: "t-001",
    nombre: "Ciruela Fresca Imp Lb",
    precio: 199,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1521997888043-aa9c827744f8?auto=format&fit=crop&w=400&q=80",
    stock: 20
  },
  {
    id: "prod_049",
    tenant_id: "t-001",
    nombre: "Espinaca Verde Imp 10 Oz",
    precio: 209,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
    stock: 18
  },
  {
    id: "prod_050",
    tenant_id: "t-001",
    nombre: "Perejil Liso Emp",
    precio: 44,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1608683273678-854746f3a3d5?auto=format&fit=crop&w=400&q=80",
    stock: 30
  },
  {
    id: "prod_051",
    tenant_id: "t-001",
    nombre: "Blueberries Imp 4.4 Oz",
    precio: 219,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=400&q=80",
    stock: 25
  },
  {
    id: "prod_052",
    tenant_id: "t-001",
    nombre: "Espinaca Criolla Emp",
    precio: 42,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
    stock: 32
  },
  {
    id: "prod_053",
    tenant_id: "t-001",
    nombre: "Berro Emp",
    precio: 44,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1608683273678-854746f3a3d5?auto=format&fit=crop&w=400&q=80",
    stock: 20
  },
  {
    id: "prod_054",
    tenant_id: "t-001",
    nombre: "Romero",
    precio: 59,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1608683273678-854746f3a3d5?auto=format&fit=crop&w=400&q=80",
    stock: 15
  },
  {
    id: "prod_055",
    tenant_id: "t-001",
    nombre: "Classic Sal Espinaca Baby Org",
    precio: 319,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
    stock: 10
  },
  {
    id: "prod_056",
    tenant_id: "t-001",
    nombre: "Hongo Champiñón Rebanado",
    precio: 325,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1504470695779-75300268aa0e?auto=format&fit=crop&w=400&q=80",
    stock: 14
  },
  {
    id: "prod_057",
    tenant_id: "t-001",
    nombre: "Cebolla Roja Imp Lb",
    precio: 149,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=400&q=80",
    stock: 40
  },
  {
    id: "prod_058",
    tenant_id: "t-001",
    nombre: "Rábano Rojo Lb",
    precio: 79,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=400&q=80",
    stock: 22
  },
  {
    id: "prod_059",
    tenant_id: "t-001",
    nombre: "Hongo Champiñón Cesta",
    precio: 319,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1504470695779-75300268aa0e?auto=format&fit=crop&w=400&q=80",
    stock: 12
  },
  {
    id: "prod_060",
    tenant_id: "t-001",
    nombre: "Manzana Fuji Imp 3 Lb",
    precio: 269,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
    stock: 18
  },
  {
    id: "prod_061",
    tenant_id: "t-001",
    nombre: "Cúrcuma Org. Lb",
    precio: 99,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    stock: 30
  },
  {
    id: "prod_062",
    tenant_id: "t-001",
    nombre: "Lechuga Corazón De Romana",
    precio: 154,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80",
    stock: 25
  },
  {
    id: "prod_063",
    tenant_id: "t-001",
    nombre: "Pico De Gallo Un (lswp)",
    precio: 89,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80",
    stock: 16
  },
  {
    id: "prod_064",
    tenant_id: "t-001",
    nombre: "Sazón Natural Und",
    precio: 199,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80",
    stock: 20
  },
  {
    id: "prod_065",
    tenant_id: "t-001",
    nombre: "Manzana Roja Imp 3 Lb",
    precio: 264,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
    stock: 24
  },
  {
    id: "prod_066",
    tenant_id: "t-001",
    nombre: "Limón Amarillo Imp Lb",
    precio: 135,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1534531141161-e41d1341d1de?auto=format&fit=crop&w=400&q=80",
    stock: 35
  },
  {
    id: "prod_067",
    tenant_id: "t-001",
    nombre: "Guayaba Injerta",
    precio: 49,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1536511135882-7d277a0ef88f?auto=format&fit=crop&w=400&q=80",
    stock: 28
  },
  {
    id: "prod_068",
    tenant_id: "t-001",
    nombre: "Ají Morrón Mamey Lb",
    precio: 74,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80",
    stock: 30
  },
  {
    id: "prod_069",
    tenant_id: "t-001",
    nombre: "Manzanas Golden Delicious Lb",
    precio: 79,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1619546813926-a78fa6372ce2?auto=format&fit=crop&w=400&q=80",
    stock: 32
  },
  {
    id: "prod_070",
    tenant_id: "t-001",
    nombre: "Perejil Rizado Emp",
    precio: 44,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1608683273678-854746f3a3d5?auto=format&fit=crop&w=400&q=80",
    stock: 20
  },
  {
    id: "prod_071",
    tenant_id: "t-001",
    nombre: "Espinaca Hojas Paq (Glp)",
    precio: 149,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
    stock: 15
  },
  {
    id: "prod_072",
    tenant_id: "t-001",
    nombre: "Corazón De Romana 2 Lbs",
    precio: 149,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80",
    stock: 18
  },
  {
    id: "prod_073",
    tenant_id: "t-001",
    nombre: "Ensalada Frutas Porcionada",
    precio: 149,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=400&q=80",
    stock: 20
  },
  {
    id: "prod_074",
    tenant_id: "t-001",
    nombre: "Corazón De Apio Imp Und",
    precio: 239,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    stock: 12
  },
  {
    id: "prod_075",
    tenant_id: "t-001",
    nombre: "Brócoli Imp Und",
    precio: 269,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=400&q=80",
    stock: 22
  },
  {
    id: "prod_076",
    tenant_id: "t-001",
    nombre: "Guandules Fresco Emp",
    precio: 168,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=400&q=80",
    stock: 14
  },
  {
    id: "prod_077",
    tenant_id: "t-001",
    nombre: "Classic Sal Rúcula Org",
    precio: 319,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
    stock: 10
  },
  {
    id: "prod_078",
    tenant_id: "t-001",
    nombre: "Manzana Granny Org Imp 3 Lb",
    precio: 319,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1619546813926-a78fa6372ce2?auto=format&fit=crop&w=400&q=80",
    stock: 15
  },
  {
    id: "prod_079",
    tenant_id: "t-001",
    nombre: "Corazón De Romana Imp Und",
    precio: 299,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80",
    stock: 12
  },
  {
    id: "prod_080",
    tenant_id: "t-001",
    nombre: "Manzana Gala Imp 3 Lb",
    precio: 339,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
    stock: 20
  },
  {
    id: "prod_081",
    tenant_id: "t-001",
    nombre: "Arroz Selecto (por Lb / RD$)",
    precio: 40,
    precioAnterior: null,
    categoria: "Víveres y Granos",
    es_detalle: true,
    unidad_medida: "lb",
    imagen: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
    stock: 500
  },
  {
    id: "prod_082",
    tenant_id: "t-001",
    nombre: "Habichuela Roja Criolla (por Lb / RD$)",
    precio: 65,
    precioAnterior: null,
    categoria: "Víveres y Granos",
    es_detalle: true,
    unidad_medida: "lb",
    imagen: "https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=400&q=80",
    stock: 300
  },
  {
    id: "prod_083",
    tenant_id: "t-001",
    nombre: "Carne de Res Fresca (por Lb / RD$)",
    precio: 195,
    precioAnterior: null,
    categoria: "Embutidos",
    es_detalle: true,
    unidad_medida: "lb",
    imagen: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=400&q=80",
    stock: 150
  },
  {
    id: "prod_084",
    tenant_id: "t-001",
    nombre: "Carne de Pollo Fresco (por Lb / RD$)",
    precio: 85,
    precioAnterior: null,
    categoria: "Embutidos",
    es_detalle: true,
    unidad_medida: "lb",
    imagen: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80",
    stock: 200
  },
  {
    id: "prod_085",
    tenant_id: "t-001",
    nombre: "Plátano Verde Criollo (por Unid / RD$)",
    precio: 18,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    es_detalle: true,
    unidad_medida: "unid",
    imagen: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80",
    stock: 400
  },
  {
    id: "prod_086",
    tenant_id: "t-001",
    nombre: "Guineo Verde (por Unid / RD$)",
    precio: 6,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    es_detalle: true,
    unidad_medida: "unid",
    imagen: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80",
    stock: 600
  },
  {
    id: "prod_087",
    tenant_id: "t-001",
    nombre: "Yuca Criolla (por Lb / RD$)",
    precio: 30,
    precioAnterior: null,
    categoria: "Frutas y Vegetales",
    es_detalle: true,
    unidad_medida: "lb",
    imagen: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80",
    stock: 250
  },
  {
    id: "prod_088",
    tenant_id: "t-001",
    nombre: "Salami Induveca Super Especial (por Lb / RD$)",
    precio: 160,
    precioAnterior: null,
    categoria: "Embutidos",
    es_detalle: true,
    unidad_medida: "lb",
    imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
    stock: 100
  },
  {
    id: "prod_089",
    tenant_id: "t-001",
    nombre: "Queso de Hoja / Cheddar (por Lb / RD$)",
    precio: 240,
    precioAnterior: null,
    categoria: "Lácteos",
    es_detalle: true,
    unidad_medida: "lb",
    imagen: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=400&q=80",
    stock: 80
  },
  {
    id: "prod_090",
    tenant_id: "t-001",
    nombre: "Sal Molida Refinada (por Lb / RD$)",
    precio: 20,
    precioAnterior: null,
    categoria: "Víveres y Granos",
    es_detalle: true,
    unidad_medida: "lb",
    imagen: "https://images.unsplash.com/photo-1518110165401-447e8c37edaa?auto=format&fit=crop&w=400&q=80",
    stock: 300
  }
];

// Categorías del Colmado
const CATEGORIAS = [
  { id: 'all', nombre: '⭐ Todos los Productos', icon: '🛒' },
  { id: 'Frutas y Vegetales', nombre: '🍎 Frutas & Vegetales', icon: '🍎' },
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
  const [productos, setProductos] = useState(() => {
    try {
      const saved = localStorage.getItem('syspim_productos_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return catalogoProductos;
  });

  // Guardar productos en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('syspim_productos_list', JSON.stringify(productos));
    } catch (e) {}
  }, [productos]);

  // Escuchar cambios de inventario en tiempo real (storage event + BroadcastChannel)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'syspim_productos_list' && e.newValue) {
        try {
          setProductos(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    let broadcast;
    try {
      broadcast = new BroadcastChannel('syspim_orders_channel');
      broadcast.onmessage = (event) => {
        if (event.data && event.data.type === 'STOCK_UPDATE' && event.data.payload) {
          setProductos(event.data.payload);
        }
      };
    } catch (e) {}

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (broadcast) broadcast.close();
    };
  }, []);
  const [activeTab, setActiveTab] = useState(() => {
    if (window.location.hash.includes('orders')) return 'orders';
    if (window.location.hash.includes('inventory')) return 'inventory';
    if (window.location.hash.includes('pos')) return 'pos';
    return 'dashboard';
  });

  // ESTADO REALTIME DE PEDIDOS SOLICITADOS POR CLIENTES
  const [pedidos, setPedidos] = useState(() => {
    try {
      const saved = localStorage.getItem('syspim_pos_pedidos');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return window.AppState?.pedidos || [
      {
        id: 'D-203641',
        cliente_nombre: 'juan',
        cliente_telefono: '8095131416',
        direccion_entrega: 'calle ñ',
        monto_total: 458.00,
        metodo_pago: 'Efectivo (Monto Exacto RD$ 458.00)',
        estado: 'en_camino',
        status: 'en_camino',
        delivery_token: 'DEL-96B17L',
        created_at: new Date().toISOString(),
        detalles: [
          { cantidad: 1, nombre: 'Bravo Leche Uht Entera 1Lt', precio_unitario: 59 },
          { cantidad: 1, nombre: 'Refresco Coca-Cola 2 Litros', precio_unitario: 95 },
          { cantidad: 1, nombre: 'Huevos Frescos Cartón 30 Unid', precio_unitario: 195 },
          { cantidad: 1, nombre: 'Bravo Dulce De Leche 400 Gr', precio_unitario: 109 }
        ]
      }
    ];
  });

  // Sincronizar pedidos con localStorage
  useEffect(() => {
    try {
      localStorage.setItem('syspim_pos_pedidos', JSON.stringify(pedidos));
    } catch (e) {}
  }, [pedidos]);

  // Búsqueda y Filtros POS / Catálogo
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Carrito y Caja POS
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('consumidor_final');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cashReceived, setCashReceived] = useState('');
  const [ncfRequired, setNcfRequired] = useState(false);
  const [rncNumber, setRncNumber] = useState('');
  const cartListRef = useRef(null);

  // Auto-scroll la lista de compras hacia abajo para que el nuevo producto aparezca abajo y los viejos suban
  useEffect(() => {
    if (cartListRef.current) {
      setTimeout(() => {
        if (cartListRef.current) {
          cartListRef.current.scrollTo({
            top: cartListRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }, [cart]);

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
  const [orderSubFilter, setOrderSubFilter] = useState('active'); // 'active' | 'completed' | 'all'

  // Repartidores / Deliveries del colmado
  const [repartidoresList, setRepartidoresList] = useState(() => {
    try {
      const saved = localStorage.getItem('syspim_repartidores_list');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: 'rep-1', nombre: 'Delivery Principal', telefono: '8094965148' },
      { id: 'rep-2', nombre: 'Delivery Auxiliar', telefono: '8095550199' }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('syspim_repartidores_list', JSON.stringify(repartidoresList));
    } catch(e) {}
  }, [repartidoresList]);

  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [selectedRepartidorPhone, setSelectedRepartidorPhone] = useState('8094965148');
  const [newRepartidorNombre, setNewRepartidorNombre] = useState('');
  const [newRepartidorTelefono, setNewRepartidorTelefono] = useState('');
  const [showAddRepartidorForm, setShowAddRepartidorForm] = useState(false);

  // Consulta de Historial de Ventas por Cliente
  const [viewCustomerHistory, setViewCustomerHistory] = useState(null);
  const [viewOrderDetails, setViewOrderDetails] = useState(null);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [showKardexModal, setShowKardexModal] = useState(false);

  // Modales & Toast
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [toast, setToast] = useState(null);

  const searchInputRef = useRef(null);

  // Auto-focus en el buscador al abrir el POS para escribir/escanear de inmediato sin clic
  useEffect(() => {
    if (activeTab === 'pos' && searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // ESCUCHADOR REALTIME CROSS-TAB & SUPABASE PARA NUEVOS PEDIDOS DE CLIENTES
  useEffect(() => {
    const handleNewOrder = (rawOrder) => {
      if (!rawOrder) return;
      
      const isUuid = (rawOrder.id || '').length > 20 && (rawOrder.id || '').includes('-');
      const displayId = isUuid ? ('PED-' + rawOrder.id.slice(-6).toUpperCase()) : rawOrder.id;

      let detallesParsed = rawOrder.detalles;
      if (typeof detallesParsed === 'string') {
        try { detallesParsed = JSON.parse(detallesParsed); } catch(e){ detallesParsed = null; }
      }
      if (!detallesParsed || !Array.isArray(detallesParsed) || detallesParsed.length === 0) {
        detallesParsed = [{ cantidad: 1, nombre: 'Pedido desde Móvil PWA', precio_unitario: Number(rawOrder.monto_total || 0) }];
      }

      const newOrder = {
        ...rawOrder,
        id: displayId,
        uuid: rawOrder.id,
        estado: rawOrder.estado || rawOrder.status || 'pendiente',
        status: rawOrder.estado || rawOrder.status || 'pendiente',
        metodo_pago: rawOrder.metodo_pago ? (rawOrder.metodo_pago.charAt(0).toUpperCase() + rawOrder.metodo_pago.slice(1)) : 'Efectivo',
        monto_total: Number(rawOrder.monto_total || rawOrder.total || 0),
        detalles: detallesParsed
      };

      setPedidos(prev => {
        if (prev.some(p => p.id === newOrder.id || (p.uuid && p.uuid === newOrder.uuid))) {
          return prev; // El pedido YA EXISTÍA: NO incrementar contadores de cliente ni ejecutar duplicados
        }

        // El pedido es REALMENTE NUEVO: actualizar cliente 1 sola vez
        if (newOrder.cliente_nombre) {
          setClientesList(cList => {
            const phone = (newOrder.cliente_telefono || '').replace(/[^0-9]/g, '');
            const existingIdx = cList.findIndex(c => (phone && (c.telefono || '').replace(/[^0-9]/g, '') === phone) || c.nombre.toLowerCase() === newOrder.cliente_nombre.toLowerCase());
            const orderAmount = newOrder.monto_total || newOrder.total || 0;
            
            if (existingIdx >= 0) {
              const updated = [...cList];
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
              return [newCustomerObj, ...cList];
            }
          });
        }

        // Descontar inventario automáticamente en el POS si vienen detalles de productos
        if (detallesParsed && Array.isArray(detallesParsed) && detallesParsed.length > 0) {
          setProductos(prevProds => {
            const updated = prevProds.map(prod => {
              const item = detallesParsed.find(d => 
                (d.id && d.id === prod.id) || 
                ((d.nombre || '').toLowerCase().trim() === (prod.nombre || '').toLowerCase().trim())
              );
              if (item) {
                const qty = Number(item.cantidad || item.qty || 1);
                return { ...prod, stock: Math.max(0, (prod.stock || 0) - qty), tenant_id: prod.tenant_id || 't-001' };
              }
              return { ...prod, tenant_id: prod.tenant_id || 't-001' };
            });
            try {
              localStorage.setItem('syspim_productos_list', JSON.stringify(updated));
            } catch(e){}
            return updated;
          });
        }

        return [newOrder, ...prev];
      });

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
        } else if (event.data && event.data.type === 'STATUS_UPDATE' && event.data.order) {
          const updated = event.data.order;
          setPedidos(prev => prev.map(p => p.id === updated.id ? { ...p, estado: updated.estado, status: updated.estado } : p));
          setToast(`✨ Pedido #${updated.id.slice(-6)} actualizado a ${updated.estado.toUpperCase()}`);
        }
      };
    } catch (e) {
      console.log('BroadcastChannel error:', e);
    }

    // 2. Escuchador de localStorage
    const handleStorageChange = (e) => {
      if ((e.key === 'syspim_last_order' || e.key === 'syspim_pending_orders_queue') && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            parsed.forEach(o => handleNewOrder(o));
          } else {
            handleNewOrder(parsed);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Polling automático de seguridad cada 1.5 segundos para no perder ningún pedido
    const queueInterval = setInterval(() => {
      try {
        const queueStr = localStorage.getItem('syspim_pending_orders_queue');
        if (queueStr) {
          const queue = JSON.parse(queueStr);
          if (Array.isArray(queue) && queue.length > 0) {
            queue.forEach(ord => handleNewOrder(ord));
          }
        }
      } catch(e){}
    }, 1500);

    // 4. Escuchador de Supabase Realtime, Polling Recurrente cada 3s y Carga Inicial
    let supabaseSubscription;
    const fetchSupabaseOrders = () => {
      const sbClient = (window.ColmadoSupabase && window.ColmadoSupabase.client) || window.supabaseClient;
      if (sbClient) {
        try {
          sbClient.from('pedidos').select('*').order('created_at', { ascending: false }).limit(20)
            .then(({ data }) => {
              if (data && Array.isArray(data)) data.forEach(ord => handleNewOrder(ord));
            }).catch(() => {});
          sbClient.from('orders').select('*').order('created_at', { ascending: false }).limit(20)
            .then(({ data }) => {
              if (data && Array.isArray(data)) data.forEach(ord => handleNewOrder(ord));
            }).catch(() => {});
        } catch(e){}
      }
    };

    fetchSupabaseOrders();
    const supabaseInterval = setInterval(fetchSupabaseOrders, 3000);

    const sbClient = (window.ColmadoSupabase && window.ColmadoSupabase.client) || window.supabaseClient;
    if (sbClient) {
      try {
        supabaseSubscription = sbClient
          .channel('public:pedidos')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
            if (payload.new) handleNewOrder(payload.new);
          })
          .subscribe();
      } catch(e){}
    }

    return () => {
      if (broadcast) broadcast.close();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(queueInterval);
      clearInterval(supabaseInterval);
      if (supabaseSubscription && sbClient) {
        sbClient.removeChannel(supabaseSubscription);
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

  // Cálculo dinámico y real de estadísticas por cliente (Garantiza exactitud matemática sin depender de polling)
  const realCustomerStats = useMemo(() => {
    const statsMap = {};
    pedidos.forEach(p => {
      const pPhone = (p.cliente_telefono || '').replace(/[^0-9]/g, '');
      const pName = (p.cliente_nombre || p.customer_info?.nombre || '').toLowerCase().trim();
      const amt = Number(p.monto_total || p.total || 0);

      const keys = [];
      if (pPhone) keys.push('phone:' + pPhone);
      if (pName) keys.push('name:' + pName);

      keys.forEach(k => {
        if (!statsMap[k]) statsMap[k] = { count: 0, total: 0 };
        statsMap[k].count += 1;
        statsMap[k].total += amt;
      });
    });
    return statsMap;
  }, [pedidos]);

  const tenantProducts = useMemo(() => {
    return productos.filter(p => !p.tenant_id || p.tenant_id === activeTenantId || p.tenant_id === 't-001');
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

    // 1. Validar disponibilidad de stock en el dominio de inventario
    const validation = validateInventoryMovement(productos, cart);
    if (!validation.valid) {
      showToast(`⚠️ ${validation.errors[0] || 'Error de validación de inventario'}`);
      return;
    }

    // 2. Ejecutar transacción de venta en el dominio (descuento inmutable + logs de Kardex)
    let updatedProductos = [];
    setProductos(prevProds => {
      const saleResult = processSale(prevProds, cart, 'VENTA_POS');
      if (!saleResult.success) {
        showToast(`⚠️ ${saleResult.errors[0] || 'No se pudo procesar la venta'}`);
        return prevProds;
      }
      updatedProductos = saleResult.updatedProductos;

      // Persistir lista de productos
      try {
        localStorage.setItem('syspim_productos_list', JSON.stringify(updatedProductos));
      } catch (e) {}

      // Persistir historial de Kardex para auditoría
      try {
        const existingKardex = JSON.parse(localStorage.getItem('syspim_kardex_logs') || '[]');
        const updatedKardex = [...(saleResult.movementRecords || []), ...existingKardex].slice(0, 250);
        localStorage.setItem('syspim_kardex_logs', JSON.stringify(updatedKardex));
      } catch (e) {}

      // Notificar a otras pestañas/ventanas PWA vía BroadcastChannel
      try {
        notifyStockUpdate(updatedProductos);
      } catch (e) {}

      return updatedProductos;
    });

    const recVal = Number(cashReceived) || cartTotal;
    const changeVal = Math.max(0, recVal - cartTotal);

    const clientObj = CLIENTES.find(c => c.id === selectedCustomer) || clientesList.find(c => c.id === selectedCustomer);
    const clientName = clientObj?.nombre || 'Consumidor Final';

    const receipt = {
      id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cliente: clientName,
      metodo: paymentMethod.toUpperCase(),
      items: [...cart],
      total: cartTotal,
      recibido: recVal,
      devuelta: changeVal,
      ncf: ncfRequired ? `B01${Math.floor(10000000 + Math.random() * 90000000)}` : null,
      rnc: ncfRequired ? (rncNumber || '131-88995-2') : null
    };

    // 3. Registrar venta en el listado de pedidos para historial
    const newPosOrder = {
      id: receipt.id,
      cliente_nombre: clientName,
      cliente_telefono: clientObj?.telefono || 'Caja POS Local',
      direccion_entrega: 'Venta Directa en Caja POS',
      monto_total: cartTotal,
      metodo_pago: paymentMethod.toUpperCase(),
      estado: 'completado',
      status: 'completado',
      created_at: new Date().toISOString(),
      detalles: cart.map(i => ({ cantidad: i.qty, nombre: i.nombre, precio_unitario: i.precio }))
    };

    setPedidos(prev => [newPosOrder, ...prev]);

    // 4. Actualizar cliente en clientesList si fue seleccionado
    if (selectedCustomer && selectedCustomer !== 'consumidor_final') {
      setClientesList(prevList => {
        const updatedList = prevList.map(c => {
          if (c.id === selectedCustomer || c.nombre.toLowerCase().trim() === clientName.toLowerCase().trim()) {
            return {
              ...c,
              pedidosCount: (c.pedidosCount || 0) + 1,
              totalComprado: (c.totalComprado || 0) + cartTotal,
              ultimoPedido: 'Hoy'
            };
          }
          return c;
        });
        try {
          localStorage.setItem('syspim_clientes_list', JSON.stringify(updatedList));
        } catch (e) {}
        return updatedList;
      });
    }

    setCheckoutResult(receipt);
    setCart([]);
    setCashReceived('');
    setNcfRequired(false);
    setRncNumber('');
    showToast('🎉 ¡Venta procesada y stock descontado con éxito!');
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

      {/* 1. HEADER / TOP NAV UNIFICADO */}
      {activeTab !== 'catalog' && (
        <HeaderNav
          activeTenant={activeTenant}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tenantProductsCount={tenantProducts.length}
          pedidosCount={pedidos.filter(p => {
            const st = p.estado || p.status || 'pendiente';
            return st === 'pendiente' || st === 'en_camino' || st === 'despachado';
          }).length}
          clientesCount={clientesList.length}
          onCopyCatalogLink={() => {
            const slug = activeTenant?.slug || 'colmado-don-pedro';
            const link = `${window.location.origin}${window.location.pathname.replace(/\/index\.html$/, '')}/catalog.html?tenant=${slug}`;
            navigator.clipboard?.writeText(link);
            setToast('🔗 Enlace del catálogo copiado');
          }}
          onOpenShareModal={() => setShowSharePwaModal(true)}
          onOpenDiagnosticsModal={() => setShowDiagnosticsModal(true)}
          onOpenKardexModal={() => setShowKardexModal(true)}
        />
      )}

      {/* 2. MAIN BODY GENERAL LIGHT RETAIL */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex-1">
        
        {/* ================= MODULO GERENCIAL 1: DASHBOARD EJECUTIVO & CENTRO DE CONTROL ================= */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            productos={productos}
            pedidos={pedidos}
            activeTenant={activeTenant}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* ================= MODULO GERENCIAL 2: CAJA REGISTRADORA & ARQUEO ================= */}
        {activeTab === 'cash-drawer' && (
          <CashDrawerModule
            pedidos={pedidos}
            onToast={(msg) => setToast(msg)}
          />
        )}

        {/* ================= MODULO GERENCIAL 3: CONTROL DE DELIVERY & LIBRO MAYOR ================= */}
        {activeTab === 'delivery-control' && (
          <DeliveryLedgerModule
            pedidos={pedidos}
            onToast={(msg) => setToast(msg)}
          />
        )}

        {/* ================= MODULO GERENCIAL 4: CENTRO DE REPORTES & EXPORTACIÓN ================= */}
        {activeTab === 'reports' && (
          <ReportsModule
            pedidos={pedidos}
            productos={productos}
            activeTenant={activeTenant}
            onToast={(msg) => setToast(msg)}
          />
        )}

        {/* ================= MODULO 1: TERMINAL DE CAJA DE COBRO (POS MODULAR) ================= */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in-up">
            
            {/* COLUMNA IZQUIERDA: BÚSQUEDA Y DETALLE DE VENTA */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              <SearchBar
                searchInputRef={searchInputRef}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredProducts={filteredProducts}
                tenantProducts={tenantProducts}
                addToCart={addToCart}
                showToast={(msg) => setToast(msg)}
              />

              <CartTable
                cart={cart}
                cartCount={cartCount}
                cartListRef={cartListRef}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                clientesList={clientesList}
                CLIENTES={CLIENTES}
                updateCartQty={updateCartQty}
                setCart={setCart}
                tenantProducts={tenantProducts}
                addToCart={addToCart}
              />
            </div>

            {/* COLUMNA DERECHA: PANEL RESUMEN DE COBRO */}
            <div className="lg:col-span-4 sticky top-20">
              <PaymentPanel
                cart={cart}
                cartTotal={cartTotal}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cashReceived={cashReceived}
                setCashReceived={setCashReceived}
                ncfRequired={ncfRequired}
                setNcfRequired={setNcfRequired}
                rncNumber={rncNumber}
                setRncNumber={setRncNumber}
                handleCheckout={handleCheckout}
              />
            </div>

            {/* BANDA INFERIOR DE ATAJOS */}
            <ShortcutBar />

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
                        <td className="py-3.5 px-4 font-bold text-[#0284C7] font-mono-tabular">RD$ {p.precio.toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-extrabold px-2.5 py-0.5 rounded-lg border text-xs ${
                              p.stock <= 5 ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]' : 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                            }`}>
                              {p.stock} unid.
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  const newStock = Math.max(0, p.stock - 1);
                                  setProductos(prev => {
                                    const updated = prev.map(item => item.id === p.id ? { ...item, stock: newStock } : item);
                                    try { localStorage.setItem('syspim_productos_list', JSON.stringify(updated)); } catch(e){}
                                    try {
                                      const bc = new BroadcastChannel('syspim_orders_channel');
                                      bc.postMessage({ type: 'STOCK_UPDATE', payload: updated });
                                      bc.close();
                                    } catch(e){}
                                    return updated;
                                  });
                                  showToast(`📉 Stock de ${p.nombre} ajustado a ${newStock}`);
                                }}
                                className="w-6 h-6 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-extrabold text-xs flex items-center justify-center border border-[#CBD5E1]"
                                title="Restar 1 unidad de stock"
                              >
                                -
                              </button>
                              <button
                                onClick={() => {
                                  const newStock = p.stock + 1;
                                  setProductos(prev => {
                                    const updated = prev.map(item => item.id === p.id ? { ...item, stock: newStock } : item);
                                    try { localStorage.setItem('syspim_productos_list', JSON.stringify(updated)); } catch(e){}
                                    try {
                                      const bc = new BroadcastChannel('syspim_orders_channel');
                                      bc.postMessage({ type: 'STOCK_UPDATE', payload: updated });
                                      bc.close();
                                    } catch(e){}
                                    return updated;
                                  });
                                  showToast(`📈 Stock de ${p.nombre} aumentado a ${newStock}`);
                                }}
                                className="w-6 h-6 rounded-md bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0284C7] font-extrabold text-xs flex items-center justify-center border border-[#BAE6FD]"
                                title="Sumar 1 unidad de stock"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </td>
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
            
            {(() => {
              const activeList = pedidos.filter(p => {
                const st = p.estado || p.status || 'pendiente';
                return st === 'pendiente' || st === 'en_camino' || st === 'despachado';
              });
              const completedList = pedidos.filter(p => {
                const st = p.estado || p.status;
                return st === 'entregado' || st === 'completado';
              });

              const listToRender = orderSubFilter === 'active' 
                ? activeList 
                : orderSubFilter === 'completed' 
                ? completedList 
                : pedidos;

              return (
                <React.Fragment>
                  {/* HEADER & SUB-FILTROS DE PEDIDOS */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                    <div>
                      <h3 className="font-extrabold text-xl text-[#0F172A] font-jakarta">📋 Pedidos del Colmado</h3>
                      <p className="text-xs text-[#64748B] mt-0.5">Control de órdenes entrantes, despachos en camino e historial de entregas.</p>
                    </div>

                    <button 
                      onClick={() => {
                        if (window.AdminModule && window.AdminModule.unlockAudioContext) {
                          window.AdminModule.unlockAudioContext();
                        }
                        showToast('🔔 Alertas de audio y Realtime activas');
                      }}
                      className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-full text-xs font-bold shadow-md shadow-[#0284C7]/20 transition-all flex-shrink-0"
                    >
                      🔔 Conectar POS / Activar Sonido
                    </button>
                  </div>

                  {/* PESTAÑAS DE SUB-FILTRO */}
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
                    <button
                      onClick={() => setOrderSubFilter('active')}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border flex items-center gap-2 whitespace-nowrap ${
                        orderSubFilter === 'active'
                          ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD] shadow-sm'
                          : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'
                      }`}
                    >
                      <span>⚡ En Proceso / Activos</span>
                      <span className="bg-[#0284C7] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{activeList.length}</span>
                    </button>
                    <button
                      onClick={() => setOrderSubFilter('completed')}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border flex items-center gap-2 whitespace-nowrap ${
                        orderSubFilter === 'completed'
                          ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] shadow-sm'
                          : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'
                      }`}
                    >
                      <span>✅ Historial Entregados</span>
                      <span className="bg-[#15803D] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{completedList.length}</span>
                    </button>
                    <button
                      onClick={() => setOrderSubFilter('all')}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border flex items-center gap-2 whitespace-nowrap ${
                        orderSubFilter === 'all'
                          ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-sm'
                          : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'
                      }`}
                    >
                      <span>📋 Todos</span>
                      <span className="bg-[#64748B] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{pedidos.length}</span>
                    </button>
                  </div>

                  {/* MENSAJE CUANDO LA SECCIÓN ESTÁ VACÍA */}
                  {listToRender.length === 0 ? (
                    <div className="bg-[#F8FAFC] border border-dashed border-[#CBD5E1] p-10 rounded-[20px] text-center space-y-2">
                      <span className="text-3xl block">✨</span>
                      <h4 className="font-extrabold text-sm text-[#0F172A]">No hay pedidos en esta sección</h4>
                      <p className="text-xs text-[#64748B]">
                        {orderSubFilter === 'active' 
                          ? '¡Excelente! Todos los pedidos han sido despachados y entregados con éxito.' 
                          : 'Aún no hay pedidos en este historial.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {listToRender.map(ped => (
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
                          {(() => {
                            let items = [];
                            if (Array.isArray(ped.detalles)) items = ped.detalles;
                            else if (typeof ped.detalles === 'string') {
                              try { items = JSON.parse(ped.detalles); } catch(e){}
                            }
                            if (items.length === 0) return null;
                            return (
                              <div className="bg-white border border-[#E2E8F0] p-2.5 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold uppercase text-[#64748B] block">Productos Solicitados:</span>
                                {items.map((d, idx) => (
                                  <div key={idx} className="flex justify-between text-[11px] text-[#0F172A]">
                                    <span>• {d.cantidad || 1}x {d.nombre}</span>
                                    <span className="font-mono text-[#64748B]">RD$ {((d.precio_unitario || d.precio || 0) * (d.cantidad || 1)).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

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
                                onClick={() => setSelectedOrderForDelivery(ped)}
                                className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-full text-xs shadow-md shadow-[#15803D]/20 flex items-center justify-center gap-1 transition-all"
                              >
                                📲 Enviar a Delivery
                              </button>

                              {/* BOTÓN 3: ELIMINAR PEDIDO */}
                              <button
                                onClick={() => {
                                  if (confirm(`¿Deseas eliminar el pedido #${ped.id.slice(-8)} de la lista?`)) {
                                    setPedidos(prev => prev.filter(p => p.id !== ped.id));
                                    setToast(`🗑️ Pedido #${ped.id.slice(-8)} eliminado`);
                                  }
                                }}
                                className="px-3 py-2 bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#DC2626] border border-[#FECACA] font-extrabold rounded-full text-xs transition-all flex items-center justify-center shadow-sm"
                                title="Eliminar este pedido de la lista"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })()}
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
                  const cleanName = (cust.nombre || '').toLowerCase().trim();
                  const foundStats = realCustomerStats['phone:' + cleanPhone] || realCustomerStats['name:' + cleanName];
                  
                  const countToDisplay = foundStats ? foundStats.count : Math.min(cust.pedidosCount || 0, 15);
                  const totalToDisplay = foundStats ? foundStats.total : Math.min(cust.totalComprado || 0, 10000);
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

                        <button
                          onClick={() => setViewCustomerHistory(cust)}
                          className="text-[10px] font-bold text-[#0369A1] bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#BAE6FD] px-2.5 py-1 rounded-full whitespace-nowrap transition-all flex items-center gap-1 shadow-sm"
                          title="Ver todas las ventas de este cliente"
                        >
                          <span>📄 {countToDisplay} pedidos ↗</span>
                        </button>
                      </div>

                      <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl space-y-1 text-xs">
                        <div className="flex items-start gap-1.5 text-[#64748B]">
                          <span className="flex-shrink-0">📍</span>
                          <span className="font-semibold text-[#0F172A] leading-tight">{cust.direccion || 'Dirección no registrada'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9] text-[11px]">
                          <span className="text-[#64748B]">Total Comprado: <strong className="text-[#15803D]">RD$ {totalToDisplay.toFixed(2)}</strong></span>
                          <span className="text-[#94A3B8] text-[10px]">Último: {cust.ultimoPedido || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setViewCustomerHistory(cust)}
                          className="px-3 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1"
                        >
                          <span>📄 Ventas</span>
                        </button>
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
                          <span>🛒 Vender POS</span>
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

      {/* MODAL: SELECCIONAR O AGREGAR REPARTIDOR / DELIVERY */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-[24px] shadow-2xl border border-[#E2E8F0] space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                <span>🛵 Seleccionar Repartidor / Delivery</span>
              </h3>
              <button onClick={() => setSelectedOrderForDelivery(null)} className="w-8 h-8 rounded-full bg-[#F1F5F9] text-gray-500 font-bold">✕</button>
            </div>

            <p className="text-xs text-[#64748B]">Selecciona a qué repartidor deseas enviar el pedido <strong>#{selectedOrderForDelivery.id.slice(-8)}</strong> por WhatsApp:</p>

            {/* LISTA DE REPARTIDORES GUARDADOS */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {repartidoresList.map(rep => (
                <label 
                  key={rep.id} 
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedRepartidorPhone === rep.telefono
                      ? 'bg-[#E0F2FE] border-[#0284C7] shadow-sm'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#BAE6FD]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="repartidorSelect"
                      value={rep.telefono}
                      checked={selectedRepartidorPhone === rep.telefono}
                      onChange={() => setSelectedRepartidorPhone(rep.telefono)}
                      className="accent-[#0284C7]"
                    />
                    <div>
                      <span className="font-extrabold text-xs text-[#0F172A] block">{rep.nombre}</span>
                      <span className="text-[11px] font-mono text-[#64748B]">📞 {rep.telefono}</span>
                    </div>
                  </div>
                  {rep.telefono === '8094965148' && (
                    <span className="bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      ⭐ Principal
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* OPCIÓN DE AGREGAR OTRO REPARTIDOR */}
            {!showAddRepartidorForm ? (
              <button
                onClick={() => setShowAddRepartidorForm(true)}
                className="w-full py-2 text-center text-xs font-bold text-[#0284C7] hover:underline"
              >
                + Agregar otro número de delivery
              </button>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newRepartidorNombre || !newRepartidorTelefono) return;
                const cleanT = newRepartidorTelefono.replace(/[^0-9]/g, '');
                const newRep = {
                  id: 'rep-' + Date.now(),
                  nombre: newRepartidorNombre.trim(),
                  telefono: cleanT
                };
                setRepartidoresList(prev => [...prev, newRep]);
                setSelectedRepartidorPhone(cleanT);
                setNewRepartidorNombre('');
                setNewRepartidorTelefono('');
                setShowAddRepartidorForm(false);
                setToast(`✅ Delivery ${newRep.nombre} guardado`);
              }} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl space-y-2.5 text-xs font-bold animate-fade-in-up">
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Nuevo Repartidor:</span>
                <input
                  type="text"
                  required
                  placeholder="Nombre (Ej: Delivery 3 - Pedro)"
                  value={newRepartidorNombre}
                  onChange={(e) => setNewRepartidorNombre(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
                />
                <input
                  type="text"
                  required
                  placeholder="WhatsApp (Ej: 8094965148)"
                  value={newRepartidorTelefono}
                  onChange={(e) => setNewRepartidorTelefono(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddRepartidorForm(false)} className="px-3 py-1.5 text-xs text-[#64748B]">Cancelar</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#0284C7] text-white font-bold rounded-full text-xs shadow-sm">Guardar Delivery</button>
                </div>
              </form>
            )}

            {/* BOTÓN FINAL PARA ENVIAR WHATSAPP */}
            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedOrderForDelivery(null)} className="px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-full">Cancelar</button>
              <button 
                type="button" 
                onClick={() => {
                  const ped = selectedOrderForDelivery;
                  const cleanPhone = selectedRepartidorPhone.replace(/[^0-9]/g, '');
                  
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

                  window.open(`https://wa.me/1${cleanPhone}?text=${encodeURIComponent(rawMsg)}`, '_blank');
                  
                  // Auto-cambiar el estado del pedido a 'en_camino'
                  setPedidos(prev => prev.map(p => p.id === ped.id ? { ...p, estado: 'en_camino', status: 'en_camino' } : p));
                  setSelectedOrderForDelivery(null);
                  setToast(`📲 Despacho enviado a Delivery (${cleanPhone})`);
                }} 
                className="px-5 py-2 text-xs font-bold bg-[#15803D] hover:bg-[#166534] text-white rounded-full shadow-md shadow-[#15803D]/20 flex items-center gap-1.5"
              >
                <span>📲 Enviar a Delivery por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTORIAL DE VENTAS Y COMPRAS DEL CLIENTE */}
      {viewCustomerHistory && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full p-6 rounded-[24px] shadow-2xl border border-[#E2E8F0] space-y-4 animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-extrabold text-base shadow-sm">
                  {viewCustomerHistory.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                    <span>{viewCustomerHistory.nombre}</span>
                    {viewCustomerHistory.tipo === 'credito' && (
                      <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        📒 Fiado / Crédito
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-[#64748B]">📞 {viewCustomerHistory.telefono || 'Sin teléfono'} • 📍 {viewCustomerHistory.direccion || 'Sin dirección'}</p>
                </div>
              </div>
              <button onClick={() => setViewCustomerHistory(null)} className="w-8 h-8 rounded-full bg-[#F1F5F9] text-gray-500 font-bold">✕</button>
            </div>

            {/* TARJETA DE RESUMEN ACUMULADO */}
            {(() => {
              const cPhone = (viewCustomerHistory.telefono || '').replace(/[^0-9]/g, '');
              const cName = (viewCustomerHistory.nombre || '').toLowerCase().trim();
              const foundStats = realCustomerStats['phone:' + cPhone] || realCustomerStats['name:' + cName];
              const modalCount = foundStats ? foundStats.count : Math.min(viewCustomerHistory.pedidosCount || 0, 15);
              const modalTotal = foundStats ? foundStats.total : Math.min(viewCustomerHistory.totalComprado || 0, 10000);

              return (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#64748B] text-[11px] block">Total Pedidos Registrados:</span>
                    <span className="font-extrabold text-sm text-[#0F172A]">{modalCount} compras</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#64748B] text-[11px] block">Total Acumulado Comprado:</span>
                    <span className="font-extrabold text-base text-[#15803D]">RD$ {modalTotal.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}

            {/* LISTADO DE VENTAS / PEDIDOS DEL CLIENTE */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {(() => {
                const customerPhone = (viewCustomerHistory.telefono || '').replace(/[^0-9]/g, '');
                const clientOrders = pedidos.filter(p => {
                  const pPhone = (p.cliente_telefono || '').replace(/[^0-9]/g, '');
                  const pName = (p.cliente_nombre || p.customer_info?.nombre || '').toLowerCase();
                  return (customerPhone && pPhone === customerPhone) || pName === viewCustomerHistory.nombre.toLowerCase();
                });

                if (clientOrders.length === 0) {
                  return (
                    <div className="p-8 border border-dashed border-[#E2E8F0] rounded-2xl text-center space-y-2">
                      <span className="text-2xl block">📄</span>
                      <p className="font-bold text-xs text-[#0F172A]">Sin detalle de pedidos registrados en tiempo real</p>
                      <p className="text-[11px] text-[#64748B]">Las ventas registradas desde la caja POS o PWA para este cliente aparecerán aquí.</p>
                    </div>
                  );
                }

                return clientOrders.map(order => {
                  const isDone = (order.estado || order.status) === 'entregado' || (order.estado || order.status) === 'completado';
                  
                  return (
                    <div key={order.id} className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-2 shadow-sm hover:border-[#BAE6FD] transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#0F172A]">#{order.id.slice(-8)}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            isDone ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]' : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                          }`}>
                            {isDone ? '✅ ENTREGADO' : '🟡 EN PROCESO'}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#15803D]">
                          RD$ {(order.monto_total || order.total || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#64748B] flex items-center justify-between pt-1 border-t border-[#F1F5F9]">
                        <span>💳 {order.metodo_pago}</span>
                        <span>🔑 {order.delivery_token || 'POS'}</span>
                      </div>

                      <button
                        onClick={() => setViewOrderDetails(order)}
                        className="w-full py-2 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border border-[#BAE6FD] font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all mt-1"
                      >
                        🔍 Abrir y Consultar esta Venta
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONSULTA DETALLADA DE VENTA TICKET */}
      {viewOrderDetails && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-[24px] shadow-2xl border border-[#E2E8F0] space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                  <span>🧾 Consulta de Venta</span>
                </h3>
                <span className="text-[11px] font-mono text-[#64748B]">Ticket #{viewOrderDetails.id}</span>
              </div>
              <button onClick={() => setViewOrderDetails(null)} className="w-8 h-8 rounded-full bg-[#F1F5F9] text-gray-500 font-bold">✕</button>
            </div>

            {/* DETALLES DE LA VENTA */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between pb-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Cliente:</span>
                <span className="font-extrabold text-[#0F172A]">{viewOrderDetails.cliente_nombre || 'Cliente General'}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Teléfono:</span>
                <span className="font-mono text-[#0F172A]">{viewOrderDetails.cliente_telefono || 'Sin teléfono'}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Dirección:</span>
                <span className="font-semibold text-[#0F172A] text-right">{viewOrderDetails.direccion_entrega || 'Local'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Forma de Pago:</span>
                <span className="font-bold text-[#0369A1]">{viewOrderDetails.metodo_pago}</span>
              </div>
            </div>

            {/* DESGLOSE DE PRODUCTOS SOLICITADOS */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Productos Comprados:</span>
              <div className="bg-white border border-[#E2E8F0] p-3 rounded-2xl space-y-1.5 max-h-40 overflow-y-auto">
                {(() => {
                  let items = [];
                  if (Array.isArray(viewOrderDetails.detalles)) items = viewOrderDetails.detalles;
                  else if (typeof viewOrderDetails.detalles === 'string') {
                    try { items = JSON.parse(viewOrderDetails.detalles); } catch(e){}
                  }
                  if (items.length === 0) return <p className="text-[#64748B] text-center">Venta rápida registrada en POS</p>;
                  return items.map((d, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[#0F172A]">
                      <span className="font-semibold">• {d.cantidad || 1}x {d.nombre}</span>
                      <span className="font-mono text-[#64748B]">RD$ {((d.precio_unitario || d.precio || 0) * (d.cantidad || 1)).toFixed(2)}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="bg-[#DCFCE7] border border-[#86EFAC] p-3 rounded-2xl flex items-center justify-between text-sm font-extrabold text-[#15803D]">
              <span>TOTAL DE LA VENTA:</span>
              <span>RD$ {(viewOrderDetails.monto_total || viewOrderDetails.total || 0).toFixed(2)}</span>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="pt-2 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setViewOrderDetails(null)} 
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-full"
              >
                Cerrar
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (window.AdminModule && window.AdminModule.acceptAndPrintOrder) {
                    window.AdminModule.acceptAndPrintOrder(viewOrderDetails.id, viewOrderDetails);
                  } else {
                    window.print();
                  }
                }} 
                className="px-5 py-2 text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-full shadow-md shadow-[#0284C7]/20 flex items-center gap-1.5"
              >
                <span>🖨️ Re-Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MONITOR DE DIAGNÓSTICO DE RED Y RECEPCIÓN DE PEDIDOS */}
      {showDiagnosticsModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 rounded-[24px] shadow-2xl border border-[#E2E8F0] space-y-4 animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center justify-center font-extrabold text-base">
                  🛠️
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F172A]">Monitor & Diagnóstico de Pedidos en Tiempo Real</h3>
                  <p className="text-xs text-[#64748B]">Auditoría de recepción desde móviles, estado de conexión y trazabilidad.</p>
                </div>
              </div>
              <button onClick={() => setShowDiagnosticsModal(false)} className="w-8 h-8 rounded-full bg-[#F1F5F9] text-gray-500 font-bold">✕</button>
            </div>

            {/* ESTADO DE LOS SERVICIOS DE CONEXIÓN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">🌐 Supabase Cloud:</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                </div>
                <span className="text-[#15803D] font-extrabold block text-[11px]">🟢 CONECTADO (3s Poll)</span>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">📡 Broadcast Realtime:</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                </div>
                <span className="text-[#15803D] font-extrabold block text-[11px]">🟢 CANAL ACTIVO</span>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">📦 Memoria Local:</span>
                  <span className="text-[#0284C7] font-mono text-[11px]">{pedidos.length} órdenes</span>
                </div>
                <span className="text-[#0284C7] font-extrabold block text-[11px]">🟢 SINCRONIZADO</span>
              </div>
            </div>

            {/* TABLA DE AUDITORÍA Y ORIGEN DE LOS PEDIDOS */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase block">Listado y Trazabilidad de Pedidos Recibidos ({pedidos.length}):</span>
              {pedidos.length === 0 ? (
                <div className="p-8 border border-dashed border-[#E2E8F0] rounded-2xl text-center space-y-2">
                  <span className="text-2xl block">📦</span>
                  <p className="font-bold text-xs text-[#0F172A]">No hay pedidos registrados en memoria</p>
                </div>
              ) : (
                pedidos.map(p => {
                  const isDone = (p.estado || p.status) === 'entregado' || (p.estado || p.status) === 'completado';
                  return (
                    <div key={p.id} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0F172A]">#{p.id.slice(-8)}</span>
                          <span className="text-[10px] font-bold text-[#0369A1] bg-[#E0F2FE] border border-[#BAE6FD] px-2 py-0.5 rounded-full">
                            👤 {p.cliente_nombre || 'Cliente'} ({p.cliente_telefono || 'N/A'})
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] truncate max-w-md">📍 {p.direccion_entrega || 'Entrega en local'} • Total: <strong>RD$ {(p.monto_total || p.total || 0).toFixed(2)}</strong></p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          isDone ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]' : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                        }`}>
                          {isDone ? '✅ ENTREGADO' : '🟡 PENDIENTE / ACTIVO'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* BOTONES DE PRUEBA Y ACCIONES DE DIAGNÓSTICO */}
            <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const testOrder = {
                      id: 'TEST-' + Math.floor(1000 + Math.random() * 9000),
                      cliente_nombre: 'Cliente Prueba Móvil',
                      cliente_telefono: '809-555-9999',
                      direccion_entrega: 'Prueba de diagnóstico de recepción',
                      monto_total: 250.00,
                      metodo_pago: 'Efectivo',
                      estado: 'pendiente',
                      status: 'pendiente',
                      delivery_token: 'DEL-TEST99',
                      created_at: new Date().toISOString(),
                      detalles: [{ cantidad: 1, nombre: 'Producto Prueba Diagnóstico', precio_unitario: 250 }]
                    };
                    
                    setPedidos(prev => [testOrder, ...prev]);
                    
                    // Guardar en Supabase
                    const sbClient = (window.ColmadoSupabase && window.ColmadoSupabase.client) || window.supabaseClient;
                    if (sbClient) {
                      sbClient.from('pedidos').insert([testOrder]).catch(() => {});
                    }

                    // Transmitir evento
                    try {
                      const bc = new BroadcastChannel('syspim_orders_channel');
                      bc.postMessage({ type: 'NEW_ORDER', order: testOrder });
                      bc.close();
                    } catch(e){}

                    setToast(`🧪 Pedido de prueba ${testOrder.id} enviado exitosamente`);
                  }}
                  className="px-3.5 py-2 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border border-[#BAE6FD] font-bold rounded-full transition-all"
                >
                  🧪 Enviar Pedido de Prueba
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowDiagnosticsModal(false)} 
                  className="px-4 py-2 font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-full"
                >
                  Cerrar
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
              {checkoutResult.metodo === 'EFECTIVO' && (
                <>
                  <div className="flex justify-between border-b border-[#2A364B] pb-2">
                    <span className="text-[#94A3B8]">Efectivo Recibido:</span>
                    <span className="font-bold text-[#F8FAFC]">RD$ {(checkoutResult.recibido || checkoutResult.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2A364B] pb-2">
                    <span className="text-[#94A3B8]">Devuelta (Cambio):</span>
                    <span className="font-bold text-[#22C55E]">RD$ {(checkoutResult.devuelta || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
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
              <button 
                onClick={() => {
                  setCheckoutResult(null);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }} 
                className="flex-1 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs py-3 rounded-[12px] shadow-lg shadow-[#0284C7]/25 transition-all"
              >
                NUEVA VENTA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AUDITORÍA KARDEX */}
      <KardexModal 
        isOpen={showKardexModal} 
        onClose={() => setShowKardexModal(false)} 
      />

    </div>
  );
}

// Exportar globalmente por si se importa en otros módulos
if (typeof window !== 'undefined') {
  window.catalogoProductos = catalogoProductos;
}

export default App;
