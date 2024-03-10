import express from "express";
import { rabbitCon } from "./config/rabbit";

const app = express();

app.use("/publish/:msg", (req, res) => {
  const msg = req.params.msg;

  rabbitCon().then(async (con) => {
    const ch = await con.createChannel();
    await ch.assertQueue("q1");
    ch.sendToQueue("q1", Buffer.from(msg));
  });

  res.send("ok");
});

rabbitCon().then(async (con) => {
    const ch = await con.createChannel();
    await ch.assertQueue('q1');
    ch.consume('q1', (text: any) => {
      console.log(text.content.toString());
      ch.ack(text);
    });
  });

app.use("/broadcast/:msg", (req, res) => {
  const msg = req.params.msg;

  rabbitCon().then(async (con): Promise<void> => {
    const ch = await con.createChannel();
    ch.publish("ex1", "", Buffer.from(msg));
  });

  res.send("ok");
});

rabbitCon().then(async (con) => {
  const ch = await con.createChannel();
  await ch.assertExchange("ex1", "fanout", { durable: false });
  const q = await ch.assertQueue("",{exclusive: false} );
  console.log(q)
  await ch.bindQueue(q.queue, "ex1", "");
  ch.consume(q.queue, (text: any) => {
    console.log(text.content.toString());
    ch.ack(text);
  });
});

app.use("/direct/:msg", (req, res) => {
    const msg = req.params.msg;
  
    rabbitCon().then(async (con): Promise<void> => {
      const ch = await con.createChannel();
      ch.publish("ex2", "xxx", Buffer.from(msg));
    });
  
    res.send("ok");
  });
  
  rabbitCon().then(async (con) => {
    const ch = await con.createChannel();
    await ch.assertExchange("ex2", "direct", { durable: false });
    const q = await ch.assertQueue("zzz",{exclusive: false} );
    console.log(q)
    await ch.bindQueue(q.queue, "ex2", "xxx");
    ch.consume(q.queue, (text: any) => {
      console.log(text.content.toString());
      ch.ack(text);
    });
  });

app.listen(3000);
