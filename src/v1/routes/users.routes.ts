import express from "express";

import * as Validators from "../validators/users.validators";
import * as Middlewares from "../middlewares/users.middlewares";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/users.controllers";

export const usersRouter_v1 = express.Router();

usersRouter_v1.get("/", Controllers.fetchUsers);

usersRouter_v1.get("/:userId", Controllers.fetchUser);

// ↓↓↓ Update a user (`password` and `totalSavedToDate` are handled by different endpoints). ↓↓↓
type UserDataFields = (keyof Validators.UserUpdateValidator)[];
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

usersRouter_v1.patch(
  "/:userId",
  HelperMiddlewares.checkValidityOfUserInput(userDataFields, {
    requireAllData: false,
  }),
  Controllers.updateUser
);

// ↓↓↓ Update a user's password. ↓↓↓
usersRouter_v1.patch(
  "/:userId/update-password",
  HelperMiddlewares.checkValidityOfUserInput(["oldPassword", "newPassword"]),
  Middlewares.checkOldPasswordMatch,
  Controllers.updateUserPassword
);

// ↓↓↓ Update a user's `totalMoneySavedToDate` field. ↓↓↓
// TODO : SET UP CRON JOB TO HIT THIS ENDPOINT ON HEROKU
usersRouter_v1.patch(
  "/:userId/update-total-money-saved-to-date",
  HelperMiddlewares.checkValidityOfUserInput(["totalMoneySavedToDate"]),
  Controllers.updateUserTotalMoneySavedToDate
);

usersRouter_v1.delete("/:userId", Controllers.deleteUser);
