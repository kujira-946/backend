import express from "express";

import * as Types from "../types/users.types";
import * as Middlewares from "../middlewares/users.middlewares";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/users.controllers";

export const userRouter_v1 = express.Router();

// ↓↓↓ Fetch all users. ↓↓↓
userRouter_v1.get("/", Controllers.fetchUsers);

// ↓↓↓ Fetch one user. ↓↓↓
userRouter_v1.get("/:username", Controllers.fetchUser);

// ↓↓↓ Update a user (`password` and `totalSavedToDate` are handled by different endpoints). ↓↓↓
type UserUpdateDataFields = (keyof Types.UserUpdateData)[];
const userUpdateData: UserUpdateDataFields = [
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
  "/:username",
  HelperMiddlewares.checkValidityOfUserInput(userUpdateData, {
    requireAllData: false,
  }),
  Controllers.updateUser
);

// ↓↓↓ Update a user's password. ↓↓↓
userRouter_v1.patch(
  "/:username/update-password",
  HelperMiddlewares.checkValidityOfUserInput(["oldPassword", "newPassword"]),
  Middlewares.checkOldPasswordMatch,
  Controllers.updateUserPassword
);

// ↓↓↓ Update a user's `totalMoneySavedToDate` field. ↓↓↓
userRouter_v1.patch(
  "/:username/total-money-saved-to-date",
  HelperMiddlewares.checkValidityOfUserInput(["totalMoneySavedToDate"]),
  Controllers.updateUserTotalMoneySavedToDate
);

// ↓↓↓ Delete a user. ↓↓↓
userRouter_v1.delete("/:username", Controllers.deleteUser);
