import express from "express";

import * as Validators from "../validators/overviews.validators";
import * as Controllers from "../controllers/overviews.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const overviewsRouter_v1 = express.Router();

overviewsRouter_v1.get("/", Controllers.fetchOverviews);

overviewsRouter_v1.get("/:overviewId", Controllers.fetchOverview);

type OverviewCreateInputs = (keyof Validators.OverviewCreateValidator)[];
const overviewCreateInputs: OverviewCreateInputs = ["savings"];
overviewsRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(overviewCreateInputs),
  Controllers.createOverview
);

type OverviewUpdateInputs = (keyof Validators.OverviewUpdateValidator)[];
const overviewUpdateInputs: OverviewUpdateInputs = ["income", "savings"];
overviewsRouter_v1.patch(
  "/:overviewId",
  HelperMiddlewares.checkValidityOfUserInput(overviewUpdateInputs, {
    requireAllData: false,
  })
);

overviewsRouter_v1.delete("/:overviewId", Controllers.deleteOverview);
