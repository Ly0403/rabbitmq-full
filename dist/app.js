"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rabbit_1 = require("./config/rabbit");
const app = (0, express_1.default)();
app.use("/publish/:msg", (req, res) => {
    const msg = req.params.msg;
    (0, rabbit_1.rabbitCon)().then((con) => __awaiter(void 0, void 0, void 0, function* () {
        const ch = yield con.createChannel();
        yield ch.assertQueue("q1");
        ch.sendToQueue("q1", Buffer.from(msg));
    }));
    res.send("ok");
});
(0, rabbit_1.rabbitCon)().then((con) => __awaiter(void 0, void 0, void 0, function* () {
    const ch = yield con.createChannel();
    yield ch.assertQueue('q1');
    ch.consume('q1', (text) => {
        console.log(text.content.toString());
        ch.ack(text);
    });
}));
app.use("/broadcast/:msg", (req, res) => {
    const msg = req.params.msg;
    (0, rabbit_1.rabbitCon)().then((con) => __awaiter(void 0, void 0, void 0, function* () {
        const ch = yield con.createChannel();
        ch.publish("ex1", "", Buffer.from(msg));
    }));
    res.send("ok");
});
(0, rabbit_1.rabbitCon)().then((con) => __awaiter(void 0, void 0, void 0, function* () {
    const ch = yield con.createChannel();
    yield ch.assertExchange("ex1", "fanout", { durable: false });
    const q = yield ch.assertQueue("", { exclusive: false });
    console.log(q);
    yield ch.bindQueue(q.queue, "ex1", "");
    ch.consume(q.queue, (text) => {
        console.log(text.content.toString());
        ch.ack(text);
    });
}));
app.use("/direct/:msg", (req, res) => {
    const msg = req.params.msg;
    (0, rabbit_1.rabbitCon)().then((con) => __awaiter(void 0, void 0, void 0, function* () {
        const ch = yield con.createChannel();
        ch.publish("ex2", "xxx", Buffer.from(msg));
    }));
    res.send("ok");
});
(0, rabbit_1.rabbitCon)().then((con) => __awaiter(void 0, void 0, void 0, function* () {
    const ch = yield con.createChannel();
    yield ch.assertExchange("ex2", "direct", { durable: false });
    const q = yield ch.assertQueue("zzz", { exclusive: false });
    console.log(q);
    yield ch.bindQueue(q.queue, "ex2", "xxx");
    ch.consume(q.queue, (text) => {
        console.log(text.content.toString());
        ch.ack(text);
    });
}));
app.listen(3001);
