import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import dotenv from "dotenv";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";

import * as Routes from "./v1/routes";

dotenv.config();
const app = express();

app.use(compression()); // Compresses all routes.
app.use(helmet()); // Sets HTTP headers to protect app from well-known web vulnerabilities.
app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
  })
); // Sets up CORS for all API routes.

// ↓↓↓ Add rate limiting to a max of 20 requests/per minute. ↓↓↓ //
// ↓↓↓ Prevents excessive requests, attacks (e.g. DDOS), performance issues, etc. ↓↓↓ //
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // one minute
    max: 20,
  })
);

// ↓↓↓ Allows API to parse client payload. ↓↓↓ //
app.use(express.json());

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
const port = process.env.PORT;
app.listen(port, () => {
  console.log(
    `🚀 Success! CORS-enabled web server is running at https://localhost:${port}`
  );
});
