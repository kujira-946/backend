import express from "express";

import * as Middlewares from "../middlewares/users.middlewares";
import * as Controllers from "../controllers/users.controllers";
import { checkValidityOfClientData } from "../middlewares/helpers.middlewares";
import { UserUpdateData } from "./../types/users.types";

export const userRouter_v1 = express.Router();

type UserUpdateDataFields = (keyof UserUpdateData)[];
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

// ↓↓↓ Fetch all users. ↓↓↓
userRouter_v1.get("/", Controllers.fetchUsers);

// ↓↓↓ Fetch one user. ↓↓↓
userRouter_v1.get("/:userId", Controllers.fetchUser);

// ↓↓↓ Update a user. ↓↓↓
userRouter_v1.patch(
  "/:userId",
  checkValidityOfClientData(userUpdateData, { requireAllData: false }),
  Controllers.updateUser
);

// ↓↓↓ Update a user's password. ↓↓↓
userRouter_v1.patch(
  "/:userId/update-password",
  checkValidityOfClientData(["oldPassword", "newPassword"]),
  Middlewares.checkOldPasswordMatch,
  Controllers.updateUserPassword
);

// ↓↓↓ Update a user's `totalMoneySavedToDate` field. ↓↓↓
userRouter_v1.patch(
  "/:userId/total-money-saved-to-date",
  checkValidityOfClientData(["totalMoneySavedToDate"]),
  Controllers.updateUserTotalMoneySavedToDate
);

// ↓↓↓ Delete a user. ↓↓↓
userRouter_v1.delete("/:userId", Controllers.deleteUser);
