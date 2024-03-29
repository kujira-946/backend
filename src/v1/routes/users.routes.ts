import express from "express";

import * as Validators from "../validators/users.validators";
import * as Controllers from "../controllers/users.controllers";
import * as Middlewares from "../middlewares/users.middlewares";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const usersRouter_v1 = express.Router();

usersRouter_v1.get("/", Controllers.fetchUsers);

usersRouter_v1.get("/:userId", Controllers.fetchUser);

// ↓↓↓ Update a user (password update in different endpoint). ↓↓↓ //
type UpdateData = (keyof Validators.UserUpdateValidator)[];
const updateData: UpdateData = [
  "email",
  "username",
  "firstName",
  "lastName",
  "birthday",
  "currency",
  "mobileNumber",
  "onboarded",
  "theme",
];
usersRouter_v1.patch(
  "/:userId",
  HelperMiddlewares.validateUserData(updateData, {
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

usersRouter_v1.delete("/:userId", Controllers.deleteUser);
