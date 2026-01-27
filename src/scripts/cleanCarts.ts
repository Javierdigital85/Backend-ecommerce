import mongoose from "mongoose";
import CartModel from "../models/CartModel";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script para limpiar carritos de productos con productId null
 * Ejecutar con: npx ts-node src/scripts/cleanCarts.ts
 */
const cleanCarts = async () => {
  try {
    const dbURI = process.env.MONGO_DB_URI ?? "";

    if (!dbURI) {
      throw new Error("MONGO_DB_URI is not defined in .env file");
    }

    await mongoose.connect(dbURI);
    console.log("✅ Conectado a MongoDB");

    // Contar carritos antes de limpiar
    const totalCarts = await CartModel.countDocuments();
    console.log(`📊 Total de carritos: ${totalCarts}`);

    // Buscar carritos con productos null
    const cartsWithNullProducts = await CartModel.find({
      "products.productId": null,
    });

    console.log(
      `⚠️  Carritos con productos null: ${cartsWithNullProducts.length}`
    );

    if (cartsWithNullProducts.length > 0) {
      // Método 1: Usar updateMany para quitar productos null
      const result = await CartModel.updateMany(
        {},
        { $pull: { products: { productId: null } } }
      );

      console.log(`✅ Productos null eliminados de ${result.modifiedCount} carritos`);

      // Eliminar carritos completamente vacíos
      const emptyCartsResult = await CartModel.deleteMany({ products: { $size: 0 } });
      console.log(`🗑️  Carritos vacíos eliminados: ${emptyCartsResult.deletedCount}`);
    } else {
      console.log("✨ No se encontraron productos null en los carritos");
    }

    // Mostrar estadísticas finales
    const finalCarts = await CartModel.countDocuments();
    const cartsWithProducts = await CartModel.find({});
    
    let totalProducts = 0;
    for (const cart of cartsWithProducts) {
      totalProducts += cart.products.length;
    }

    console.log("\n📊 Estadísticas finales:");
    console.log(`   - Carritos activos: ${finalCarts}`);
    console.log(`   - Total de productos en carritos: ${totalProducts}`);

    await mongoose.disconnect();
    console.log("\n✅ Desconectado de MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al limpiar carritos:", error);
    process.exit(1);
  }
};

cleanCarts();
