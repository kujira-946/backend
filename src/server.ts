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
import { verifyAccessToken } from "./v1/middlewares/auth.middlewares";

dotenv.config();
const app = express();

app.use(cors()); // Sets up CORS for all routes.
app.use(helmet()); // Sets HTTP headers to protect app from well-known web vulnerabilities.
app.use(compression()); // Compresses all routes.

// ↓↓↓ Add rate limiting to a max of 20 requests/per minute. ↓↓↓ //
// ↓↓↓ Prevents excessive requests, attacks (e.g. DDOS), performance issues, etc. ↓↓↓ //

if (process.env.NODE_ENV === "production") {
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000, // one minute
      max: 20,
    })
  );
}

// ↓↓↓ Allows API to parse client payload. ↓↓↓ //
app.use(express.json());

// ↓↓↓ Routes ↓↓↓
enum RouteBases {
  AUTH = "/api/v1/auth",
  ONBOARDING = "/api/v1/onboarding",
  USERS = "/api/v1/users",
  PURCHASES = "/api/v1/purchases",
  OVERVIEWS = "/api/v1/overviews",
  OVERVIEW_GROUPS = "/api/v1/overview-groups",
  LOGBOOKS = "/api/v1/logbooks",
  LOGBOOK_ENTRIES = "/api/v1/logbook-entries",
}
app.use(RouteBases.AUTH, Routes.authRouter_v1);
app.use(RouteBases.ONBOARDING, verifyAccessToken, Routes.onboardingRouter_v1);
app.use(RouteBases.USERS, verifyAccessToken, Routes.usersRouter_v1);
app.use(RouteBases.PURCHASES, verifyAccessToken, Routes.purchasesRouter_v1);
app.use(RouteBases.OVERVIEWS, verifyAccessToken, Routes.overviewsRouter_v1);
app.use(
  RouteBases.OVERVIEW_GROUPS,
  verifyAccessToken,
  Routes.overviewGroupsRouter_v1
);
app.use(RouteBases.LOGBOOKS, verifyAccessToken, Routes.logbooksRouter_v1);
app.use(
  RouteBases.LOGBOOK_ENTRIES,
  verifyAccessToken,
  Routes.logbookEntriesRouter_v1
);

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
