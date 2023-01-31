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
  OVERVIEW = "/api/v1/overviews",
  OVERVIEW_PURCHASE_ITEMS = "/api/v1/overview-purchase-items",
  LOGBOOKS = "/api/v1/log-books",
  LOGBOOK_GROUPS = "/api/v1/logbook-groups",
  LOGBOOK_GROUP_PURCHASE_ITEMS = "/api/v1/logbook-group-purchase-items",
  LOGBOOK_REVIEWS = "/api/v1/logbook-reviews",
}

// ↓↓↓ Allows API to parse client payload. ↓↓↓
app.use(express.json());

// ↓↓↓ Routes ↓↓↓
app.use(RouteBases.AUTH, Routes.authRouter_v1);
app.use(RouteBases.USERS, Routes.userRouter_v1);
app.use(RouteBases.OVERVIEW, Routes.overviewRouter_v1);
app.use(RouteBases.LOGBOOKS, Routes.logbookRouter_v1);

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
