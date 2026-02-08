import dotenv from "dotenv";
import { MercadoPagoConfig } from "mercadopago";

dotenv.config();

// Determinar el ambiente (development o production)
const isProduction = process.env.NODE_ENV === "production";

// Seleccionar el access token según el ambiente
const getAccessToken = (): string => {
  if (isProduction) {
    const token = process.env.MP_ACCESS_TOKEN_PROD;
    if (!token) {
      throw new Error(
        "MP_ACCESS_TOKEN_PROD is not defined. Please set production credentials in .env file",
      );
    }
    console.log("🔴 MercadoPago: Using PRODUCTION credentials");
    return token;
  } else {
    const token =
      process.env.MP_ACCESS_TOKEN_TEST || process.env.MP_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        "MP_ACCESS_TOKEN_TEST is not defined. Please set test credentials in .env file",
      );
    }
    console.log("🟢 MercadoPago: Using TEST credentials");
    return token;
  }
};

// Crear el cliente con el token apropiado
export const client = new MercadoPagoConfig({
  accessToken: getAccessToken(),
  options: {
    timeout: 5000,
  },
});

// Exportar información del ambiente
export const mercadoPagoEnv = {
  isProduction,
  environment: isProduction ? "production" : "test",
};
