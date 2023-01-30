import express from "express";

import * as Types from "../types/users.types";
import * as Middlewares from "../middlewares/users.middlewares";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/users.controllers";

export const userRouter_v1 = express.Router();

userRouter_v1.get("/", Controllers.fetchUsers);

userRouter_v1.get("/:userId", Controllers.fetchUser);

// ↓↓↓ Update a user (`password` and `totalSavedToDate` are handled by different endpoints). ↓↓↓
type UserDataFields = (keyof Types.UserUpdateData)[];
const userDataFields: UserDataFields = [
  "email",
  "username",
  "firstName",
  "lastName",
  "birthday",
  "currency",
  "theme",
  "mobileNumber",
];

userRouter_v1.patch(
  "/:userId",
  HelperMiddlewares.checkValidityOfUserInput(userDataFields, {
    requireAllData: false,
  }),
  Controllers.updateUser
);

// ↓↓↓ Update a user's password. ↓↓↓
userRouter_v1.patch(
  "/:userId/update-password",
  HelperMiddlewares.checkValidityOfUserInput(["oldPassword", "newPassword"]),
  Middlewares.checkOldPasswordMatch,
  Controllers.updateUserPassword
);

// ↓↓↓ Update a user's `totalMoneySavedToDate` field. ↓↓↓
// TODO : SET UP CRON JOB TO HIT THIS ENDPOINT ON HEROKU
userRouter_v1.patch(
  "/:userId/update-total-money-saved-to-date",
  HelperMiddlewares.checkValidityOfUserInput(["totalMoneySavedToDate"]),
  Controllers.updateUserTotalMoneySavedToDate
);

userRouter_v1.delete("/:userId", Controllers.deleteUser);
