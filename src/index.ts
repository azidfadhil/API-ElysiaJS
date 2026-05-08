import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => ({
    message: "Haloow! Ini adalah API ElysiaJS dengan bahasa Typescript!",
  }))
  .listen(3000);

console.log("running on http://localhost:3000");