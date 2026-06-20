// import Redis from "ioredis";

// const redis = new Redis({
//   host: process.env.REDIS_HOST || "redis",
//   port: process.env.REDIS_PORT || 6379,
// });

// redis.on("connect", () => console.log("✅ Redis connected successfully"));
// redis.on("error", (err) => console.error("❌ Redis Error:", err));

// export default redis;



// import { createClient } from "redis";

// const client = createClient({
//   url: `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
// });

// // Redis Error Handling
// client.on("error", (err) => console.error("❌ Redis Error:", err));
// client.on("connect", () => console.log("✅ Redis Connected Successfully"));

// await client.connect();

// export default client;




import { createClient } from "redis";
console.log("REDIS_URL =", process.env.REDIS_URL);
const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    keepAlive: 30000,                  // Send TCP keep‑alive every 30s
    reconnectStrategy: (retries) => {
      // Exponential backoff: 100ms, 200ms, 400ms ... max 3s
      return Math.min(retries * 100, 3000);
    },
    // If you ever use a non‑TLS URL, uncomment the next line:
    // tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : false,
  },
});

// Redis Event Handlers
client.on("error", (err) => console.error("❌ Redis Error:", err));
client.on("connect", () => console.log("✅ Redis Connected Successfully"));
client.on("ready", () => console.log("✅ Redis is ready to accept commands"));
client.on("end", () => console.log("🔌 Redis connection ended"));

// Optional: Test ping when ready
client.on("ready", async () => {
  try {
    await client.ping();
    console.log("✅ Redis ping successful");
  } catch (err) {
    console.error("❌ Redis ping failed:", err);
  }
});

await client.connect();

export default client;