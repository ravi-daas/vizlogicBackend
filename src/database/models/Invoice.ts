import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for individual invoice items
interface InvoiceItem {
  name: string;
  quantity: number;
  rate: number;
  totalAmount?: number;
  gstRate?: number;
}

// Interface for Invoice attributes
interface InvoiceAttrs {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  billedBy: string;
  billedTo: string;
  currency?: string;
  taxType?: string;
  gstType?: string;
  items: InvoiceItem[];
  subTotal: number;
  logo?: string;
  signature?: string;
}

// Interface for Invoice Document (Mongoose Schema + MongoDB ID)
interface InvoiceDoc extends Document {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  billedBy: string;
  billedTo: string;
  currency?: string;
  taxType?: string;
  gstType?: string;
  items: InvoiceItem[];
  subTotal: number;
  logo?: string;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the Invoice Model
interface InvoiceModel extends Model<InvoiceDoc> {
  build(attrs: InvoiceAttrs): InvoiceDoc;
}

// Define the Invoice Schema
const InvoiceSchema = new Schema<InvoiceDoc>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    billedBy: { type: String, required: true },
    billedTo: { type: String, required: true },
    currency: { type: String },
    taxType: { type: String },
    gstType: { type: String },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        rate: { type: Number, required: true },
        totalAmount: { type: Number }, // Optional, can be calculated
        gstRate: { type: Number },
      },
    ],
    subTotal: { type: Number, required: true },
    logo: { type: String },
    signature: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Static method for creating a new invoice
InvoiceSchema.statics.build = (attrs: InvoiceAttrs) => {
  return new Invoice(attrs);
};

// Create and export the Invoice model
const Invoice = mongoose.model<InvoiceDoc, InvoiceModel>("Invoice", InvoiceSchema);
export { Invoice, InvoiceAttrs };
