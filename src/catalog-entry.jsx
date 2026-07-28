
      import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles.css';


      // CATÁLOGO COMPLETO DE PRODUCTOS (80 PRODUCTOS DE INVENTARIO)
      const PRODUCTOS_INICIALES = [
        { id: "prod_001", nombre: "Rica Leche Listamilk Lt", precio: 76, precioAnterior: 78, categoria: "Lácteos", imagen: "public/assets/rica_leche_listamilk.png", stock: 45 },
        { id: "prod_002", nombre: "Rica Leche Descremada Lt", precio: 76, precioAnterior: null, categoria: "Lácteos", imagen: "public/assets/rica_leche_descremada.png", stock: 30 },
        { id: "prod_003", nombre: "Bravo Leche Uht Entera 1Lt", precio: 59, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 50 },
        { id: "prod_004", nombre: "Bravo Leche Uht 1.5% 1Lt", precio: 49, precioAnterior: 52, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", stock: 24 },
        { id: "prod_005", nombre: "Bravo Dulce De Leche 400 Gr", precio: 139, precioAnterior: null, categoria: "Dulces y caramelos", imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80", stock: 18 },
        { id: "prod_006", nombre: "Rica Leche S/ Lactosa Lt", precio: 79, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 35 },
        { id: "prod_007", nombre: "Parmalat Leche Entera 1 Lt", precio: 75, precioAnterior: 86, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", stock: 40 },
        { id: "prod_008", nombre: "Rica Leche Semi Descremada Lt", precio: 76, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 20 },
        { id: "prod_009", nombre: "Parmalat Leche Semidescremada Lt", precio: 75, precioAnterior: 86, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", stock: 25 },
        { id: "prod_010", nombre: "Rica Leche Listamilk 250 Ml", precio: 30, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 60 },
        { id: "prod_011", nombre: "Parmalat Leche Descremada 1 Lt", precio: 75, precioAnterior: 86, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", stock: 15 },
        { id: "prod_012", nombre: "Bravo Leche Uht Descremada", precio: 49, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 30 },
        { id: "prod_013", nombre: "Bravo Leche Uht Entera S/L (Botella)", precio: 69, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", stock: 22 },
        { id: "prod_014", nombre: "Parmalat Leche Zimil Baja Lactosa", precio: 98, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 18 },
        { id: "prod_015", nombre: "Bravo Leche Uht Descremada (Botella)", precio: 55, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", stock: 14 },
        { id: "prod_016", nombre: "Rica Leche Sin Lactosa 0 % Grasa", precio: 79, precioAnterior: 84, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 35 },
        { id: "prod_017", nombre: "Bravo Leche Condensada", precio: 109, precioAnterior: null, categoria: "Dulces y caramelos", imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80", stock: 40 },
        { id: "prod_018", nombre: "Ia Leche Corporal Proteinas", precio: 179, precioAnterior: null, categoria: "Higiene y salud", imagen: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80", stock: 12 },
        { id: "prod_019", nombre: "Caf Tres Leches", precio: 139, precioAnterior: null, categoria: "Dulces y caramelos", imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80", stock: 15 },
        { id: "prod_020", nombre: "Carnation Leche Evaporada", precio: 69, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80", stock: 80 },
        { id: "prod_021", nombre: "Nido Leche Crecimiento", precio: 315, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80", stock: 25 },
        { id: "prod_022", nombre: "Parmalat Leche Con Avena Lt", precio: 124, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", stock: 16 },
        { id: "prod_023", nombre: "Bravo Chocolate Con Leche", precio: 129, precioAnterior: null, categoria: "Dulces y caramelos", imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80", stock: 22 },
        { id: "prod_024", nombre: "Bravo Leche Evaporada 315 Ml", precio: 44, precioAnterior: 52, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80", stock: 65 },
        { id: "prod_025", nombre: "Bravo Crema Leche 200 Ml", precio: 64, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 28 },
        { id: "prod_026", nombre: "Bravo Crema Leche 1 L", precio: 279, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", stock: 10 },
        { id: "prod_027", nombre: "Bravo Leche Evaporada 1 Lt", precio: 159, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 35 },
        { id: "prod_028", nombre: "Bravo Leche Evaporada 200 Ml", precio: 36, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 50 },
        { id: "prod_029", nombre: "Bravo Leche Coco 10,5 Oz", precio: 60, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80", stock: 35 },
        { id: "prod_030", nombre: "Mubravo Mozzarella", precio: 259, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=400&q=80", stock: 10 },
        { id: "prod_031", nombre: "Bravo Leche Uht Proteina", precio: 99, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", stock: 25 },
        { id: "prod_032", nombre: "La Famosa Leche Coco 1...", precio: 139, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80", stock: 18 },
        { id: "prod_033", nombre: "Pan Leche Y Vainilla 8 Und", precio: 89, precioAnterior: null, categoria: "Dulces y caramelos", imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80", stock: 20 },
        { id: "prod_034", nombre: "Milex Leche Refill 1500 Gr", precio: 1424, precioAnterior: null, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80", stock: 15 },
        { id: "prod_035", nombre: "Nido Leche Fortificada 2200 Gr", precio: 1639, precioAnterior: 1784, categoria: "Lácteos", imagen: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80", stock: 12 },
        { id: "prod_036", nombre: "Repollo Morado Criollo", precio: 59, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=400&q=80", stock: 25 },
        { id: "prod_037", nombre: "Manzana Rockit 12/2 Lb", precio: 349, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80", stock: 20 },
        { id: "prod_038", nombre: "Picadillo De Vegetales (lsw)", precio: 89, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80", stock: 30 },
        { id: "prod_039", nombre: "Manzana Granny Imp 3 Lb", precio: 299, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1619546813926-a78fa6372ce2?auto=format&fit=crop&w=400&q=80", stock: 18 },
        { id: "prod_040", nombre: "Ajo Desgranado Lb", precio: 119, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=400&q=80", stock: 40 },
        { id: "prod_041", nombre: "Melon Cantaloupe Und", precio: 129, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1571575173700-afb9492e6a50?auto=format&fit=crop&w=400&q=80", stock: 15 },
        { id: "prod_042", nombre: "Aji Gustoso Paq.", precio: 89, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80", stock: 35 },
        { id: "prod_043", nombre: "Piña Md2 Un Porcionada", precio: 139, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80", stock: 22 },
        { id: "prod_044", nombre: "Naranja Agria Lb", precio: 54, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1534531141161-e41d1341d1de?auto=format&fit=crop&w=400&q=80", stock: 50 },
        { id: "prod_045", nombre: "Albahaca Verde Clamshell", precio: 69, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1608683273678-854746f3a3d5?auto=format&fit=crop&w=400&q=80", stock: 15 },
        { id: "prod_046", nombre: "Manzana Gala Org Imp 2 Lb", precio: 339, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80", stock: 12 },
        { id: "prod_047", nombre: "Pepino Mini Crunch", precio: 49, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=400&q=80", stock: 28 },
        { id: "prod_048", nombre: "Ciruela Fresca Imp Lb", precio: 199, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1521997888043-aa9c827744f8?auto=format&fit=crop&w=400&q=80", stock: 20 },
        { id: "prod_049", nombre: "Espinaca Verde Imp 10 Oz", precio: 209, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80", stock: 18 },
        { id: "prod_050", nombre: "Perejil Liso Emp", precio: 44, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1608683273678-854746f3a3d5?auto=format&fit=crop&w=400&q=80", stock: 30 },
        { id: "prod_051", nombre: "Blueberries Imp 4.4 Oz", precio: 219, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=400&q=80", stock: 25 },
        { id: "prod_052", nombre: "Espinaca Criolla Emp", precio: 42, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80", stock: 32 },
        { id: "prod_053", nombre: "Berro Emp", precio: 44, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1608683273678-854746f3a3d5?auto=format&fit=crop&w=400&q=80", stock: 20 },
        { id: "prod_054", nombre: "Romero", precio: 59, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1608683273678-854746f3a3d5?auto=format&fit=crop&w=400&q=80", stock: 15 },
        { id: "prod_055", nombre: "Classic Sal Espinaca Baby Org", precio: 319, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80", stock: 10 },
        { id: "prod_056", nombre: "Hongo Champiñón Rebanado", precio: 325, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1504470695779-75300268aa0e?auto=format&fit=crop&w=400&q=80", stock: 14 },
        { id: "prod_057", nombre: "Cebolla Roja Imp Lb", precio: 149, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=400&q=80", stock: 40 },
        { id: "prod_058", nombre: "Rábano Rojo Lb", precio: 79, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=400&q=80", stock: 22 },
        { id: "prod_059", nombre: "Hongo Champiñón Cesta", precio: 319, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1504470695779-75300268aa0e?auto=format&fit=crop&w=400&q=80", stock: 12 },
        { id: "prod_060", nombre: "Manzana Fuji Imp 3 Lb", precio: 269, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80", stock: 18 },
        { id: "prod_061", nombre: "Cúrcuma Org. Lb", precio: 99, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80", stock: 30 },
        { id: "prod_062", nombre: "Lechuga Corazón De Romana", precio: 154, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80", stock: 25 },
        { id: "prod_063", nombre: "Pico De Gallo Un (lswp)", precio: 89, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80", stock: 16 },
        { id: "prod_064", nombre: "Sazón Natural Und", precio: 199, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80", stock: 20 },
        { id: "prod_065", nombre: "Manzana Roja Imp 3 Lb", precio: 264, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80", stock: 24 },
        { id: "prod_066", nombre: "Limón Amarillo Imp Lb", precio: 135, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1534531141161-e41d1341d1de?auto=format&fit=crop&w=400&q=80", stock: 35 },
        { id: "prod_067", nombre: "Guayaba Injerta", precio: 49, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1536511135882-7d277a0ef88f?auto=format&fit=crop&w=400&q=80", stock: 28 },
        { id: "prod_068", nombre: "Ají Morrón Mamey Lb", precio: 74, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80", stock: 30 },
        { id: "prod_069", nombre: "Manzanas Golden Delicious Lb", precio: 79, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1619546813926-a78fa6372ce2?auto=format&fit=crop&w=400&q=80", stock: 32 },
        { id: "prod_070", nombre: "Perejil Rizado Emp", precio: 44, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1608683273678-854746f3a3d5?auto=format&fit=crop&w=400&q=80", stock: 20 },
        { id: "prod_071", nombre: "Espinaca Hojas Paq (Glp)", precio: 149, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80", stock: 15 },
        { id: "prod_072", nombre: "Corazón De Romana 2 Lbs", precio: 149, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80", stock: 18 },
        { id: "prod_073", nombre: "Ensalada Frutas Porcionada", precio: 149, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=400&q=80", stock: 20 },
        { id: "prod_074", nombre: "Corazón De Apio Imp Und", precio: 239, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80", stock: 12 },
        { id: "prod_075", nombre: "Brócoli Imp Und", precio: 269, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=400&q=80", stock: 22 },
        { id: "prod_076", nombre: "Guandules Fresco Emp", precio: 168, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=400&q=80", stock: 14 },
        { id: "prod_077", nombre: "Classic Sal Rúcula Org", precio: 319, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80", stock: 10 },
        { id: "prod_078", nombre: "Manzana Granny Org Imp 3 Lb", precio: 319, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1619546813926-a78fa6372ce2?auto=format&fit=crop&w=400&q=80", stock: 15 },
        { id: "prod_079", nombre: "Corazón De Romana Imp Und", precio: 299, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80", stock: 12 },
        { id: "prod_080", nombre: "Manzana Gala Imp 3 Lb", precio: 339, precioAnterior: null, categoria: "Frutas y Vegetales", imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80", stock: 20 },
        { id: "prod_081", nombre: "Arroz Selecto (por Lb / RD$)", precio: 40, precioAnterior: null, categoria: "Abarrotes", es_detalle: true, unidad_medida: "lb", imagen: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80", stock: 500 },
        { id: "prod_082", nombre: "Habichuela Roja Criolla (por Lb / RD$)", precio: 65, precioAnterior: null, categoria: "Abarrotes", es_detalle: true, unidad_medida: "lb", imagen: "https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=400&q=80", stock: 300 },
        { id: "prod_083", nombre: "Carne de Res Fresca (por Lb / RD$)", precio: 195, precioAnterior: null, categoria: "Carnes", es_detalle: true, unidad_medida: "lb", imagen: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=400&q=80", stock: 150 },
        { id: "prod_084", nombre: "Carne de Pollo Fresco (por Lb / RD$)", precio: 85, precioAnterior: null, categoria: "Carnes", es_detalle: true, unidad_medida: "lb", imagen: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80", stock: 200 },
        { id: "prod_085", nombre: "Plátano Verde Criollo (por Unid / RD$)", precio: 18, precioAnterior: null, categoria: "Frutas y Vegetales", es_detalle: true, unidad_medida: "unid", imagen: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80", stock: 400 },
        { id: "prod_086", nombre: "Guineo Verde (por Unid / RD$)", precio: 6, precioAnterior: null, categoria: "Frutas y Vegetales", es_detalle: true, unidad_medida: "unid", imagen: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80", stock: 600 },
        { id: "prod_087", nombre: "Yuca Criolla (por Lb / RD$)", precio: 30, precioAnterior: null, categoria: "Frutas y Vegetales", es_detalle: true, unidad_medida: "lb", imagen: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80", stock: 250 },
        { id: "prod_088", nombre: "Salami Induveca Super Especial (por Lb / RD$)", precio: 160, precioAnterior: null, categoria: "Carnes", es_detalle: true, unidad_medida: "lb", imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80", stock: 100 },
        { id: "prod_089", nombre: "Queso de Hoja / Cheddar (por Lb / RD$)", precio: 240, precioAnterior: null, categoria: "Lácteos", es_detalle: true, unidad_medida: "lb", imagen: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=400&q=80", stock: 80 },
        { id: "prod_090", nombre: "Sal Molida Refinada (por Lb / RD$)", precio: 20, precioAnterior: null, categoria: "Abarrotes", es_detalle: true, unidad_medida: "lb", imagen: "https://images.unsplash.com/photo-1518110165401-447e8c37edaa?auto=format&fit=crop&w=400&q=80", stock: 300 }
      ];

      const CATEGORIAS = [
        { id: 'todos', nombre: 'Todos los Productos', icon: '🛒' },
        { id: 'frutas-vegetales', nombre: 'Frutas y Vegetales', icon: '🍎' },
        { id: 'carnes', nombre: 'Carnes & Embutidos', icon: '🍖' },
        { id: 'lacteos', nombre: 'Lácteos & Quesos', icon: '🥛' },
        { id: 'bebidas', nombre: 'Bebidas', icon: '🥤' },
        { id: 'panaderia', nombre: 'Panadería', icon: '🍞' },
        { id: 'dulces', nombre: 'Dulces', icon: '🍬' },
        { id: 'abarrotes', nombre: 'Abarrotes & Granos', icon: '🥫' }
      ];

      function StandaloneCustomerCatalog() {
        const [products, setProducts] = useState(() => {
          try {
            const saved = localStorage.getItem('syspim_productos_list');
            if (saved) return JSON.parse(saved);
          } catch (e) {}
          return PRODUCTOS_INICIALES;
        });

        // Escuchador en tiempo real para sincronización cruzada de inventario (BroadcastChannel + storage event)
        useEffect(() => {
          const handleStorageChange = (e) => {
            if (e.key === 'syspim_productos_list' && e.newValue) {
              try {
                setProducts(JSON.parse(e.newValue));
              } catch (err) {}
            }
          };

          let broadcast;
          try {
            broadcast = new BroadcastChannel('syspim_orders_channel');
            broadcast.onmessage = (event) => {
              if (event.data && event.data.type === 'STOCK_UPDATE' && event.data.payload) {
                setProducts(event.data.payload);
              }
            };
          } catch (e) {}

          window.addEventListener('storage', handleStorageChange);
          return () => {
            window.removeEventListener('storage', handleStorageChange);
            if (broadcast) broadcast.close();
          };
        }, []);
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedCategory, setSelectedCategory] = useState('todos');
        const [cart, setCart] = useState([]);
        const [showOrderModal, setShowOrderModal] = useState(false);
        const [toastMsg, setToastMsg] = useState(null);

        // Estado Venta al Detalle (Libras / Monto en RD$)
        const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
        const [detailMode, setDetailMode] = useState('monto'); // 'monto' o 'libras'
        const [detailMontoVal, setDetailMontoVal] = useState('100');
        const [detailQtyVal, setDetailQtyVal] = useState('1');

        // Helper para detectar productos que se venden al detalle (Lbs, Unidades, Monto RD$)
        const isBulkItem = (product) => {
          if (!product) return false;
          if (product.es_detalle) return true;
          const norm = (product.nombre || '').toLowerCase();
          return norm.includes('arroz') || norm.includes('carne') || norm.includes('habichuela') || 
                 norm.includes('chicharrón') || norm.includes('salami') || norm.includes('queso') ||
                 norm.includes('plátano') || norm.includes('guineo') || norm.includes('yuca') ||
                 norm.includes('batata') || norm.includes('yautía') || norm.includes('sal molida') ||
                 norm.includes('por lb') || norm.includes('por rd$') || norm.includes('por unid');
        };

        // Formulario y Perfil del Cliente
        const [savedProfile, setSavedProfile] = useState(() => {
          try {
            const saved = localStorage.getItem('syspim_saved_customer_profile');
            return saved ? JSON.parse(saved) : null;
          } catch (e) {
            return null;
          }
        });

        const [customerName, setCustomerName] = useState(savedProfile?.nombre || '');
        const [customerPhone, setCustomerPhone] = useState(savedProfile?.telefono || '');
        const [customerAddress, setCustomerAddress] = useState(savedProfile?.direccion || '');
        
        // Ubicación Temporal y Edición de Perfil
        const [isEditingProfile, setIsEditingProfile] = useState(!savedProfile);
        const [useAlternateAddress, setUseAlternateAddress] = useState(false);
        const [alternateAddress, setAlternateAddress] = useState('');
        const [saveForFuture, setSaveForFuture] = useState(true);

        const [paymentMethod, setPaymentMethod] = useState('Efectivo');
        const [cashPagarCon, setCashPagarCon] = useState('1000');
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [isCartExpanded, setIsCartExpanded] = useState(false);

        // Obtener Tenant de la URL (?tenant=slug)
        const urlParams = new URLSearchParams(window.location.search);
        const tenantSlug = urlParams.get('tenant') || 'colmado-don-pedro';
        const colmadoNombre = tenantSlug.replace(/-/g, ' ').toUpperCase();

        const [tenantStatus, setTenantStatus] = useState('active');

        useEffect(() => {
          const checkStatus = () => {
            try {
              const statusMap = JSON.parse(localStorage.getItem('syspim_saas_tenants_status') || '{}');
              if (statusMap[tenantSlug] || statusMap['t-001']) {
                setTenantStatus(statusMap[tenantSlug] || statusMap['t-001']);
              }
            } catch(e){}
            const sbClient = (window.ColmadoSupabase && window.ColmadoSupabase.client) || window.supabaseClient;
            if (sbClient) {
              sbClient.from('tenants').select('slug, status').eq('slug', tenantSlug).then(({ data }) => {
                if (data && data.length > 0 && data[0].status) setTenantStatus(data[0].status);
              }).catch(() => {});
            }
          };
          checkStatus();
          const interval = setInterval(checkStatus, 3000);

          let broadcast;
          try {
            broadcast = new BroadcastChannel('syspim_orders_channel');
            broadcast.onmessage = (event) => {
              if (event.data && event.data.type === 'TENANT_STATUS_UPDATE' && (event.data.slug === tenantSlug || event.data.tenantId === tenantSlug)) {
                setTenantStatus(event.data.status);
              }
            };
          } catch(e) {}

          return () => {
            clearInterval(interval);
            try { broadcast?.close(); } catch(e){}
          };
        }, [tenantSlug]);

        const showToast = (msg) => {
          setToastMsg(msg);
          setTimeout(() => setToastMsg(null), 3000);
        };

        const addToCart = (product) => {
          if ((product.stock || 0) <= 0) {
            showToast('⚠️ Producto agotado');
            return;
          }
          if (isBulkItem(product)) {
            setSelectedDetailProduct(product);
            setDetailMontoVal('100');
            setDetailQtyVal('1');
            return;
          }

          setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
              if (existing.qty >= product.stock) {
                showToast(`⚠️ Stock máximo alcanzado (${product.stock} dispon.)`);
                return prev;
              }
              return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
          });
          showToast(`✅ ${product.nombre} agregado`);
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

        const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
        const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.precio * item.qty), 0), [cart]);

        const cashVal = parseFloat(cashPagarCon) || 0;
        const devueltaMonto = (cartTotal > 0 && cashVal > cartTotal) ? cashVal - cartTotal : 0;

        const isCategoryMatch = (prodCategory, catId) => {
          if (!catId || catId === 'todos') return true;
          const pCat = (prodCategory || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const cId = catId.toLowerCase();

          if (cId === 'frutas-vegetales' || cId === 'frutas') {
            return pCat.includes('fruta') || pCat.includes('vegetal') || pCat.includes('fresco') || pCat.includes('manzana') || pCat.includes('ajo') || pCat.includes('pepino') || pCat.includes('ensalada');
          }
          if (cId === 'lacteos') {
            return pCat.includes('lacteo') || pCat.includes('leche') || pCat.includes('queso') || pCat.includes('mozzarella');
          }
          if (cId === 'bebidas') {
            return pCat.includes('bebida') || pCat.includes('refresco') || pCat.includes('jugo') || pCat.includes('coca');
          }
          if (cId === 'dulces') {
            return pCat.includes('dulce') || pCat.includes('caramelo') || pCat.includes('chocolate') || pCat.includes('galleta');
          }
          if (cId === 'higiene') {
            return pCat.includes('higiene') || pCat.includes('salud') || pCat.includes('corporal') || pCat.includes('jabón');
          }
          if (cId === 'panaderia') {
            return pCat.includes('pan') || pCat.includes('panaderia');
          }
          if (cId === 'abarrotes') {
            return pCat.includes('abarrote') || pCat.includes('salsa') || pCat.includes('grano') || pCat.includes('vivere') || pCat.includes('sazon');
          }
          return pCat.includes(cId);
        };

        const filteredProducts = useMemo(() => {
          return products.filter(p => {
            const normSearch = searchQuery.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const normName = (p.nombre || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const matchesSearch = normSearch === '' || normName.includes(normSearch);
            const matchesCat = isCategoryMatch(p.categoria, selectedCategory);
            return matchesSearch && matchesCat;
          });
        }, [products, searchQuery, selectedCategory]);

        // ENVIAR PEDIDO AL COLMADO EN TIEMPO REAL
        const handleSendOrderToColmado = async (e) => {
          e.preventDefault();

          const finalDireccion = useAlternateAddress && alternateAddress.trim() 
            ? `${alternateAddress.trim()} (Ubicación Temporal)`
            : customerAddress;

          if (!customerName || !customerPhone || !finalDireccion) {
            alert('⚠️ Por favor completa tu nombre, teléfono y dirección.');
            return;
          }

          if (cart.length === 0) {
            alert('⚠️ Tu carrito está vacío.');
            return;
          }

          // Re-validación de concurrencia y descuento seguro de inventario
          let currentProducts = products;
          try {
            const latestLocal = localStorage.getItem('syspim_productos_list');
            if (latestLocal) currentProducts = JSON.parse(latestLocal);
          } catch (e) {}

          for (const item of cart) {
            const p = currentProducts.find(prod => prod.id === item.id || (prod.nombre || '').toLowerCase() === (item.nombre || '').toLowerCase());
            if (p && (p.stock || 0) < item.qty) {
              alert(`⚠️ No hay suficiente stock disponible para "${item.nombre}". Stock actual: ${p.stock || 0}`);
              return;
            }
          }

          // Descontar existencias
          const updatedProducts = currentProducts.map(prod => {
            const cartItem = cart.find(i => i.id === prod.id || (i.nombre || '').toLowerCase().trim() === (prod.nombre || '').toLowerCase().trim());
            if (cartItem) {
              const newStock = Math.max(0, (prod.stock || 0) - cartItem.qty);
              return { ...prod, stock: newStock, tenant_id: prod.tenant_id || 't-001' };
            }
            return { ...prod, tenant_id: prod.tenant_id || 't-001' };
          });

          // Actualizar estado local, localStorage y difundir evento de stock por BroadcastChannel
          setProducts(updatedProducts);
          try {
            localStorage.setItem('syspim_productos_list', JSON.stringify(updatedProducts));
          } catch (e) {}

          try {
            const bc = new BroadcastChannel('syspim_orders_channel');
            bc.postMessage({ type: 'STOCK_UPDATE', payload: updatedProducts });
            bc.close();
          } catch (e) {}

          // Guardar perfil para futuros pedidos si se marcó la casilla
          if (saveForFuture) {
            const profileToSave = {
              nombre: customerName,
              telefono: customerPhone,
              direccion: customerAddress
            };
            localStorage.setItem('syspim_saved_customer_profile', JSON.stringify(profileToSave));
            setSavedProfile(profileToSave);
            setIsEditingProfile(false);
          }

          setIsSubmitting(true);

          try {
            const pagoDetalle = paymentMethod === 'Efectivo' 
              ? (devueltaMonto > 0 
                  ? `Efectivo (Paga con RD$ ${cashVal.toFixed(2)} - Devuelta: RD$ ${devueltaMonto.toFixed(2)})`
                  : `Efectivo (Monto Exacto RD$ ${cartTotal.toFixed(2)})`)
              : paymentMethod;

            const generatedUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
              ? crypto.randomUUID() 
              : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                  const r = Math.random() * 16 | 0;
                  return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });

            const uniquePedId = 'PED-' + String(Date.now()).slice(-5) + Math.floor(10 + Math.random() * 90);

            const cleanPayment = paymentMethod.toLowerCase().includes('tarjeta') ? 'tarjeta' : (paymentMethod.toLowerCase().includes('fiado') ? 'fiado' : 'efectivo');

            const isEfectivo = cleanPayment === 'efectivo' || paymentMethod === 'Efectivo';
            const pagoConAmount = isEfectivo ? (cashVal > 0 ? cashVal : cartTotal) : cartTotal;
            const devueltaAmount = isEfectivo ? devueltaMonto : 0;

            // Payload para la base de datos Supabase Cloud (Formato de tabla validado 100%)
            const dbPayload = {
              id: generatedUuid,
              tenant_id: '00000000-0000-0000-0000-000000000001',
              cliente_nombre: customerName,
              cliente_telefono: customerPhone,
              direccion_entrega: finalDireccion,
              delivery_token: 'DEL-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
              monto_total: cartTotal,
              monto_pagado_con: pagoConAmount,
              devuelta_cliente: devueltaAmount,
              metodo_pago: cleanPayment,
              estado: 'pendiente',
              created_at: new Date().toISOString()
            };

            // Payload rico para la interfaz local y cross-tab
            const orderPayload = {
              ...dbPayload,
              id: uniquePedId,
              ped_id: uniquePedId,
              uuid: generatedUuid,
              monto_pagado_con: pagoConAmount,
              devuelta_cliente: devueltaAmount,
              metodo_pago: pagoDetalle,
              detalles: cart.map(i => ({ cantidad: i.qty, nombre: i.nombre, precio_unitario: i.precio }))
            };

            // Transmitir orden internamente vía BroadcastChannel
            try {
              const broadcast = new BroadcastChannel('syspim_orders_channel');
              broadcast.postMessage({ type: 'NEW_ORDER', order: orderPayload });
              broadcast.close();
            } catch (e) {
              console.log('Broadcast error:', e);
            }

            // Guardar en localStorage para desencadenar el evento de almacenamiento cruzado
            localStorage.setItem('syspim_last_order', JSON.stringify({ ...orderPayload, timestamp: Date.now() }));
            
            // Actualizar lista principal de pedidos pos/delivery en localStorage
            try {
              const currentPosOrders = JSON.parse(localStorage.getItem('syspim_pos_pedidos') || '[]');
              if (!currentPosOrders.some(p => p.id === orderPayload.id || (p.uuid && p.uuid === orderPayload.uuid))) {
                const updatedPos = [orderPayload, ...currentPosOrders];
                localStorage.setItem('syspim_pos_pedidos', JSON.stringify(updatedPos));
                localStorage.setItem('syspim_delivery_trips', JSON.stringify(updatedPos));
              }
            } catch(e) {}

            try {
              const queue = JSON.parse(localStorage.getItem('syspim_pending_orders_queue') || '[]');
              if (!queue.some(q => q.id === orderPayload.id)) {
                queue.unshift(orderPayload);
                localStorage.setItem('syspim_pending_orders_queue', JSON.stringify(queue));
              }
            } catch(e){}

            // Guardar en Supabase Realtime si está conectado (con dbPayload validado)
            const sbClient = (window.ColmadoSupabase && window.ColmadoSupabase.client) || window.supabaseClient;
            if (sbClient) {
              try {
                const res = await sbClient.from('pedidos').insert([dbPayload]);
                if (res.error) console.warn('Supabase pedidos insert error:', res.error);
                else console.log('✅ ¡Pedido guardado exitosamente en Supabase Cloud!');
              } catch(e) {
                console.log('Supabase insert error pedidos:', e);
              }
            }

            // También guardar en memoria local global para simulación inmediata
            if (window.AppState) {
              window.AppState.pedidos = window.AppState.pedidos || [];
              window.AppState.pedidos.unshift(orderPayload);
            }

            setShowOrderModal(false);
            setCart([]);
            showToast(`🎉 ¡Pedido ${orderPayload.id} enviado al colmado!`);
            alert(`🎉 ¡Tu pedido ${orderPayload.id} ha sido enviado internamente al colmado!\n\n🔑 Token de Delivery: ${orderPayload.delivery_token}\n\nEl colmado ha recibido la orden en su pantalla de caja y el repartidor está preparando la entrega.`);
          } catch (err) {
            console.error('Error sending order:', err);
            alert('Pedido registrado para el colmado.');
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            
            {/* OVERLAY DE TENANT SUSPENDIDO EN CATÁLOGO PWA */}
            {tenantStatus === 'suspended' && (
              <div className="fixed inset-0 z-50 bg-[#060B14]/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
                <div className="bg-[#111827] border border-[#EF4444]/40 max-w-sm w-full p-6 rounded-[24px] shadow-2xl space-y-4 text-white">
                  <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-3xl flex items-center justify-center mx-auto">
                    🚫
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-jakarta">Colmado Temporalmente Inactivo</h2>
                    <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed font-medium">
                      Este colmado no se encuentra recibiendo pedidos a domicilio en este momento. Por favor intenta más tarde.
                    </p>
                  </div>
                  <div className="bg-[#182235] p-3 rounded-xl text-xs font-mono text-[#94A3B8]">
                    /{tenantSlug} • Estado: Suspendido
                  </div>
                </div>
              </div>
            )}

            {/* TOAST FLOATER */}
            {toastMsg && (
              <div className="fixed top-4 right-4 z-50 bg-[#0F172A] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg animate-fade-in-up flex items-center gap-2">
                <span>✨</span> {toastMsg}
              </div>
            )}

            {/* HEADER ADHESIVO PERMANENTE EN MÓVIL Y DESKTOP (STICKY TOP-0 Z-40) */}
            <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white shadow-lg border-b border-[#0369A1]">
              <div className="max-w-4xl mx-auto px-4 pt-3 pb-3 space-y-2.5">
                
                {/* FILA 1: LOGO, MARCA Y DIRECCIÓN DE ENVÍO */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-extrabold text-base border border-white/30 flex-shrink-0">
                      🛵
                    </div>
                    <div className="truncate">
                      <h1 className="font-extrabold text-sm sm:text-base tracking-tight leading-none truncate">
                        Delivery<span className="text-[#38BDF8]">GO</span> • {colmadoNombre}
                      </h1>
                      <span className="text-[10px] opacity-90 font-medium">Pedidos directos a domicilio</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button 
                      onClick={() => {
                        setIsEditingProfile(true);
                        setShowOrderModal(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white text-xs px-2.5 py-1.5 rounded-full backdrop-blur-md transition-all border border-white/25 flex items-center gap-1 font-bold"
                      title="Configurar ubicación de envío"
                    >
                      <span>📍</span>
                      <span className="truncate max-w-[90px] sm:max-w-[150px] text-[11px]">
                        {customerAddress ? customerAddress.split(',')[0] : 'Ubicación'}
                      </span>
                      <span className="text-[9px]">▾</span>
                    </button>
                  </div>
                </div>

                {/* FILA 2: BARRA DE BÚSQUEDA REDONDEADA BLANCA (PERMANENTEMENTE FIJA EN PANTALLA) */}
                <div className="bg-white border border-[#E2E8F0] p-2 px-3.5 rounded-full shadow-md flex items-center gap-2.5 text-xs sm:text-sm">
                  <span className="text-base text-[#0284C7] flex-shrink-0">🔍</span>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar 'leche', 'pan', 'coca-cola', 'huevos'..."
                    className="bg-transparent w-full text-[#0F172A] font-extrabold placeholder-[#94A3B8] focus:outline-none text-xs sm:text-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-xs text-[#94A3B8] hover:text-[#EF4444] font-bold px-1">✕</button>
                  )}
                </div>

              </div>

              {/* FILA 3: PESTAÑAS ADHESIVAS DE CATEGORÍAS */}
              <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 py-2">
                <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {CATEGORIAS.map(cat => {
                    const isActive = selectedCategory === cat.id;
                    const count = cat.id === 'todos' 
                      ? products.length 
                      : products.filter(p => isCategoryMatch(p.categoria, cat.id)).length;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all border ${
                          isActive
                            ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm font-extrabold scale-105'
                            : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                        }`}
                      >
                        <span className="text-sm">{cat.icon}</span>
                        <span>{cat.nombre}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-mono ${isActive ? 'bg-white/25 text-white' : 'bg-[#E2E8F0] text-[#64748B]'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </header>

            {/* CONTENIDO PRINCIPAL DEL CATÁLOGO */}
            <main className="max-w-4xl mx-auto w-full px-4 py-5 flex-1 space-y-6 pb-40">

              {/* SECCIONES DE CARRUSELES HORIZONTALES POR CATEGORÍA (ESTILO INSTACART / BRAVO APP) */}
              <div className="space-y-7">
                {(() => {
                  // Determinar las secciones a mostrar
                  let sectionsToShow = CATEGORIAS.filter(c => c.id !== 'todos');
                  if (selectedCategory !== 'todos') {
                    sectionsToShow = CATEGORIAS.filter(c => c.id === selectedCategory);
                  }

                  if (searchQuery.trim().length > 0) {
                    // Si el usuario está buscando, mostrar grilla filtrada
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-sm text-[#0F172A]">
                            🔍 Resultados para "{searchQuery}" ({filteredProducts.length})
                          </h3>
                        </div>

                        {filteredProducts.length === 0 ? (
                          <div className="bg-white border border-dashed border-[#E2E8F0] p-8 rounded-2xl text-center space-y-2">
                            <span className="text-3xl block">🥦</span>
                            <p className="font-bold text-xs text-[#0F172A]">No se encontraron productos coincidentes</p>
                            <p className="text-[11px] text-[#64748B]">Intente buscar por otro nombre como 'leche', 'pan' o 'jugo'.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                            {filteredProducts.map(product => {
                              const pricePrev = product.precioAnterior;
                              const itemInCart = cart.find(i => i.id === product.id);

                              return (
                                <div 
                                  key={product.id}
                                  className="bg-white border border-[#E2E8F0] p-3 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:shadow-md hover:border-[#BAE6FD] relative group"
                                >
                                  <div className="w-full h-28 bg-[#F8FAFC] rounded-xl overflow-hidden mb-2 flex items-center justify-center p-2 border border-[#F1F5F9]">
                                    <img src={product.imagen} alt={product.nombre} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                                  </div>

                                  <div>
                                    <h4 className="font-extrabold text-xs text-[#0F172A] line-clamp-2 leading-snug h-8">{product.nombre}</h4>
                                    <span className="text-[9.5px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md inline-block mt-1">{product.categoria}</span>
                                  </div>

                                  <div className="flex items-end justify-between pt-2 mt-2 border-t border-[#F1F5F9]">
                                    <div>
                                      <span className="font-extrabold text-sm text-[#0284C7] block font-mono-tabular">RD$ {product.precio}</span>
                                      {pricePrev && <span className="text-[10px] text-[#EF4444] line-through font-normal">RD$ {pricePrev}</span>}
                                    </div>

                                    <button 
                                      onClick={() => addToCart(product)}
                                      className="w-8 h-8 rounded-full bg-[#0284C7] hover:bg-[#0369A1] shadow-md shadow-[#0284C7]/20 flex items-center justify-center text-white font-bold text-base hover:scale-110 active:scale-95 transition-all relative flex-shrink-0"
                                    >
                                      +
                                      {itemInCart && (
                                        <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                          {itemInCart.qty}
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Renderizado por Secciones de Carruseles Horizontales
                  return sectionsToShow.map(cat => {
                    const categoryProducts = products.filter(p => isCategoryMatch(p.categoria, cat.id));
                    if (categoryProducts.length === 0) return null;

                    return (
                      <section key={cat.id} className="space-y-3 animate-fade-in-up">
                        
                        {/* ENCABEZADO DE SECCIÓN: TÍTULO Y BOTÓN "VER TODOS" */}
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#0F172A] flex items-center gap-2 font-jakarta">
                            <span className="text-lg">{cat.icon}</span>
                            <span>{cat.nombre}</span>
                            <span className="text-xs text-[#64748B] font-mono font-normal">({categoryProducts.length})</span>
                          </h3>

                          {selectedCategory === 'todos' && (
                            <button
                              onClick={() => setSelectedCategory(cat.id)}
                              className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1 hover:underline"
                            >
                              <span>Ver todos</span>
                              <span className="text-[10px]">→</span>
                            </button>
                          )}
                        </div>

                        {/* LISTADO EN CARRUSEL HORIZONTAL CON SCROLL SWIPEABLE (SNAP-X MANDATORY) */}
                        <div className="flex gap-3.5 overflow-x-auto scroll-snap-x mandatory scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:-mx-8 sm:px-8">
                          {categoryProducts.map(product => {
                            const pricePrev = product.precioAnterior;
                            const itemInCart = cart.find(i => i.id === product.id);

                            return (
                              <div 
                                key={product.id}
                                className="w-[145px] sm:w-[170px] flex-shrink-0 scroll-snap-align-start bg-white border border-[#E2E8F0] p-3 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:shadow-md hover:border-[#BAE6FD] relative group select-none"
                              >
                                {/* CONTENEDOR DE IMAGEN ASPECTO 1:1 CON OBJECT-CONTAIN */}
                                <div className="w-full h-28 sm:h-32 bg-[#F8FAFC] rounded-xl overflow-hidden mb-2 flex items-center justify-center p-2 border border-[#F1F5F9]">
                                  <img src={product.imagen} alt={product.nombre} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                                </div>

                                {/* TÍTULO Y DETALLES */}
                                <div>
                                  <h4 className="font-extrabold text-xs text-[#0F172A] line-clamp-2 leading-snug h-8 font-jakarta">
                                    {product.nombre}
                                  </h4>
                                </div>

                                {/* PRECIO Y BOTÓN FLOTANTE (+) ACCIÓN RÁPIDA */}
                                <div className="flex items-end justify-between pt-2 mt-2 border-t border-[#F1F5F9]">
                                  <div>
                                    <span className="font-extrabold text-sm sm:text-base text-[#0284C7] block font-mono-tabular">
                                      RD$ {product.precio}
                                    </span>
                                    {pricePrev && (
                                      <span className="text-[10px] text-[#EF4444] line-through font-normal block -mt-0.5">
                                        RD$ {pricePrev}
                                      </span>
                                    )}
                                  </div>

                                  <button 
                                    onClick={() => addToCart(product)}
                                    className="w-8 h-8 rounded-full bg-[#0284C7] hover:bg-[#0369A1] shadow-md shadow-[#0284C7]/20 flex items-center justify-center text-white font-bold text-base hover:scale-110 active:scale-95 transition-all relative flex-shrink-0"
                                    title="Agregar al carrito"
                                  >
                                    +
                                    {itemInCart && (
                                      <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                        {itemInCart.qty}
                                      </span>
                                    )}
                                  </button>
                                </div>

                              </div>
                            );
                          })}
                        </div>

                      </section>
                    );
                  });
                })()}
              </div>

            </main>

            {/* CARRITO FLOTANTE INFERIOR CON PRODUCTOS SELECCIONADOS (EXPANDIBLE & DESPLEGABLE) */}
            {cartCount > 0 && (
              <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#E2E8F0] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-40 rounded-t-[24px] animate-fade-in-up">
                <div className="max-w-4xl mx-auto p-4 space-y-3">
                  
                  {/* CABECERA INTERACTIVA DEL CARRITO DESPLEGABLE */}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setIsCartExpanded(!isCartExpanded)}
                      className="flex items-center gap-2 text-xs font-extrabold text-[#0F172A] hover:text-[#0284C7] transition-colors"
                    >
                      <span className="bg-[#E0F2FE] text-[#0284C7] px-2.5 py-1 rounded-full text-xs font-bold">
                        🛒 {cartCount} {cartCount === 1 ? 'producto' : 'productos'}
                      </span>
                      <span>{isCartExpanded ? '▼ Ocultar Lista' : '▲ Ver Productos Guardados'}</span>
                    </button>

                    <div className="text-right">
                      <span className="text-[10px] text-[#64748B] font-bold block uppercase">SUBTOTAL:</span>
                      <span className="font-extrabold text-base text-[#0284C7] font-mono-tabular">RD$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* LISTA DESPLEGABLE DE PRODUCTOS SELECCIONADOS */}
                  {isCartExpanded && (
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3 max-h-56 overflow-y-auto space-y-2 text-xs custom-scrollbar animate-fade-in-up">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] text-[10.5px] font-bold text-[#64748B] uppercase">
                        <span>Items Seleccionados ({cart.length})</span>
                        <button onClick={() => setCart([])} className="text-[#EF4444] hover:underline">🗑️ Vaciar Carrito</button>
                      </div>

                      {cart.map(item => (
                        <div key={item.id} className="bg-white border border-[#E2E8F0] p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-extrabold text-xs text-[#0F172A] truncate">{item.nombre}</h5>
                            <span className="text-[10.5px] text-[#64748B] font-mono">RD$ {item.precio.toFixed(2)} c/u</span>
                          </div>

                          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1">
                            <button onClick={() => updateCartQty(item.id, -1)} className="w-5 h-5 rounded bg-white text-[#0F172A] font-bold border border-[#CBD5E1] hover:bg-[#EF4444] hover:text-white">-</button>
                            <span className="font-mono font-extrabold text-xs px-1">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} className="w-5 h-5 rounded bg-white text-[#0F172A] font-bold border border-[#CBD5E1] hover:bg-[#0284C7] hover:text-white">+</button>
                          </div>

                          <span className="font-extrabold text-xs text-[#0284C7] font-mono-tabular min-w-[65px] text-right">
                            RD$ {(item.precio * item.qty).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* BOTÓN PRINCIPAL FINALIZAR PEDIDO A DOMICILIO */}
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="w-full py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#0284C7]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <span>📲 Solicitar Pedido a Domicilio</span>
                    <span>→</span>
                  </button>

                </div>
              </div>
            )}

            {/* MODAL DE CONFIRMACIÓN Y ENVÍO DE PEDIDO (CORREGIDO PARA CUALQUIER PANTALLA) */}
            {showOrderModal && (
              <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <div className="bg-white max-w-md w-full my-auto rounded-[24px] shadow-2xl border border-[#E2E8F0] flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
                  
                  {/* HEADER PEGAJOSO DEL MODAL */}
                  <div className="p-4 sm:p-5 border-b border-[#F1F5F9] flex items-center justify-between bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🛒</span>
                      <h3 className="font-extrabold text-base text-[#0F172A]">Solicitar Pedido a Domicilio</h3>
                    </div>
                    <button onClick={() => setShowOrderModal(false)} className="w-8 h-8 rounded-full bg-[#F1F5F9] text-gray-500 hover:text-gray-900 font-bold text-sm flex items-center justify-center">✕</button>
                  </div>

                  {/* CUERPO DEL MODAL CON SCROLL INTERNO INDEPENDIENTE */}
                  <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                    
                    {/* RESUMEN DE COMPRA */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl max-h-32 overflow-y-auto space-y-2 text-xs">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="font-bold text-[#0F172A]">{item.qty}x {item.nombre}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#64748B]">RD$ {(item.precio * item.qty).toFixed(2)}</span>
                            <button onClick={() => updateCartQty(item.id, -1)} className="text-[#EF4444] font-bold">✕</button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-[#E2E8F0] flex justify-between font-extrabold text-sm text-[#0284C7]">
                        <span>TOTAL:</span>
                        <span>RD$ {cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* FORMULARIO DE DATOS DEL CLIENTE CON PERSISTENCIA Y CAMBIO DE UBICACIÓN */}
                    <form id="orderForm" onSubmit={handleSendOrderToColmado} className="space-y-3">
                      
                      {savedProfile && !isEditingProfile ? (
                        /* TARJETA DE PERFIL GUARDADO (CONFIGURADO UNA SOLA VEZ) */
                        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl space-y-2 text-xs animate-fade-in-up">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[#0F172A] text-sm">👤 {customerName}</span>
                            <button 
                              type="button" 
                              onClick={() => setIsEditingProfile(true)}
                              className="text-[11px] font-bold text-[#0284C7] hover:underline"
                            >
                              ✏️ Editar Mis Datos
                            </button>
                          </div>
                          <p className="text-[#64748B] font-mono text-[11px]">📞 {customerPhone}</p>

                          <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
                            <span className="text-[10px] font-bold uppercase text-[#64748B] block">Dirección de Entrega:</span>
                            <p className="font-bold text-[#0F172A]">
                              📍 {useAlternateAddress && alternateAddress.trim() ? alternateAddress : customerAddress}
                              {useAlternateAddress && <span className="text-[10px] text-[#0284C7] ml-1 font-semibold">(Ubicación Temporal)</span>}
                            </p>
                          </div>

                          {/* BOTÓN TOGGLE PARA CAMBIAR UBICACIÓN TEMPORAL (POR SI ESTÁ EN OTRO LUGAR HOBITUAL) */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setUseAlternateAddress(!useAlternateAddress)}
                              className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] hover:bg-[#BAE6FD] transition-all flex items-center justify-center gap-1"
                            >
                              <span>📍</span>
                              <span>{useAlternateAddress ? 'Usar Mi Dirección Habitual' : 'Cambiar Ubicación para Este Pedido'}</span>
                            </button>
                          </div>

                          {/* INPUT PARA DIRECCIÓN TEMPORAL */}
                          {useAlternateAddress && (
                            <div className="pt-1 animate-fade-in-up">
                              <label className="block text-[10px] font-bold uppercase text-[#0369A1] mb-1">Escribe la ubicación actual / temporal *</label>
                              <input 
                                type="text"
                                required={useAlternateAddress}
                                placeholder="Ej: Oficina Nivel 3 / Casa de un amigo"
                                value={alternateAddress}
                                onChange={(e) => setAlternateAddress(e.target.value)}
                                className="w-full bg-white border border-[#BAE6FD] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A]"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        /* FORMULARIO INICIAL DE CONFIGURACIÓN DE DATOS (SOLO SE HACE UNA VEZ) */
                        <div className="space-y-3 bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7]">Configura tus datos de entrega</span>
                            {savedProfile && (
                              <button type="button" onClick={() => setIsEditingProfile(false)} className="text-[10px] font-bold text-[#64748B]">Cancelar</button>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#64748B] mb-1">Tu Nombre Completo *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Ej: Juan Pérez"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#0F172A]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#64748B] mb-1">Teléfono WhatsApp *</label>
                            <input 
                              type="tel" 
                              required
                              placeholder="Ej: 8095550100"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#0F172A]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#64748B] mb-1">Dirección de Entrega Habitual *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Ej: Calle 16 de Agosto #45, Apt 2B"
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#0F172A]"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <input 
                              type="checkbox"
                              id="saveProfileCheck"
                              checked={saveForFuture}
                              onChange={(e) => setSaveForFuture(e.target.checked)}
                              className="rounded accent-[#0284C7]"
                            />
                            <label htmlFor="saveProfileCheck" className="text-[11px] font-bold text-[#0F172A]">
                              💾 Guardar mis datos para no ingresarlos en el próximo pedido
                            </label>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1">Forma de Pago</label>
                        <select 
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-[#0F172A]"
                        >
                          <option value="Efectivo">💵 Efectivo a la entrega</option>
                          <option value="Tarjeta">💳 Tarjeta (POS Móvil)</option>
                          <option value="Transferencia">📲 Transferencia Banco / QIK</option>
                        </select>
                      </div>

                      {/* CAMPO DE DEVUELTA EN EFECTIVO (PARA EL REPARTIDOR) */}
                      {paymentMethod === 'Efectivo' && (
                        <div className="bg-[#E0F2FE]/50 border border-[#BAE6FD] p-3 rounded-2xl space-y-2 animate-fade-in-up">
                          <label className="block text-[11px] font-bold text-[#0369A1]">
                            💵 ¿Con cuánto vas a pagar? (Devuelta para el delivery)
                          </label>
                          <input 
                            type="number"
                            value={cashPagarCon}
                            onChange={(e) => setCashPagarCon(e.target.value)}
                            placeholder="Ej: 1000"
                            className="w-full bg-white border border-[#BAE6FD] rounded-xl px-3.5 py-2 text-xs font-bold text-[#0F172A]"
                          />

                          {/* ATACADAS RÁPIDAS DE BILLETES */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {[500, 1000, 2000].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setCashPagarCon(val.toString())}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                                  cashVal === val ? 'bg-[#0284C7] text-white border-[#0284C7]' : 'bg-white text-[#0369A1] border-[#BAE6FD]'
                                }`}
                              >
                                RD$ {val}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setCashPagarCon(cartTotal.toString())}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                                cashVal === cartTotal ? 'bg-[#0284C7] text-white border-[#0284C7]' : 'bg-white text-[#0369A1] border-[#BAE6FD]'
                              }`}
                            >
                              Monto Exacto
                            </button>
                          </div>

                          {/* INFORMACIÓN CALCULADA DE DEVUELTA */}
                          <div className="text-[11px] font-bold text-[#0369A1] pt-1">
                            {cartTotal > 0 && devueltaMonto > 0 ? (
                              <span>💡 El delivery debe llevar <strong className="text-[#15803D]">RD$ {devueltaMonto.toFixed(2)}</strong> de devuelta.</span>
                            ) : cartTotal > 0 && (cashVal === cartTotal || cashVal === 0) ? (
                              <span className="text-[#15803D]">✨ Pagarás con el monto exacto (sin devuelta).</span>
                            ) : cartTotal > 0 && cashVal > 0 && cashVal < cartTotal ? (
                              <span className="text-[#B91C1C]">⚠️ El billete ingresado (RD$ {cashVal}) es menor que el total (RD$ {cartTotal.toFixed(2)}).</span>
                            ) : (
                              <span className="text-[#64748B]">Agrega productos a tu carrito para calcular la devuelta.</span>
                            )}
                          </div>
                        </div>
                      )}
                    </form>

                  </div>

                  {/* PIE DE PÁGINA PEGAJOSO CON BOTÓN PRINCIPAL SIEMPRE VISIBLE */}
                  <div className="p-4 border-t border-[#F1F5F9] bg-white sticky bottom-0 z-20 shadow-lg">
                    <button
                      type="submit"
                      form="orderForm"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#0284C7]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <span>🚀 Enviar Pedido al Colmado</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* MODAL DE PEDIDO AL DETALLE / VENTA POR LIBRAS O MONTO RD$ */}
            {selectedDetailProduct && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
                <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                  
                  {/* Header Modal */}
                  <div className="bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 p-1 flex items-center justify-center border border-white/30 flex-shrink-0">
                        <img src={selectedDetailProduct.imagen} alt="" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base leading-tight">{selectedDetailProduct.nombre}</h3>
                        <span className="text-xs text-[#E0F2FE] font-medium">
                          Precio Base: <strong className="font-mono text-white">RD$ {selectedDetailProduct.precio}</strong> / {selectedDetailProduct.unidad_medida || 'lb'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedDetailProduct(null)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-4 space-y-4 overflow-y-auto">
                    
                    {/* Selector de Modo: Por Monto (RD$) o Por Libras/Cantidad */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setDetailMode('monto')}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                          detailMode === 'monto'
                            ? 'bg-white text-[#0284C7] shadow-md scale-102'
                            : 'text-[#64748B] hover:text-[#0F172A]'
                        }`}
                      >
                        <span>💵</span> Por Monto (RD$)
                      </button>

                      <button
                        type="button"
                        onClick={() => setDetailMode('libras')}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                          detailMode === 'libras'
                            ? 'bg-white text-[#0284C7] shadow-md scale-102'
                            : 'text-[#64748B] hover:text-[#0F172A]'
                        }`}
                      >
                        <span>⚖️</span> Por {selectedDetailProduct.unidad_medida === 'unid' ? 'Unidades' : 'Libras'}
                      </button>
                    </div>

                    {/* MODO A: POR MONTO EN PESOS (RD$) */}
                    {detailMode === 'monto' && (
                      <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                        <label className="text-xs font-extrabold text-[#0F172A] block">
                          ¿Cuánto desea pedir en Pesos (RD$)?
                        </label>

                        {/* Botones de Monto Rápido */}
                        <div className="grid grid-cols-4 gap-2">
                          {['50', '100', '200', '500'].map(monto => (
                            <button
                              key={monto}
                              type="button"
                              onClick={() => setDetailMontoVal(monto)}
                              className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                                detailMontoVal === monto
                                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                                  : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#E0F2FE]'
                              }`}
                            >
                              RD$ {monto}
                            </button>
                          ))}
                        </div>

                        {/* Input Libre de Monto */}
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-xs font-bold text-[#64748B]">RD$</span>
                          <input
                            type="number"
                            min="10"
                            step="5"
                            value={detailMontoVal}
                            onChange={(e) => setDetailMontoVal(e.target.value)}
                            placeholder="Ej. 150"
                            className="w-full pl-12 pr-4 py-2.5 bg-white border-2 border-[#0284C7] rounded-xl font-extrabold text-base text-[#0F172A] focus:outline-none"
                          />
                        </div>

                        {/* Cálculo estimado equivalente */}
                        {parseFloat(detailMontoVal) > 0 && (
                          <div className="bg-[#E0F2FE] p-2.5 rounded-xl text-xs text-[#0369A1] font-bold flex items-center justify-between">
                            <span>Equivalente aproximado:</span>
                            <span className="font-mono text-sm font-extrabold">
                              ~{(parseFloat(detailMontoVal) / selectedDetailProduct.precio).toFixed(2)} {selectedDetailProduct.unidad_medida || 'lbs'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MODO B: POR LIBRAS O UNIDADES */}
                    {detailMode === 'libras' && (
                      <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                        <label className="text-xs font-extrabold text-[#0F172A] block">
                          Cantidad en {selectedDetailProduct.unidad_medida === 'unid' ? 'Unidades sueltas' : 'Libras (Lbs)'}:
                        </label>

                        {/* Botones de Cantidad Rápida */}
                        <div className="grid grid-cols-4 gap-2">
                          {(selectedDetailProduct.unidad_medida === 'unid' 
                            ? ['5', '10', '20', '50']
                            : ['0.5', '1', '2', '5']
                          ).map(qty => (
                            <button
                              key={qty}
                              type="button"
                              onClick={() => setDetailQtyVal(qty)}
                              className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                                detailQtyVal === qty
                                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                                  : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#E0F2FE]'
                              }`}
                            >
                              {qty} {selectedDetailProduct.unidad_medida === 'unid' ? 'Unid' : (qty === '0.5' ? '1/2 Lb' : 'Lbs')}
                            </button>
                          ))}
                        </div>

                        {/* Input Libre de Cantidad */}
                        <div className="relative">
                          <input
                            type="number"
                            min="0.25"
                            step="0.25"
                            value={detailQtyVal}
                            onChange={(e) => setDetailQtyVal(e.target.value)}
                            placeholder="Ej. 1.5"
                            className="w-full px-4 py-2.5 bg-white border-2 border-[#0284C7] rounded-xl font-extrabold text-base text-[#0F172A] focus:outline-none"
                          />
                          <span className="absolute right-3.5 top-3 text-xs font-bold text-[#64748B]">
                            {selectedDetailProduct.unidad_medida === 'unid' ? 'Unidades' : 'Libras'}
                          </span>
                        </div>

                        {/* Total Calculado en RD$ */}
                        {parseFloat(detailQtyVal) > 0 && (
                          <div className="bg-[#DCFCE7] p-2.5 rounded-xl text-xs text-[#15803D] font-bold flex items-center justify-between">
                            <span>Total Calculado:</span>
                            <span className="font-mono text-sm font-extrabold">
                              RD$ {(parseFloat(detailQtyVal) * selectedDetailProduct.precio).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botón de Agregar al Carrito */}
                    <button
                      type="button"
                      onClick={() => {
                        const isMonto = detailMode === 'monto';
                        const valMonto = parseFloat(detailMontoVal) || 0;
                        const valQty = parseFloat(detailQtyVal) || 0;

                        if (isMonto && valMonto <= 0) return alert('Por favor ingrese un monto válido en RD$');
                        if (!isMonto && valQty <= 0) return alert('Por favor ingrese una cantidad válida');

                        const itemPrice = isMonto ? valMonto : parseFloat((valQty * selectedDetailProduct.precio).toFixed(2));
                        const calculatedLbs = isMonto ? (valMonto / selectedDetailProduct.precio).toFixed(2) : valQty;

                        const customName = isMonto
                          ? `${selectedDetailProduct.nombre} (RD$ ${valMonto} = ~${calculatedLbs} ${selectedDetailProduct.unidad_medida || 'lbs'})`
                          : `${selectedDetailProduct.nombre} (${valQty} ${selectedDetailProduct.unidad_medida === 'unid' ? 'unid' : 'lbs'} x RD$ ${selectedDetailProduct.precio})`;

                        const cartItem = {
                          id: `${selectedDetailProduct.id}_${isMonto ? 'monto_' + valMonto : 'qty_' + valQty}`,
                          nombre: customName,
                          precio: itemPrice,
                          originalId: selectedDetailProduct.id,
                          imagen: selectedDetailProduct.imagen,
                          categoria: selectedDetailProduct.categoria,
                          qty: 1
                        };

                        setCart(prev => [...prev, cartItem]);
                        setSelectedDetailProduct(null);
                        showToast(`✅ ${customName} agregado al carrito`);
                      }}
                      className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 active:scale-98"
                    >
                      <span>🛒</span> Agregar al Carrito (RD$ {
                        detailMode === 'monto' 
                          ? (parseFloat(detailMontoVal) || 0).toFixed(2) 
                          : ((parseFloat(detailQtyVal) || 0) * selectedDetailProduct.precio).toFixed(2)
                      })
                    </button>

                  </div>
                </div>
              </div>
            )}

          </div>
        );
      }

      ReactDOM.createRoot(document.getElementById('catalog-app-root')).render(<StandaloneCustomerCatalog />);
    