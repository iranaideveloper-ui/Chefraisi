import mongoose, { Schema, models } from "mongoose";

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userMobile: { type: String, required: true },
    items: [{ id: Number, name: String, price: Number, count: Number }],
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "cancelled", "refunded"], default: "pending" },
  },
  { timestamps: true },
);

const Order = models.Order || mongoose.model("Order", OrderSchema);
export default Order;
