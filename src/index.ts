import express from "express";
import cors from "cors";

require("dotenv").config();

import { connectToDatabase } from "./database/db";
import { authRouter } from './routes/auth';
import { invoiceRouter } from './routes/invoice';
import { clientRouter } from './routes/client';
import { productRouter } from "./routes/Product";
import { quotationRouter } from "./routes/quotation";
import ErrorHandler from "./middleware/errorHandler";
import { rootRouter } from "./routes/root";


const app = express();
// const PORT = process.env.PORT || 3000;
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json()); // ✅ Parses incoming JSON data
app.use(cors()); // ✅ Enables CORS

connectToDatabase();

app.use(authRouter);
app.use('/', rootRouter);
app.use('/invoice', invoiceRouter);
app.use('/quotation', quotationRouter);
app.use('/client', clientRouter);
app.use('/inventory', productRouter);

app.use(ErrorHandler);


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});