import mongoose, { ConnectOptions, Connection } from "mongoose";

require("dotenv").config();

const connectionPool: { [key: string]: mongoose.Connection } = {};

export const connectToDatabase = async () => {
    let baseURL = process.env.LOCAL_DB_URI;
    const uri = baseURL;

    mongoose.connect(uri!).then(() => {
        console.log("database connected successfully");
    }).catch((err) => {
        console.log(err);
        console.log("database not connected");
    })
};