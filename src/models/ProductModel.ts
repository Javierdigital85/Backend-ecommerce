import mongoose from "mongoose";
import { IProduct } from "../interfaces/models";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    name_es: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    description_es: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual para calcular precio con descuento
ProductSchema.virtual("discountedPrice").get(function () {
  if (this.discountPercentage > 0) {
    return (
      Math.round(this.price * (1 - this.discountPercentage / 100) * 100) / 100
    );
  }
  return this.price;
});

ProductSchema.set("toJSON", { virtuals: true });

export default mongoose.model<IProduct>("Product", ProductSchema);
