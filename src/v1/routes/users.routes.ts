import express from "express";

import * as Middlewares from "../middlewares/users.middlewares";
import * as Controllers from "../controllers/users.controllers";
import { checkValidityOfClientRequestMiddleware } from "../middlewares/helpers.middlewares";

export const userRouter_v1 = express.Router();

// ↓↓↓ Fetch all users. ↓↓↓
userRouter_v1.get("/", Controllers.fetchUsersController);

// ↓↓↓ Fetch one user. ↓↓↓
userRouter_v1.get("/:userId", Controllers.fetchUserController);

// ↓↓↓ Update a user. ↓↓↓
userRouter_v1.patch(
  "/:userId",
  checkValidityOfClientRequestMiddleware(
    [
      "email",
      "username",
      "firstName",
      "lastName",
      "birthday",
      "currency",
      "theme",
      "mobileNumber",
    ],
    { requireAllInputs: false }
  ),
  Controllers.updateUserController
);

// ↓↓↓ Update a user's password. ↓↓↓
userRouter_v1.patch(
  "/:userId/update-password",
  checkValidityOfClientRequestMiddleware(["oldPassword", "newPassword"]),
  Middlewares.checkOldPasswordMatchMiddleware,
  Controllers.updateUserPasswordController
);

// ↓↓↓ Update a user's total money saved to date. ↓↓↓
userRouter_v1.patch(
  "/:userId/total-money-saved-to-date",
  checkValidityOfClientRequestMiddleware(["totalMoneySavedToDate"]),
  Controllers.updateUserTotalMoneySavedToDateController
);

// ↓↓↓ Delete a user. ↓↓↓
userRouter_v1.delete("/:userId", Controllers.deleteUserController);
