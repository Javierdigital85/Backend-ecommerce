import mongoose from "mongoose";
import ProductModel from "../models/ProductModel";
import CartModel from "../models/CartModel";
import dotenv from "dotenv";

dotenv.config();

const products = [
  {
    name: "Laptop Dell XPS 13",
    description:
      "Laptop ultradelgada con procesador Intel Core i7, 16GB RAM, 512GB SSD, pantalla Full HD de 13.3 pulgadas. Perfecta para profesionales y estudiantes.",
    price: 1299.99,
    stock: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
  },
  {
    name: "iPhone 15 Pro",
    description:
      "Smartphone Apple con chip A17 Pro, cámara triple de 48MP, pantalla Super Retina XDR de 6.1 pulgadas, 256GB de almacenamiento. Diseño en titanio.",
    price: 999.0,
    stock: 30,
    imageUrl:
      "https://www.imagineonline.store/cdn/shop/files/iPhone_15_Pro_Black_Titanium_PDP_Image_Position-1__en-IN_955a5f8b-9006-4919-92f4-ddfa2ebec8f6.jpg?v=1759733982",
  },
  {
    name: "Sony WH-1000XM5",
    description:
      "Auriculares inalámbricos con cancelación de ruido líder en la industria, audio Hi-Res, hasta 30 horas de batería. Comodidad premium.",
    price: 399.99,
    stock: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
  },
  {
    name: 'Samsung 4K Smart TV 55"',
    description:
      "Televisor LED 4K UHD de 55 pulgadas con tecnología Quantum Dot, HDR10+, Smart TV con apps integradas, diseño ultra delgado.",
    price: 749.99,
    stock: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80",
  },
  {
    name: "iPad Air M2",
    description:
      "Tablet Apple con chip M2, pantalla Liquid Retina de 10.9 pulgadas, 128GB, compatible con Apple Pencil y Magic Keyboard.",
    price: 599.0,
    stock: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80",
  },
  {
    name: "Canon EOS R6",
    description:
      "Cámara mirrorless full-frame de 20.1MP, video 4K, estabilización de imagen de 5 ejes, sistema de enfoque automático dual pixel.",
    price: 2499.0,
    stock: 8,
    imageUrl:
      "https://2.img-dpreview.com/files/p/E~TC4x3S590x0~articles/1548544834/body/Canon-EOS-R6-lead-01.jpeg",
  },
  {
    name: "Nintendo Switch OLED",
    description:
      "Consola de videojuegos híbrida con pantalla OLED de 7 pulgadas, 64GB de almacenamiento interno, controles Joy-Con incluidos.",
    price: 349.99,
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&q=80",
  },
  {
    name: "Apple Watch Series 9",
    description:
      "Smartwatch con pantalla Always-On Retina, GPS + Cellular, monitoreo de salud avanzado, resistente al agua. Caja de aluminio de 45mm.",
    price: 429.0,
    stock: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&q=80",
  },
  {
    name: "Bose SoundLink Revolve+",
    description:
      "Altavoz Bluetooth portátil con sonido 360°, hasta 16 horas de batería, resistente al agua IPX4, micrófono integrado para llamadas.",
    price: 279.0,
    stock: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80",
  },
  {
    name: "PlayStation 5",
    description:
      "Consola de nueva generación con procesador AMD Zen 2, GPU RDNA 2, 825GB SSD ultra rápido, resolución 4K hasta 120fps, ray tracing.",
    price: 499.99,
    stock: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80",
  },
  {
    name: "Xbox Series X",
    description:
      "Consola Xbox más potente, 12 teraflops, 1TB SSD, juegos en 4K a 60fps, retrocompatibilidad con miles de juegos.",
    price: 499.99,
    stock: 22,
    imageUrl:
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&q=80",
  },
  {
    name: 'MacBook Pro M3 14"',
    description:
      "Laptop profesional con chip M3, 18GB RAM unificada, 512GB SSD, pantalla Liquid Retina XDR, hasta 22 horas de batería.",
    price: 1999.0,
    stock: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
  },
  {
    name: "DJI Mavic 3",
    description:
      "Drone profesional con cámara Hasselblad 20MP, video 5.1K, autonomía de 46 minutos, detección omnidireccional de obstáculos.",
    price: 2199.0,
    stock: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&q=80",
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description:
      'Smartphone premium con Snapdragon 8 Gen 3, 12GB RAM, 256GB, cámara de 200MP, S Pen integrado, pantalla AMOLED 6.8".',
    price: 1299.0,
    stock: 28,
    imageUrl:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
  },
  {
    name: "Razer DeathAdder V3 Pro",
    description:
      "Mouse gaming inalámbrico profesional, sensor Focus Pro 30K, switches ópticas Gen-3, hasta 90 horas de batería.",
    price: 149.99,
    stock: 42,
    imageUrl:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&q=80",
  },
  {
    name: "Keychron Q1 Pro",
    description:
      "Teclado mecánico inalámbrico 75%, switches Gateron Pro, construcción de aluminio CNC, RGB por tecla, compatible Mac y Windows.",
    price: 189.0,
    stock: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80",
  },
  {
    name: 'LG 27" UltraGear Gaming',
    description:
      "Monitor gaming IPS 1440p, 165Hz, 1ms, G-Sync Compatible, HDR10, base ergonómica ajustable.",
    price: 399.99,
    stock: 19,
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
  },
  {
    name: "Meta Quest 3",
    description:
      "Visor de realidad virtual y mixta, resolución 4K+, seguimiento sin cables, procesador Snapdragon XR2 Gen 2, 128GB.",
    price: 499.99,
    stock: 16,
    imageUrl:
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&q=80",
  },
  {
    name: "Nikon Z6 III",
    description:
      "Cámara full-frame de 24.5MP, video 6K raw, estabilización IBIS de 8 pasos, dual card slots, visor EVF de alta resolución.",
    price: 2299.0,
    stock: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
  },
  {
    name: "AirPods Pro 2da Gen",
    description:
      "Auriculares inalámbricos con cancelación de ruido adaptativa, audio espacial personalizado, resistencia al agua IPX4, estuche MagSafe.",
    price: 249.0,
    stock: 55,
    imageUrl:
      "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500&q=80",
  },
  {
    name: "Steam Deck 512GB",
    description:
      'Consola portátil para gaming PC, pantalla táctil 7" 800p, AMD APU personalizado, compatible con Steam Library completa.',
    price: 549.99,
    stock: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1640955014216-75201056c829?w=500&q=80",
  },
  {
    name: "ASUS ROG Strix G16",
    description:
      "Laptop gaming con Intel Core i9, RTX 4070, 16GB DDR5 RAM, 1TB SSD, pantalla 165Hz QHD, refrigeración avanzada.",
    price: 1899.0,
    stock: 11,
    imageUrl:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80",
  },
  {
    name: "Fujifilm X-T5",
    description:
      "Cámara mirrorless retro de 40MP, sensor X-Trans CMOS 5, video 6.2K, IBIS de 7 pasos, simulaciones de película clásicas.",
    price: 1699.0,
    stock: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
  },
  {
    name: 'Samsung 65" QLED 4K',
    description:
      "Televisor Quantum Dot de 65 pulgadas, 4K 120Hz, Quantum HDR, Object Tracking Sound+, Gaming Hub integrado.",
    price: 1299.99,
    stock: 13,
    imageUrl:
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&q=80",
  },
  {
    name: "Sonos Arc",
    description:
      "Barra de sonido premium con Dolby Atmos, 11 altavoces integrados, compatible con AirPlay 2, control por voz integrado.",
    price: 899.0,
    stock: 17,
    imageUrl:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&q=80",
  },
  {
    name: "PlayStation VR2",
    description:
      "Visor de realidad virtual para PS5, pantalla OLED 4K HDR, campo visual 110°, seguimiento ocular, feedback háptico en lentes.",
    price: 549.99,
    stock: 21,
    imageUrl:
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&q=80",
  },
  {
    name: "Kindle Paperwhite Signature",
    description:
      'Lector de libros electrónicos con pantalla de 6.8", 32GB, luz cálida ajustable, resistente al agua, carga inalámbrica.',
    price: 189.99,
    stock: 45,
    imageUrl: "https://i.blogs.es/d06d5c/nuevo-kindle-2/450_1000.jpeg",
  },
  {
    name: "Google Pixel 8 Pro",
    description:
      'Smartphone con Tensor G3, 12GB RAM, 256GB, cámara de 50MP con IA avanzada, pantalla LTPO OLED 120Hz de 6.7".',
    price: 999.0,
    stock: 26,
    imageUrl:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
  },
  {
    name: "Xbox Series S",
    description:
      "Consola digital compacta, 512GB SSD, juegos en 1440p hasta 120fps, Quick Resume, Xbox Game Pass compatible.",
    price: 299.99,
    stock: 34,
    imageUrl:
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&q=80",
  },
  {
    name: "Canon EOS R5",
    description:
      "Cámara mirrorless profesional de 45MP, video 8K raw, IBIS de 8 pasos, AF con detección de personas y animales.",
    price: 3899.0,
    stock: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&q=80",
  },
  {
    name: "Anker PowerCore 26800",
    description:
      "Batería externa de alta capacidad, 26800mAh, 3 puertos USB, carga rápida, puede cargar iPhone 11 veces.",
    price: 65.99,
    stock: 78,
    imageUrl:
      "https://http2.mlstatic.com/D_NQ_NP_787594-MLA78242459478_082024-O.webp",
  },
  {
    name: "Logitech C920 HD Pro",
    description:
      "Webcam Full HD 1080p 30fps, autofocus, corrección de luz HD, micrófonos estéreo, compatible con Windows y Mac.",
    price: 79.99,
    stock: 52,
    imageUrl:
      "https://www.cinemasoportes.com.ar/wp/wp-content/uploads/2019/06/WEBCAM-C920-1.png",
  },
  {
    name: "Nintendo Switch Lite",
    description:
      'Consola portátil compacta, pantalla táctil de 5.5", controles integrados, compatible con juegos portátiles de Switch.',
    price: 199.99,
    stock: 38,
    imageUrl:
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&q=80",
  },
  {
    name: "SanDisk Extreme Pro 1TB",
    description:
      "SSD externo portátil, velocidades hasta 2000MB/s, resistente al agua y polvo IP55, USB-C, incluye cable adaptador.",
    price: 169.99,
    stock: 41,
    imageUrl:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80",
  },
  {
    name: "Rode VideoMic Pro+",
    description:
      "Micrófono direccional profesional para cámara, batería recargable, filtro pasa-altos, pad de -10dB, salida de auriculares.",
    price: 299.0,
    stock: 23,
    imageUrl:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80",
  },
  {
    name: "Elgato Stream Deck",
    description:
      "Controlador con 15 teclas LCD personalizables para streaming, control de OBS, apps, iluminación y más.",
    price: 149.99,
    stock: 29,
    imageUrl:
      "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=500&q=80",
  },
  {
    name: "Asus ZenScreen MB16AC",
    description:
      'Monitor portátil USB-C de 15.6" Full HD IPS, alimentado por USB, ultra delgado, cover magnético incluido.',
    price: 239.0,
    stock: 27,
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
  },
  {
    name: "Sennheiser HD 660S2",
    description:
      "Auriculares de estudio abiertos de alta gama, respuesta de frecuencia mejorada, impedancia optimizada, cable desmontable.",
    price: 599.0,
    stock: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1545127398-14699f92334b?w=500&q=80",
  },
  {
    name: "MSI MPG 321URX QD-OLED",
    description:
      'Monitor gaming OLED 4K de 32", 240Hz, 0.03ms, DisplayHDR True Black 400, HDMI 2.1, perfecto para PS5 y Xbox.',
    price: 1099.99,
    stock: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
  },
  {
    name: "Synology DS223j NAS",
    description:
      "Servidor de almacenamiento en red de 2 bahías, procesador quad-core, ideal para backup personal y streaming multimedia.",
    price: 199.99,
    stock: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80",
  },
  {
    name: "Razer Blade 15",
    description:
      "Laptop gaming premium, Intel Core i7-13800H, RTX 4060, 16GB RAM, 1TB SSD, pantalla QHD 240Hz, chassis de aluminio.",
    price: 2399.0,
    stock: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80",
  },
  {
    name: "Leica Q3",
    description:
      "Cámara compacta premium full-frame de 60MP, lente Summilux 28mm f/1.7, video 8K, resistente al clima.",
    price: 5995.0,
    stock: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
  },
  {
    name: "SteelSeries Arctis Nova Pro",
    description:
      "Auriculares gaming inalámbricos premium, audio Hi-Res, cancelación de ruido activa, doble batería intercambiable, GameDAC.",
    price: 349.99,
    stock: 22,
    imageUrl:
      "https://images.unsplash.com/photo-1545127398-14699f92334b?w=500&q=80",
  },
  {
    name: "Wacom Cintiq Pro 16",
    description:
      "Tableta con pantalla para diseño profesional, 4K UHD, 8192 niveles de presión, Pro Pen 2 incluido, soporte para piernas.",
    price: 1499.99,
    stock: 11,
    imageUrl:
      "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&q=80",
  },
  {
    name: "Secretlab Titan Evo 2024",
    description:
      "Silla gaming premium ergonómica, respaldo magnético ajustable, cuero NEO Hybrid, soporte lumbar 4D, hasta 130kg.",
    price: 549.0,
    stock: 16,
    imageUrl:
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500&q=80",
  },
  {
    name: "Shure SM7B",
    description:
      "Micrófono dinámico profesional para broadcast y grabación vocal, respuesta suave, excelente rechazo de ruido.",
    price: 399.0,
    stock: 19,
    imageUrl:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80",
  },
  {
    name: "Dell UltraSharp U2723DE",
    description:
      'Monitor profesional 27" QHD IPS, 99% sRGB, USB-C 90W, hub integrado, altura ajustable, anti-reflejo.',
    price: 519.99,
    stock: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
  },
  {
    name: "Corsair K100 RGB",
    description:
      "Teclado mecánico gaming premium, switches óptico-mecánicos, rueda de control iCUE, reposamuñecas magnético, 8000Hz.",
    price: 249.99,
    stock: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80",
  },
  {
    name: "OnePlus 12",
    description:
      'Smartphone con Snapdragon 8 Gen 3, 16GB RAM, 512GB, cámara Hasselblad de 50MP, pantalla AMOLED 120Hz de 6.82".',
    price: 899.0,
    stock: 31,
    imageUrl:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
  },
  {
    name: "Acer Predator X34",
    description:
      'Monitor gaming ultrawide curvo 34" UWQHD, 180Hz, 1ms, G-Sync Ultimate, HDR400, altavoces integrados.',
    price: 899.99,
    stock: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
  },
  {
    name: "Blue Yeti X",
    description:
      "Micrófono USB profesional con 4 patrones polares, medidor LED HD, controles inteligentes, soporte para auriculares.",
    price: 169.99,
    stock: 36,
    imageUrl:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80",
  },
  {
    name: "Asus ROG Ally",
    description:
      'Consola portátil Windows con AMD Ryzen Z1 Extreme, pantalla 7" 120Hz Full HD, 512GB SSD, compatible con Game Pass y Steam.',
    price: 699.99,
    stock: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1640955014216-75201056c829?w=500&q=80",
  },
  {
    name: "Apple Mac Mini M2 Pro",
    description:
      "Mini PC con chip M2 Pro, 16GB RAM unificada, 512GB SSD, hasta 4 pantallas, Thunderbolt 4, silencioso y eficiente.",
    price: 1299.0,
    stock: 17,
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
  },
  {
    name: "Xiaomi 14 Ultra",
    description:
      'Smartphone premium con Snapdragon 8 Gen 3, cámara Leica de 50MP con teleobjetivo variable, pantalla LTPO OLED 6.73".',
    price: 1199.0,
    stock: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
  },
  {
    name: "Logitech G Pro X Superlight 2",
    description:
      "Mouse gaming ultra ligero 60g, sensor HERO 2, switches híbridos, hasta 95 horas de batería, carga USB-C.",
    price: 159.0,
    stock: 33,
    imageUrl:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&q=80",
  },
  {
    name: "Ricoh GR IIIx",
    description:
      "Cámara compacta premium APS-C de 24MP, lente fija 40mm f/2.8, IBIS, ideal para fotografía callejera.",
    price: 1099.0,
    stock: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
  },
  {
    name: "BenQ SW270C",
    description:
      'Monitor profesional para fotografía 27" QHD IPS, 99% Adobe RGB, calibración hardware, USB-C, capucha incluida.',
    price: 599.0,
    stock: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
  },
  {
    name: "Fender Stratocaster American Professional",
    description:
      "Guitarra eléctrica profesional con cuerpo de aliso, pastillas V-Mod II, cuello de arce, acabado brillante. Sonido versátil y resonancia excepcional.",
    price: 1299.99,
    stock: 8,
    imageUrl:
      "https://acdn-us.mitiendanube.com/stores/005/899/763/products/0110232849_fen_ins_frt_1_rr-a949163d096af62c2b17552007895226-1024-1024.webp",
  },
  {
    name: "Gibson Les Paul Standard",
    description:
      "Guitarra eléctrica de lujo con cuerpo de caoba, tapa de arce flameado, pastillas Burstbucker. Tono cálido y poderoso, ideal para rock.",
    price: 2599.99,
    stock: 5,
    imageUrl:
      "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_46/462510/14952105_800.jpg",
  },
  {
    name: "Ibanez RG Series",
    description:
      "Guitarra eléctrica moderna con cuerpo ultadelgado, mástil rápido, pastillas PowerSpan Dual. Perfecta para metal y rock moderno.",
    price: 799.99,
    stock: 12,
    imageUrl: "https://m.media-amazon.com/images/I/71UK1KlzA-L._AC_SL1500_.jpg",
  },
  {
    name: "Yamaha FG830 Acústica",
    description:
      "Guitarra acústica de calidad profesional con cuerpo de abeto, fondo y aros de caoba. Sonido cálido, resonancia profunda, excelente para principiantes y profesionales.",
    price: 449.99,
    stock: 18,
    imageUrl:
      "https://i0.wp.com/www.inovamusicnet.com/wp-content/uploads/2021/04/41aL9JWFqfL._AC_US800_.jpg?fit=600%2C600&ssl=1",
  },
  {
    name: "Taylor 214ce Acústica",
    description:
      "Guitarra acústica-eléctrica con cuerpo de gran auditorium, pastilla Expression System 2. Sonido brillante y proyección excepcional, ideal para actuaciones.",
    price: 899.99,
    stock: 10,
    imageUrl:
      "https://http2.mlstatic.com/D_Q_NP_2X_641563-MLA96868484237_102025-T.webp",
  },
  {
    name: "Martin D-28 Acústica",
    description:
      "Guitarra acústica de gama alta con cuerpo de palisandro y abeto. Sonido resonante y profundo, preferida por músicos profesionales de folk y country.",
    price: 2499.99,
    stock: 6,
    imageUrl:
      "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_60/605876/20108510_800.jpg",
  },
  {
    name: "José Ramírez Nylon Clásica",
    description:
      "Guitarra clásica española con cuerpo de abeto y palosanto. Sonido cálido, profundo y sedoso. Instrumento de concierto con excelente proyección.",
    price: 3299.99,
    stock: 4,
    imageUrl: "https://m.media-amazon.com/images/I/51sfaDcP2QL.jpg",
  },
  {
    name: "Alhambra 11P Clásica",
    description:
      "Guitarra clásica profesional con armazón de palisandro, cuerpo de abeto rojo. Sonido cálido y equilibrado, ideal para técnica clásica.",
    price: 1899.99,
    stock: 7,
    imageUrl:
      "https://m.media-amazon.com/images/I/61G-67vucIL._AC_UF894,1000_QL80_.jpg",
  },
  {
    name: "Yamaha CG192 Clásica",
    description:
      "Guitarra clásica educativa y profesional con cuerpo de caoba, cuello resistente. Excelente relación calidad-precio para estudiantes y músicos.",
    price: 649.99,
    stock: 15,
    imageUrl: "https://http2.mlstatic.com/D_902561-MLA93206068335_092025-C.jpg",
  },
];

