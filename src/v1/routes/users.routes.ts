import express from "express";

import * as Validators from "../validators/users.validators";
import * as Controllers from "../controllers/users.controllers";
import * as Middlewares from "../middlewares/users.middlewares";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const usersRouter_v1 = express.Router();

usersRouter_v1.get("/", Controllers.fetchUsers);

usersRouter_v1.get("/:userId", Controllers.fetchUser);

// ↓↓↓ Update a user (`password` and `totalSavedToDate` are handled by different endpoints). ↓↓↓ //
type UserData = (keyof Validators.UserUpdateValidator)[];
const userData: UserData = [
  "email",
  "username",
  "firstName",
  "lastName",
  "birthday",
  "currency",
  "theme",
  "mobileNumber",
];
usersRouter_v1.patch(
  "/:userId",
  HelperMiddlewares.validateUserData(userData, {
    isHttpPost: false,
  }),
  Controllers.updateUser
);

// ↓↓↓ Update a user's password. ↓↓↓ //
usersRouter_v1.patch(
  "/:userId/update-password",
  HelperMiddlewares.validateUserData(["oldPassword", "newPassword"]),
  Middlewares.checkOldPasswordMatch,
  Controllers.updateUserPassword
);

// ↓↓↓ Update a user's `totalMoneySavedToDate` field. ↓↓↓ //
// TODO : SET UP CRON JOB TO HIT THIS ENDPOINT ON HEROKU
usersRouter_v1.patch(
  "/:userId/update-total-money-saved-to-date",
  HelperMiddlewares.validateUserData(["totalMoneySavedToDate"]),
  Controllers.updateUserTotalMoneySavedToDate
);

usersRouter_v1.delete("/:userId", Controllers.deleteUser);
