import express from "express";

import * as Validators from "../validators/overviews.validators";
import * as Controllers from "../controllers/overviews.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const overviewsRouter_v1 = express.Router();

overviewsRouter_v1.get("/", Controllers.fetchOverviews);

type FetchUserOverviewData = (keyof Validators.FetchUserOverviewValidator)[];
const fetchUserOverviewData: FetchUserOverviewData = ["ownerId"];
overviewsRouter_v1.post(
  "/fetch-user-overview",
  HelperMiddlewares.validateUserData(fetchUserOverviewData),
  Controllers.fetchUserOverview
);

type CreateData = (keyof Validators.OverviewCreateValidator)[];
const createData: CreateData = ["income", "ownerId"];
const optionalCreateData: CreateData = ["savings"];
overviewsRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(
    createData,
    { isHttpPost: true },
    optionalCreateData
  ),
  Controllers.createOverview
);

type UpdateData = (keyof Validators.OverviewUpdateValidator)[];
const overviewUpdateData: UpdateData = ["income", "savings"];
overviewsRouter_v1.patch(
  "/:overviewId",
  HelperMiddlewares.validateUserData(overviewUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateOverview
);

overviewsRouter_v1.delete("/:overviewId", Controllers.deleteOverview);
