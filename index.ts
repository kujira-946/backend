import express, { Express, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/", (response: Response) => {
  response.send("Express TypeScript Server");
});

app.listen(port, () => {
  console.log(`Success! Server is running at https://localhost:${port}`);
});
