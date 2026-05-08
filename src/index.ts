import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => ({
    message: "Hello from ElysiaJS",
  }))
  .listen(3000);

console.log("running on http://localhost:3000");