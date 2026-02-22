import mongoose from "mongoose";
import ProductModel from "../models/ProductModel";
import CartModel from "../models/CartModel";
import dotenv from "dotenv";

dotenv.config();

const products = [
  {
    name: "Fender Stratocaster American Professional",
    name_es: "Fender Stratocaster Americana Profesional",
    description:
      "Professional electric guitar with alder body, V-Mod II pickups, maple neck, glossy finish. Versatile sound and exceptional resonance.",
    description_es:
      "Guitarra eléctrica profesional con cuerpo de aliso, pastillas V-Mod II, cuello de arce, acabado brillante. Sonido versátil y resonancia excepcional.",
    price: 1299.99,
    stock: 8,
    imageUrl:
      "https://acdn-us.mitiendanube.com/stores/005/899/763/products/0110232849_fen_ins_frt_1_rr-a949163d096af62c2b17552007895226-1024-1024.webp",
  },
  {
    name: "Gibson Les Paul Standard",
    name_es: "Gibson Les Paul Estándar",
    description:
      "Luxury electric guitar with mahogany body, flamed maple top, Burstbucker pickups. Warm and powerful tone, ideal for rock.",
    description_es:
      "Guitarra eléctrica de lujo con cuerpo de caoba, tapa de arce flameado, pastillas Burstbucker. Tono cálido y poderoso, ideal para rock.",
    price: 2599.99,
    stock: 5,
    imageUrl:
      "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_46/462510/14952105_800.jpg",
  },
  {
    name: "Ibanez RG Series",
    name_es: "Ibanez Serie RG",
    description:
      "Modern electric guitar with ultra-thin body, fast neck, PowerSpan Dual pickups. Perfect for metal and modern rock.",
    description_es:
      "Guitarra eléctrica moderna con cuerpo ultadelgado, mástil rápido, pastillas PowerSpan Dual. Perfecta para metal y rock moderno.",
    price: 799.99,
    stock: 12,
    imageUrl: "https://m.media-amazon.com/images/I/71UK1KlzA-L._AC_SL1500_.jpg",
  },
  {
    name: "Yamaha FG830 Acoustic",
    name_es: "Yamaha FG830 Acústica",
    description:
      "Professional quality acoustic guitar with spruce body, mahogany back and sides. Warm sound, deep resonance, excellent for beginners and professionals.",
    description_es:
      "Guitarra acústica de calidad profesional con cuerpo de abeto, fondo y aros de caoba. Sonido cálido, resonancia profunda, excelente para principiantes y profesionales.",
    price: 449.99,
    stock: 18,
    imageUrl:
      "https://i0.wp.com/www.inovamusicnet.com/wp-content/uploads/2021/04/41aL9JWFqfL._AC_US800_.jpg?fit=600%2C600&ssl=1",
  },
  {
    name: "Taylor 214ce Acoustic",
    name_es: "Taylor 214ce Acústica",
    description:
      "Acoustic-electric guitar with grand auditorium body, Expression System 2 pickup. Bright sound and exceptional projection, ideal for performances.",
    description_es:
      "Guitarra acústica-eléctrica con cuerpo de gran auditorium, pastilla Expression System 2. Sonido brillante y proyección excepcional, ideal para actuaciones.",
    price: 899.99,
    stock: 10,
    imageUrl:
      "https://http2.mlstatic.com/D_Q_NP_2X_641563-MLA96868484237_102025-T.webp",
  },
  {
    name: "Martin D-28 Acoustic",
    name_es: "Martin D-28 Acústica",
    description:
      "High-end acoustic guitar with rosewood and spruce body. Resonant and deep sound, preferred by professional folk and country musicians.",
    description_es:
      "Guitarra acústica de gama alta con cuerpo de palisandro y abeto. Sonido resonante y profundo, preferida por músicos profesionales de folk y country.",
    price: 2499.99,
    stock: 6,
    imageUrl:
      "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_60/605876/20108510_800.jpg",
  },
  {
    name: "José Ramírez Nylon Classical",
    name_es: "José Ramírez Nylon Clásica",
    description:
      "Spanish classical guitar with spruce and rosewood body. Warm, deep and silky sound. Concert instrument with excellent projection.",
    description_es:
      "Guitarra clásica española con cuerpo de abeto y palosanto. Sonido cálido, profundo y sedoso. Instrumento de concierto con excelente proyección.",
    price: 3299.99,
    stock: 4,
    imageUrl: "https://m.media-amazon.com/images/I/51sfaDcP2QL.jpg",
  },
  {
    name: "Alhambra 11P Classical",
    name_es: "Alhambra 11P Clásica",
    description:
      "Professional classical guitar with rosewood frame, red spruce body. Warm and balanced sound, ideal for classical technique.",
    description_es:
      "Guitarra clásica profesional con armazón de palisandro, cuerpo de abeto rojo. Sonido cálido y equilibrado, ideal para técnica clásica.",
    price: 1899.99,
    stock: 7,
    imageUrl:
      "https://m.media-amazon.com/images/I/61G-67vucIL._AC_UF894,1000_QL80_.jpg",
  },
  {
    name: "Yamaha CG192 Classical",
    name_es: "Yamaha CG192 Clásica",
    description:
      "Educational and professional classical guitar with mahogany body, durable neck. Excellent value for money for students and musicians.",
    description_es:
      "Guitarra clásica educativa y profesional con cuerpo de caoba, cuello resistente. Excelente relación calidad-precio para estudiantes y músicos.",
    price: 649.99,
    stock: 15,
    imageUrl: "https://http2.mlstatic.com/D_902561-MLA93206068335_092025-C.jpg",
  },
  {
    name: "Squier Affinity Strat",
    name_es: "Squier Affinity Strat",
    description:
      "Affordable electric guitar with alder body, vintage-style pickups. Great for beginners and budget-conscious players.",
    description_es:
      "Guitarra eléctrica accesible con cuerpo de aliso, pastillas estilo vintage. Ideal para principiantes y jugadores con presupuesto limitado.",
    price: 299.99,
    stock: 20,
    imageUrl:
      "https://musichall.com.py/tienda/wp-content/uploads/2022/09/1GUISQ0378108565E.jpg",
  },
  {
    name: "Epiphone Les Paul Special",
    name_es: "Epiphone Les Paul Especial",
    description:
      "Budget-friendly electric guitar with mahogany body, humbucker pickups. Great for beginners and those on a tight budget.",
    description_es:
      "Guitarra eléctrica económica con cuerpo de caoba, pastillas humbucker. Ideal para principiantes y personas con presupuesto ajustado.",
    price: 199.99,
    stock: 25,
    imageUrl:
      "https://www.casainstrumental.com/wp-content/uploads/2024/09/ENSVVSVCH1.png",
  },
  {
    name: "Fender Stratocaster American Professional",
    name_es: "Fender Stratocaster Americana Profesional",
    description:
      "Professional electric guitar with alder body, V-Mod II pickups, maple neck, glossy finish. Versatile sound and exceptional resonance.",
    description_es:
      "Guitarra eléctrica profesional con cuerpo de aliso, pastillas V-Mod II, cuello de arce, acabado brillante. Sonido versátil y resonancia excepcional.",
    price: 1299.99,
    stock: 8,
    imageUrl:
      "https://www.musicanarias.com/8727-thickbox_default/fender-american-professional-ii-stratocaster.jpg",
  },
  {
    name: "Gibson SG Special",
    name_es: "Gibson SG Especial",
    description:
      "Electric guitar with mahogany body, dual humbucker pickups. Classic design and versatile sound, perfect for rock and blues.",
    description_es:
      "Guitarra eléctrica con cuerpo de caoba, pastillas humbucker dobles. Diseño clásico y sonido versátil, perfecto para rock y blues.",
    price: 1499.99,
    stock: 9,
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPyOcsdqBOCzPyi_vnhsxNS8W0zSAQcxN7vQ&s",
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

    // Upsert: actualiza productos existentes (conserva su _id) e inserta nuevos
    const bulkOps = products.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: product },
        upsert: true,
      },
    }));

    const bulkResult = await ProductModel.bulkWrite(bulkOps);
    console.log(
      `✅ Productos procesados: ${bulkResult.upsertedCount} nuevos, ${bulkResult.modifiedCount} actualizados`,
    );

    // Mostrar productos en la base de datos
    const allProducts = await ProductModel.find({});
    console.log("\n📦 Productos en la base de datos:");
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
    });

    // Mostrar estadísticas finales de carritos
    const finalCarts = await CartModel.countDocuments();
    console.log(`\n📊 Carritos activos (sin modificar): ${finalCarts}`);

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
