import express from "express";

import * as Validators from "../validators/overviews.validators";
import * as Controllers from "../controllers/overviews.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const overviewsRouter_v1 = express.Router();

overviewsRouter_v1.get("/", Controllers.fetchOverviews);

overviewsRouter_v1.get("/:overviewId", Controllers.fetchOverview);

type OverviewCreateData = (keyof Validators.OverviewCreateValidator)[];
const overviewCreateData: OverviewCreateData = ["income"];
overviewsRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.validateUserData(overviewCreateData),
  Controllers.createOverview
);

type OverviewUpdateData = (keyof Validators.OverviewUpdateValidator)[];
const overviewUpdateData: OverviewUpdateData = [
  "income",
  "savings",
  "discretionarySavings",
];
overviewsRouter_v1.patch(
  "/:overviewId",
  HelperMiddlewares.validateUserData(overviewUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateOverview
);

overviewsRouter_v1.delete("/:overviewId", Controllers.deleteOverview);
