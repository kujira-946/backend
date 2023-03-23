import express from "express";

import * as Validators from "../validators/overviews.validators";
import * as Controllers from "../controllers/overviews.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const overviewsRouter_v1 = express.Router();

overviewsRouter_v1.get("/", Controllers.fetchOverviews);

overviewsRouter_v1.get(
  "/fetch-user-overviews",
  HelperMiddlewares.validateUserData(["ownerId"]),
  Controllers.fetchUserOverviews
);

overviewsRouter_v1.get(
  "/bulk-fetch",
  HelperMiddlewares.validateUserData(["overviewIds"]),
  Controllers.bulkFetchOverviews
);

overviewsRouter_v1.get("/:overviewId", Controllers.fetchOverview);

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
