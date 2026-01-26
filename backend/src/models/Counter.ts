import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICounter extends Document {
  name: string;
  value: number;
}

const CounterSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    value: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Note: unique: true on the name field automatically creates a unique index, so no need for explicit index call

const Counter: Model<ICounter> = mongoose.model<ICounter>('Counter', CounterSchema);

export default Counter;
