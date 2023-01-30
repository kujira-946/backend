import express from "express";

import * as Types from "../types/logbook-reviews.types";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/logbook-reviews.controllers";

export const logbookReviewRouter_v1 = express.Router();

logbookReviewRouter_v1.get("/", Controllers.fetchLogbookReviews);

logbookReviewRouter_v1.get("/:logbookReviewId", Controllers.fetchLogbookReview);

type LogbookReviewCreateDataFields = (keyof Types.LogbookReviewCreateData)[];
const logbookReviewCreateDataFields: LogbookReviewCreateDataFields = [
  "ownerId",
];

logbookReviewRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(logbookReviewCreateDataFields),
  Controllers.fetchLogbookReviews
);

type LogbookReviewUpdateDataFields = (keyof Types.LogbookReviewUpdateData)[];
const logbookReviewUpdateDataFields: LogbookReviewUpdateDataFields = [
  "reflection",
];

logbookReviewRouter_v1.patch(
  "/:logbookReviewId",
  HelperMiddlewares.checkValidityOfUserInput(logbookReviewUpdateDataFields, {
    requireAllData: false,
  }),
  Controllers.fetchLogbookReviews
);

logbookReviewRouter_v1.delete(
  "/:logbookReviewId",
  Controllers.fetchLogbookReviews
);
