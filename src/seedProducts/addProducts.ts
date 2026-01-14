import mongoose from "mongoose";
import ProductModel from "../models/ProductModel";
import dotenv from "dotenv";

dotenv.config();

const products = [
  {
    name: "Laptop Dell XPS 13",
    description: "Laptop ultradelgada con procesador Intel Core i7, 16GB RAM, 512GB SSD, pantalla Full HD de 13.3 pulgadas. Perfecta para profesionales y estudiantes.",
    price: 1299.99,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
  },
  {
    name: "iPhone 15 Pro",
    description: "Smartphone Apple con chip A17 Pro, cámara triple de 48MP, pantalla Super Retina XDR de 6.1 pulgadas, 256GB de almacenamiento. Diseño en titanio.",
    price: 999.00,
    stock: 30,
    imageUrl: "https://www.imagineonline.store/cdn/shop/files/iPhone_15_Pro_Black_Titanium_PDP_Image_Position-1__en-IN_955a5f8b-9006-4919-92f4-ddfa2ebec8f6.jpg?v=1759733982",
  },
  {
    name: "Sony WH-1000XM5",
    description: "Auriculares inalámbricos con cancelación de ruido líder en la industria, audio Hi-Res, hasta 30 horas de batería. Comodidad premium.",
    price: 399.99,
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
  },
  {
    name: "Samsung 4K Smart TV 55\"",
    description: "Televisor LED 4K UHD de 55 pulgadas con tecnología Quantum Dot, HDR10+, Smart TV con apps integradas, diseño ultra delgado.",
    price: 749.99,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80",
  },
  {
    name: "iPad Air M2",
    description: "Tablet Apple con chip M2, pantalla Liquid Retina de 10.9 pulgadas, 128GB, compatible con Apple Pencil y Magic Keyboard.",
    price: 599.00,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80",
  },
  {
    name: "Canon EOS R6",
    description: "Cámara mirrorless full-frame de 20.1MP, video 4K, estabilización de imagen de 5 ejes, sistema de enfoque automático dual pixel.",
    price: 2499.00,
    stock: 8,
    imageUrl: "https://2.img-dpreview.com/files/p/E~TC4x3S590x0~articles/1548544834/body/Canon-EOS-R6-lead-01.jpeg",
  },
  {
    name: "Nintendo Switch OLED",
    description: "Consola de videojuegos híbrida con pantalla OLED de 7 pulgadas, 64GB de almacenamiento interno, controles Joy-Con incluidos.",
    price: 349.99,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&q=80",
  },
  {
    name: "Apple Watch Series 9",
    description: "Smartwatch con pantalla Always-On Retina, GPS + Cellular, monitoreo de salud avanzado, resistente al agua. Caja de aluminio de 45mm.",
    price: 429.00,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&q=80",
  },
  {
    name: "Bose SoundLink Revolve+",
    description: "Altavoz Bluetooth portátil con sonido 360°, hasta 16 horas de batería, resistente al agua IPX4, micrófono integrado para llamadas.",
    price: 279.00,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80",
  },
  {
    name: "Logitech MX Master 3S",
    description: "Mouse inalámbrico ergonómico para productividad, sensor de 8000 DPI, desplazamiento electromagnético, hasta 70 días de batería.",
    price: 99.99,
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
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
    console.log(`✅ ${insertedProducts.length} productos agregados exitosamente`);

    // Mostrar productos insertados
    console.log("\n📦 Productos insertados:");
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
    });

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
