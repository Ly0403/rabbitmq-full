import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const url = String(process.env.RABBITURL);

export const rabbitCon = async () => {
    const con = await amqp.connect(url);
    return con;
}
