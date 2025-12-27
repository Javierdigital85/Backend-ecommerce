// ==================== MercadoPago Item (formato de la API) ====================
export interface MercadoPagoItem {
  id: string;
  title: string;
  unit_price: number;
  quantity: number;
  currency_id?: string;
}
