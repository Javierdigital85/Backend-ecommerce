import { Preference } from "mercadopago";
import { client, mercadoPagoEnv } from "../config/mercadoPagoConfig";
import OrderModel from "../models/OrderModel";
import { RequestHandler } from "express";
import { MercadoPagoItem } from "../interfaces";

export const getMyOrders: RequestHandler = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Usuario no autenticado" });
    }

    const orders = await OrderModel.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener las órdenes" });
  }
};

const preference = new Preference(client);

export const createOrder: RequestHandler = async (req, res) => {
  try {
    console.log("🟢 Order creation started");

    if (!process.env.FRONTEND_URL) {
      throw new Error("FRONTEND_URL is not defined in environment variables");
    }

    const { items, payer, shippingInfo } = req.body;

    console.log(`🛒 Creating order for user: ${req.user?._id}`);
    console.log(`🌍 Environment: ${mercadoPagoEnv.environment}`);
    console.log("📦 Items:", JSON.stringify(items, null, 2));

    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Se requieren items para crear la orden",
      });
    }

    if (!payer || !payer.email) {
      return res.status(400).json({
        success: false,
        message: "Se requiere email del comprador",
      });
    }

    if (!shippingInfo || !shippingInfo.firstName || !shippingInfo.address) {
      return res.status(400).json({
        success: false,
        message: "Se requiere información de envío completa",
      });
    }

    // Calcular total
    const totalAmount = items.reduce(
      (total: number, item: MercadoPagoItem) =>
        total + Number(item.unit_price) * Number(item.quantity),
      0,
    );

    // Crear la orden en la base de datos
    const newOrder = new OrderModel({
      userId: req.user._id,
      products: items.map((item: MercadoPagoItem) => ({
        productId: item.id,
        quantity: Number(item.quantity),
        price: Number(item.unit_price),
      })),
      totalAmount,
      status: "pending",
      shippingInfo,
      mercadoPagoData: {
        payerEmail: payer.email,
      },
    });

    const savedOrder = await newOrder.save();
    console.log(`💾 Order saved with ID: ${savedOrder._id}`);

    // Preparar items para MercadoPago (asegurar tipos correctos)
    const mpItems = items.map((item: MercadoPagoItem) => ({
      id: String(item.id),
      title: String(item.title),
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      currency_id: "ARS",
    }));

    // Detectar si estamos en localhost (MercadoPago no acepta localhost para back_urls/notification_url)
    const frontendUrl = process.env.FRONTEND_URL || "";
    const backendUrl = process.env.BACKEND_URL || "";
    const isLocalhost =
      frontendUrl.includes("localhost") || frontendUrl.includes("127.0.0.1");

    // Construir el body de la preferencia
    const preferenceBody: any = {
      items: mpItems,
      payer: {
        email: payer.email,
      },
      external_reference: savedOrder._id.toString(),
      metadata: {
        order_id: savedOrder._id.toString(),
        user_id: req.user._id.toString(),
      },
      statement_descriptor: "TU_TIENDA",
      payment_methods: {
        installments: 12,
      },
    };

    // back_urls y auto_return solo funcionan con URLs públicas (no localhost)
    if (!isLocalhost) {
      preferenceBody.back_urls = {
        success: `${frontendUrl}/payment/success`,
        failure: `${frontendUrl}/payment/failure`,
        pending: `${frontendUrl}/payment/pending`,
      };
      preferenceBody.auto_return = "approved";
      console.log("🔗 Back URLs configured for production");
    } else {
      console.log("⚠️ Skipping back_urls and auto_return (localhost detected)");
    }

    // notification_url solo funciona con URLs públicas
    if (
      backendUrl &&
      !backendUrl.includes("localhost") &&
      !backendUrl.includes("127.0.0.1")
    ) {
      preferenceBody.notification_url = `${backendUrl}/api/webhook`;
      console.log("📡 Notification URL set:", preferenceBody.notification_url);
    } else {
      console.log(
        "⚠️ Skipping notification_url (localhost detected - webhooks won't work locally)",
      );
    }

    console.log("🔄 Creating MercadoPago preference...");
    console.log("📦 Preference body:", JSON.stringify(preferenceBody, null, 2));

    const result = await preference.create({ body: preferenceBody });

    console.log("✅ MercadoPago preference created:", {
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });

    // Guardar preferenceId en la orden
    if (savedOrder.mercadoPagoData && result.id) {
      savedOrder.mercadoPagoData.preferenceId = result.id;
      await savedOrder.save();
      console.log("💾 Preference ID saved to order");
    }

    // En modo test, usar sandbox_init_point; en producción, init_point
    const paymentUrl = mercadoPagoEnv.isProduction
      ? result.init_point
      : result.sandbox_init_point || result.init_point;

    res.status(201).json({
      success: true,
      message: "Orden creada exitosamente",
      paymentUrl,
      preferenceId: result.id,
      orderId: savedOrder._id,
      environment: mercadoPagoEnv.environment,
    });
  } catch (error: unknown) {
    // Capturar CUALQUIER tipo de error (MercadoPago SDK puede devolver objetos no-Error)
    console.error("❌ Error creating order:", error);
    console.error("❌ Error type:", typeof error);
    console.error(
      "❌ Error JSON:",
      JSON.stringify(error, Object.getOwnPropertyNames(error as object), 2),
    );
    if (error && typeof error === "object") {
      console.error("❌ Error keys:", Object.keys(error));
      console.error("❌ Error cause:", (error as any).cause);
      console.error("❌ Error status:", (error as any).status);
      console.error("❌ Error message:", (error as any).message);
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as any).message)
          : String(error);

    res.status(500).json({
      success: false,
      message: "Error al crear la orden",
      error: errorMessage,
    });
  }
};
