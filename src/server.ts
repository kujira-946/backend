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

enum RouteBases {
  AUTH = "/api/v1/auth",
  USERS = "/api/v1/users",
  PURCHASES = "/api/v1/purchases",
  OVERVIEWS = "/api/v1/overviews",
  LOGBOOKS = "/api/v1/logbooks",
  LOGBOOK_ENTRIES = "/api/v1/logbook-entries",
}

// ↓↓↓ Allows API to parse client payload. ↓↓↓
app.use(express.json());

// ↓↓↓ Routes ↓↓↓
app.use(RouteBases.AUTH, Routes.authRouter_v1);
app.use(RouteBases.USERS, Routes.usersRouter_v1);
app.use(RouteBases.PURCHASES, Routes.purchasesRouter_v1);
app.use(RouteBases.OVERVIEWS, Routes.overviewsRouter_v1);
app.use(RouteBases.LOGBOOKS, Routes.logbooksRouter_v1);
app.use(RouteBases.LOGBOOK_ENTRIES, Routes.logbookEntriesRouter_v1);

// ↓↓↓ Global error-catching middleware. ↓↓↓
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
