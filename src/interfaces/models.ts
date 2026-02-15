import { Document, Types } from "mongoose";

// ==================== User Interfaces ====================
export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  isAdmin: boolean;
}

// ==================== Product Interfaces ====================
export interface IProduct extends Document {
  name: string;
  name_es?: string;
  description: string;
  description_es?: string;
  price: number;
  discountPercentage?: number;
  discountedPrice?: number;
  stock: number;
  imageUrl: string;
}

// ==================== Cart Interfaces ====================
export interface ICartItem {
  productId: Types.ObjectId | IProduct;
  quantity: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  products: ICartItem[];
}

// ==================== Order Interfaces ====================
export interface MercadoPagoData {
  preferenceId?: string;
  payerEmail?: string;
  paymentId?: string;
  paymentStatus?:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled"
    | "in_process";
  transactionAmount?: number | undefined;
  paymentMethod?: string | undefined;
  paidAt?: Date | undefined;
}

export interface ShippingAddress {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: ShippingAddress;
}

export interface IOrder extends Document {
  userId?: Types.ObjectId;
  products: {
    productId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }[];
  totalAmount: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | "in_process";
  mercadoPagoData?: MercadoPagoData;
  shippingInfo: ShippingInfo;
  createdAt: Date;
  updatedAt: Date;
}
