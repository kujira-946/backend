import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/", (request: Request, response: Response) => {
  response.send("Express TypeScript Server");
});

// Middleware for globally catching errors & sending them as JSON to client.
const errorHandler: ErrorRequestHandler = <Error>(
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (error) response.json({ error });
};
app.use(errorHandler);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Success! Server is running at https://localhost:${port}`);
});
