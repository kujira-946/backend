import express from "express";

import * as Validators from "../validators/logbook-review.validators";
import * as Controllers from "../controllers/logbook-review.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const logbookReviewsRouter_v1 = express.Router();

logbookReviewsRouter_v1.get("/", Controllers.fetchLogbookReviews);

logbookReviewsRouter_v1.get(
  "/:logbookReviewId",
  Controllers.fetchLogbookReview
);

type LogbookReviewCreateData =
  (keyof Validators.LogbookReviewCreateValidator)[];
const logbookReviewCreateData: LogbookReviewCreateData = ["ownerId"];
const logbookReviewOptionalCreateData: LogbookReviewCreateData = ["reflection"];
logbookReviewsRouter_v1.post(
  "/",
  HelperMiddlewares.checkValidityOfUserData(
    logbookReviewCreateData,
    { isHttpPost: true },
    logbookReviewOptionalCreateData
  ),
  Controllers.createLogbookReview
);

type LogbookReviewUpdateData =
  (keyof Validators.LogbookReviewUpdateValidator)[];
const logbookReviewUpdateData: LogbookReviewUpdateData = ["reflection"];
logbookReviewsRouter_v1.patch(
  "/:logbookReviewId",
  HelperMiddlewares.checkValidityOfUserData(logbookReviewUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateLogbookReview
);

logbookReviewsRouter_v1.delete(
  "/:logbookReviewId",
  Controllers.deleteLogbookReview
);
