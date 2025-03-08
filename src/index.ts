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


const app = express();
const PORT = 3000;

app.use(express.json()); // ✅ Parses incoming JSON data
app.use(cors()); // ✅ Enables CORS

connectToDatabase();

app.use(authRouter);
app.use('/invoice', invoiceRouter);
app.use('/quotation', quotationRouter);
app.use('/client', clientRouter);
app.use('/inventory', productRouter);

app.use(ErrorHandler);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});