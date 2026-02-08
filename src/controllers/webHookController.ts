import { Payment } from "mercadopago";
import { client } from "../config/mercadoPagoConfig";
import OrderModel from "../models/OrderModel";
import ProductModel from "../models/ProductModel";
import crypto from "crypto";
import { Request, RequestHandler } from "express";

const validateSignature = (req: Request): boolean => {
  try {
    // Obtener la firma y el secreto
    const signature = req.headers["x-signature"];
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

    // Validamos que existan
    if (!signature || !secret) {
      return false;
    }
    // Split por coma
    const parts = (signature as string).split(",");

    const ts = parts
      .find((part: string) => part.startsWith("ts="))
      ?.split("=")[1];
    const hash = parts.find((part) => part.startsWith("v1="))?.split("=")[1];

    // Obtener x-request-id del header
    const xRequest = req.headers["x-request-id"];

    // Obtener data.id segun el formato del webhook
    let dataId;
    let webhookFormat = "unknown";

    // Detectar formato del webhook
    if (req.body?.data?.id && req.body?.type === "payment") {
      // Formato v1: Mercado Feed v1.0
      dataId = req.body.data.id; // FIX: Changed from ID to id (lowercase)
      webhookFormat = "v1";
    } else if (req.body?.resource && req.body?.topic === "payment") {
      // Formato v2: MercadoPago Feed v2.0
      dataId = req.body.resource;
      webhookFormat = "v2";
    } else {
      dataId = req.query.id || req.query["data.id"];
      webhookFormat = "fallback";
    }

    // Crear manifest según la documentación oficial
    const manifest = `id:${dataId};request-id:${xRequest};ts;${ts};`;

    // Generar el hash esperado
    const expectedHash = crypto
      .createHmac("sha256", secret) //Usar el secreto configurado
      .update(manifest) // Añadir el manifest
      .digest("hex"); //Generar hash en hexadecimal

    // Compararlo de manera segura
    const isValid = crypto.timingSafeEqual(
      Buffer.from(hash || "", "hex"), //Hash recibido de MP
      Buffer.from(expectedHash, "hex"), //Hash que esperamos
    );
    return isValid;
  } catch (error) {
    return false;
  }
};

const webHoobController: RequestHandler = async (req, res) => {
  try {
    console.log("📥 Webhook received:", {
      type: req.body.type,
      topic: req.body.topic,
      timestamp: new Date().toISOString(),
    });

    // Verificar si es un webhook de payment
    const { type, topic } = req.body;

    // Solo procesar webhook de payment, ignorar merchant_order
    if (type !== "payment" && topic !== "payment") {
      console.log("⚠️ Webhook ignorado - No es de tipo payment");
      return res
        .status(200)
        .json({ message: "Webhook ignorado - Solo procesamos payments" });
    }

    // Validar el signature
    if (!validateSignature(req)) {
      console.error("❌ Webhook signature validation failed");
      return res.status(401).json({
        error: "No autorizado - Firma inválida",
      });
    }

    console.log("✅ Webhook signature validated");

    // Obtener datos del pago
    const { data } = req.body;

    // Obtenemos el id del pago
    const { id: paymentId } = data;

    if (!paymentId) {
      console.error("❌ Payment ID not found in webhook data");
      return res.status(400).json({ message: "Payment ID no encontrado" });
    }

    console.log(`🔍 Processing payment ID: ${paymentId}`);

    // Obtenemos información completa del pago desde MP
    const payment = await new Payment(client).get({
      id: paymentId,
    });

    console.log(`💳 Payment status: ${payment.status}`);

    // Buscar la orden usando external_reference
    const order = await OrderModel.findById(payment.external_reference);

    // Verificar si la orden existe o no
    if (!order) {
      console.error(
        `❌ Order not found for external_reference: ${payment.external_reference}`,
      );
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    console.log(`📦 Order found: ${order._id}`);

    // Actualizar la orden segun estado del pago
    if (payment.status === "approved") {
      console.log("✅ Payment approved - Updating order and stock");

      await OrderModel.findByIdAndUpdate(order._id, {
        status: "approved",
      });

      // Actualizar campos de pago
      if (order.mercadoPagoData) {
        order.mercadoPagoData.paymentId = paymentId;
        order.mercadoPagoData.paymentStatus = payment.status;
        order.mercadoPagoData.transactionAmount = payment.transaction_amount;
        order.mercadoPagoData.paymentMethod = payment.payment_method?.id;
        order.mercadoPagoData.paidAt = payment.date_approved
          ? new Date(payment.date_approved)
          : undefined;
      }

      // Podemos reducir el stock
      // Recorrer cada item de la orden
      if (order.products) {
        for (const item of order.products) {
          // Buscar el producto por su ID
          const product = await ProductModel.findById(item.productId);

          // Verificamos si el producto existe y hay stock disponibles
          if (!product) {
            console.error(`❌ Product not found: ${item.productId}`);
            return res.status(400).json({
              message: "Producto no encontrado",
            });
          }

          if (product.stock < item.quantity) {
            console.error(
              `❌ Insufficient stock for ${product.name}: ${product.stock} < ${item.quantity}`,
            );
            return res.status(400).json({
              message: "Stock insuficiente para " + product.name,
            });
          }

          // Actualizar el stock
          product.stock -= item.quantity;
          await product.save();
          console.log(
            `📦 Stock updated for ${product.name}: ${product.stock + item.quantity} -> ${product.stock}`,
          );
        }
      }

      // Guardar cambios
      await order.save();
      console.log("💾 Order saved successfully");
    } else if (payment.status === "rejected") {
      console.log("❌ Payment rejected - Updating order status");
      await OrderModel.findByIdAndUpdate(order._id, {
        status: "rejected",
      });
    } else if (
      payment.status === "pending" ||
      payment.status === "in_process"
    ) {
      console.log(`⏳ Payment ${payment.status} - Updating order status`);
      await OrderModel.findByIdAndUpdate(order._id, {
        status: payment.status,
      });
    }

    console.log("✅ Webhook processed successfully");
    res
      .status(200)
      .json({ message: "Webhook de payment procesado correctamente" });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).json({
      message: "Error al procesar el webhook",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export default webHoobController;
