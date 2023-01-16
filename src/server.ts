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

// Middleware for catching errors & sending them as JSON to client.
function errorHandler<Error>(
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
): ErrorRequestHandler {
  response.json({ error });
}
app.use(errorHandler);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Success! Server is running at https://localhost:${port}`);
});
