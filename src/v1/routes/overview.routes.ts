import express from "express";

import * as Validators from "../validators/overviews.validators";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/overviews.controllers";

export const overviewsRouter_v1 = express.Router();

overviewsRouter_v1.get("/", Controllers.fetchOverviews);

overviewsRouter_v1.get("/:overviewId", Controllers.fetchOverview);

type OverviewCreateDataFields = (keyof Validators.OverviewUpdateData)[];
const overviewCreateDataFields: OverviewCreateDataFields = ["savings"];
overviewsRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(overviewCreateDataFields),
  Controllers.createOverview
);

type OverviewUpdateDataFields = (keyof Validators.OverviewUpdateData)[];
const overviewUpdateDataFields: OverviewUpdateDataFields = [
  "income",
  "savings",
];
overviewsRouter_v1.patch(
  "/:overviewId",
  HelperMiddlewares.checkValidityOfUserInput(overviewUpdateDataFields, {
    requireAllData: false,
  })
);

overviewsRouter_v1.delete("/:overviewId", Controllers.deleteOverview);
