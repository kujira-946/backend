import express from "express";

import * as Controllers from "../controllers/purchases.controllers";
import * as MiddlewareHelpers from "../middlewares/helpers.middlewares";

const purchasesRouter_v1 = express.Router();

purchasesRouter_v1.get("/");

purchasesRouter_v1.get("/:purchaseId");

purchasesRouter_v1.post("/");

purchasesRouter_v1.patch("/:purchaseId");

purchasesRouter_v1.delete("/:purchaseId");
