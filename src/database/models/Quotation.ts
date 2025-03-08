import mongoose, { Schema, Document, Model, QueryOpThatReturnsDocument } from "mongoose";

// Interface for individual quotation items
interface QuotationItem {
    name: string;
    quantity: number;
    rate: number;
    totalAmount?: number;
    gstRate?: number;
}

// Interface for Quotation attributes
interface QuotationAttrs {
    quotationNumber: string;
    quotationDate: string;
    dueDate: string;
    billedBy: string;
    billedTo: string;
    currency?: string;
    taxType?: string;
    gstType?: string;
    items: QuotationItem[];
    subTotal: number;
    logo?: string;
    signature?: string;
}

// Interface for Quotation Document (Mongoose Schema + MongoDB ID)
interface QuotationDoc extends Document {
    quotationNumber: string;
    quotationDate: string;
    dueDate: string;
    billedBy: string;
    billedTo: string;
    currency?: string;
    taxType?: string;
    gstType?: string;
    items: QuotationItem[];
    subTotal: number;
    logo?: string;
    signature?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for the Quotation Model
interface QuotationModel extends Model<QuotationDoc> {
    build(attrs: QuotationAttrs): QuotationDoc;
}

// Define the Quotation Schema
const QuotationSchema = new Schema<QuotationDoc>(
    {
        quotationNumber: { type: String, required: true, unique: true },
        quotationDate: { type: String, required: true },
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

// Static method for creating a new Quotation
QuotationSchema.statics.build = (attrs: QuotationAttrs) => {
    return new Quotation(attrs);
};

// Create and export the Quotation model
const Quotation = mongoose.model<QuotationDoc, QuotationModel>("Quotation", QuotationSchema);
export { Quotation, QuotationAttrs };
