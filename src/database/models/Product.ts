import mongoose, { Schema, Document, Model } from "mongoose";

interface ProductAttrs {
  productName: string;
  sku: string;
  hsnCode: string;
  category: string;
  quantity: number;
  price: number;
  status?: string;
}

interface ProductDoc extends Document {
  productName: string;
  sku: string;
  hsnCode: string;
  category: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductModel extends Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc;
}

const productSchema = new Schema<ProductDoc>(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hsnCode: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      enum: ["in-stock", "out-of-stock"],
      default: "in-stock",
    },
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

productSchema.statics.build = (attrs: ProductAttrs) => {
  return new Product(attrs);
};

const Product = mongoose.model<ProductDoc, ProductModel>("Product", productSchema);

export { Product };
