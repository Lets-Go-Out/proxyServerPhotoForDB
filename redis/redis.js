const dotenv = require("dotenv");
dotenv.config();
const redis = require("redis");

const client = redis.createClient({
  password: process.env.REDISPASS
});

client.on("connect", () => {
  console.log("connected to redis!");
});

client.on("error", () => {
  console.log("error connecting to redis");
});

module.exports = client;