const seedProducts = async () => {
  try {
    // Conectar a MongoDB con la misma lógica de configdb.ts
    const dbURI = (process.env.MONGO_DB_URI ?? "")
      .replace("<db_username>", process.env.MONGO_DB_USER ?? "")
      .replace("<db_password>", process.env.MONGO_DB_PASSWORD ?? "")
      .replace("<db_name>", process.env.MONGO_DB_NAME ?? "");

    if (!dbURI) {
      throw new Error("MONGO_DB_URI is not defined in .env file");
    }

    await mongoose.connect(dbURI);
    console.log("✅ Conectado a MongoDB");

    // Limpiar productos existentes
    await ProductModel.deleteMany({});
    console.log("🗑️  Productos anteriores eliminados");

    // Insertar nuevos productos
    const insertedProducts = await ProductModel.insertMany(products);
    console.log(
      `✅ ${insertedProducts.length} productos agregados exitosamente`,
    );

    // Mostrar productos insertados
    console.log("\n📦 Productos insertados:");
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
    });

    // LIMPIAR CARRITOS CON PRODUCTOS HUÉRFANOS
    console.log("\n🧹 Limpiando carritos con productos huérfanos...");

    const result = await CartModel.updateMany(
      { "products.productId": null },
      { $pull: { products: { productId: null } } },
    );
    
    if (result.modifiedCount > 0) {
      console.log(
        `✅ Productos null eliminados de ${result.modifiedCount} carritos`,
      );

      const emptyCartsResult = await CartModel.deleteMany({
        products: { $size: 0 },
      });
      console.log(
        `🗑️  ${emptyCartsResult.deletedCount} carritos vacíos eliminados`,
      );
    } else {
      console.log("✨ No se encontraron productos null en los carritos");
    }

    // Mostrar estadísticas finales de carritos
    const finalCarts = await CartModel.countDocuments();
    console.log(`\n📊 Carritos activos después de limpieza: ${finalCarts}`);

    // Desconectar
    await mongoose.disconnect();
    console.log("\n✅ Desconectado de MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al insertar productos:", error);
    process.exit(1);
  }
};

seedProducts();
