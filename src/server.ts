import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import dotenv from "dotenv";

import * as Routes from "./v1/routes";

dotenv.config();
const app = express();

// ↓↓↓ Allows API to parse incoming JSON payload from the client. ↓↓↓
app.use(express.json());

// Routes
app.use("/api/v1/auth", Routes.authRouter_v1);
app.use("/api/v1/users", Routes.userRouter_v1);

// ↓↓↓ Middleware for globally catching errors & sending them as JSON to the client. ↓↓↓
const globalErrorHandlerMiddleware: ErrorRequestHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (error) response.json({ error: error.message });
};
app.use(globalErrorHandlerMiddleware);

// ↓↓↓ Listening ↓↓↓
const serverPort = process.env.SERVER_PORT;
app.listen(serverPort, () => {
  console.log(
    `🚀 Success! Server is running at https://localhost:${serverPort}`
  );
});
