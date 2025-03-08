import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for TypeScript type safety
interface ClientAttrs {
    businessName: string;
    clientIndustry: string;
    country: string;
    city?: string;
    businessGSTIN?: string;
    businessPAN?: string;
}

interface ClientDoc extends Document {
    businessName: string;
    clientIndustry: string;
    country: string;
    city?: string;
    businessGSTIN?: string;
    businessPAN?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ClientModel extends Model<ClientDoc> {
    build(attrs: ClientAttrs): ClientDoc;
}

const ClientSchema = new Schema<ClientDoc>(
    {
        businessName: { type: String, required: true },
        clientIndustry: { type: String, required: true },
        country: { type: String, required: true },
        city: { type: String, default: null },
        businessGSTIN: { type: String, default: null },
        businessPAN: { type: String, default: null }
    },
    { timestamps: true } // Auto adds createdAt & updatedAt
);

// Static method to enforce type checking
ClientSchema.statics.build = (attrs: ClientAttrs) => {
    return new Client(attrs);
};

// Creating the model
const Client = mongoose.model<ClientDoc, ClientModel>("Client", ClientSchema);

export { Client };
