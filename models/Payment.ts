import mongoose, { Schema, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userMobile: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    items: [{ id: Number, name: String, price: Number, count: Number }],
  },
  { timestamps: true },
);

const Payment = models.Payment || mongoose.model("Payment", PaymentSchema);
export default Payment;
