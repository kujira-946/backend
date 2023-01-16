import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import dotenv from "dotenv";

import { userRouter_v1 } from "./v1/routes/user";

dotenv.config();
const app = express();

// Routes
app.use("/api/v1/users", userRouter_v1);

// Middleware for globally catching errors & sending them as JSON to the client.
const globalErrorHandlerMiddleware: ErrorRequestHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (error) response.json({ error: error.message });
};
app.use(globalErrorHandlerMiddleware);

// Listening
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Success! Server is running at https://localhost:${port}`);
});
