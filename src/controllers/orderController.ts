import { Preference } from "mercadopago";
import { client } from "../config/mercadoPagoConfig";
import OrderModel from "../models/OrderModel";
import { RequestHandler } from "express";
import { MercadoPagoItem } from "../interfaces";

const preference = new Preference(client);

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const { items, payer, shippingInfo } = req.body;

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

    // Crear la orden en la base de datos primero
    const newOrder = new OrderModel({
      products: items.map((item: MercadoPagoItem) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.unit_price,
      })),
      totalAmount: items.reduce(
        (total: number, item: MercadoPagoItem) =>
          total + item.unit_price * item.quantity,
        0
      ),
      status: "pending",
      shippingInfo: shippingInfo,
      mercadoPagoData: {
        payerEmail: payer.email,
      },
    });

    const savedOrder = await newOrder.save();

    //Crear prefrencia en Mercado Pago con external_reference

    const result = await preference.create({
      body: {
        items: items,
        payer: {
          email: payer.email,
        },
        external_reference: savedOrder._id.toString(),
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`,
        },
        notification_url: `${
          process.env.BACKEND_URL || "http://localhost:3001"
        }/api/webhook`,
        metadata: {
          order_id: savedOrder._id.toString(),
        },
      },
    });

    console.log("RESULTADO DE LA PREFERENCIA CREADA", result);
    if (savedOrder.mercadoPagoData && result.id) {
      savedOrder.mercadoPagoData.preferenceId = result.id;
      await savedOrder.save();
    }

    res.status(201).json({
      success: true,
      message: "Orden creada exitosamente",
      paymentUrl: result.init_point,
      preferenceId: result.id,
    });
  } catch (error) {
    console.log("Error al crear una orden", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la orden",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
