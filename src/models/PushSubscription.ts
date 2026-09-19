import { Schema, models, model, Types } from "mongoose";

export interface IPushSubscription {
  _id: string;
  producteurId: Types.ObjectId;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    producteurId: { type: Schema.Types.ObjectId, ref: "Producteur", required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default models.PushSubscription ||
  model<IPushSubscription>("PushSubscription", PushSubscriptionSchema);
