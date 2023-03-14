import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import dotenv from "dotenv";
import compression from "compression";
import cors from "cors";

import * as Routes from "./v1/routes";

dotenv.config();
const app = express();

// ↓↓↓ Add compression to all routes. ↓↓↓ //
app.use(compression());

// ↓↓↓ Allows API to parse client payload. ↓↓↓ //
app.use(express.json());
app.use(cors());

// ↓↓↓ Routes ↓↓↓
enum RouteBases {
  AUTH = "/api/v1/auth",
  USERS = "/api/v1/users",
  PURCHASES = "/api/v1/purchases",
  OVERVIEWS = "/api/v1/overviews",
  OVERVIEW_GROUPS = "/api/v1/overview-groups",
  LOGBOOKS = "/api/v1/logbooks",
  LOGBOOK_ENTRIES = "/api/v1/logbook-entries",
}
app.use(RouteBases.AUTH, Routes.authRouter_v1);
app.use(RouteBases.USERS, Routes.usersRouter_v1);
app.use(RouteBases.PURCHASES, Routes.purchasesRouter_v1);
app.use(RouteBases.OVERVIEWS, Routes.overviewsRouter_v1);
app.use(RouteBases.OVERVIEW_GROUPS, Routes.overviewGroupsRouter_v1);
app.use(RouteBases.LOGBOOKS, Routes.logbooksRouter_v1);
app.use(RouteBases.LOGBOOK_ENTRIES, Routes.logbookEntriesRouter_v1);

// ↓↓↓ Global error-catching middleware. ↓↓↓ //
const globalErrorHandlerMiddleware: ErrorRequestHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (error) response.json({ error: error.message });
};
app.use(globalErrorHandlerMiddleware);

// ↓↓↓ Listening ↓↓↓ //
const serverPort = process.env.SERVER_PORT;
app.listen(serverPort, () => {
  console.log(
    `🚀 Success! CORS-enabled web server is running at https://localhost:${serverPort}`
  );
});
