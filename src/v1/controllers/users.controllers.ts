import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as Validators from "../validators/users.validators";
import * as Helpers from "../helpers/users.helpers";
import * as HttpHelpers from "../helpers/http.helpers";
import { RequestWithUserPasswords } from "../types/users.types";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL USERS ] ===================================================================== //
// ========================================================================================= //

export async function fetchUsers(_: Request, response: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });
    const safeUsers = Helpers.generateSafeUsers(users);

    return response.status(HttpStatusCodes.OK).json({ data: safeUsers });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("accounts"),
    });
  }
}

// ========================================================================================= //
// [ FETCH ONE USER ] ====================================================================== //
// ========================================================================================= //

export async function fetchUser(
  request: Request<{ userId: string }>,
  response: Response
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });
    const safeUser = Helpers.generateSafeUser(user);

    return response.status(HttpStatusCodes.OK).json({ data: safeUser });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateFetchError("account", false),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A USER ] ======================================================================= //
// [ `password` & `totalMoneySavedToDate` UPDATE IS HANDLED BY OTHER CONTROLLERS ] ========= //
// ========================================================================================= //

export async function updateUser(
  request: Request<{ userId: string }, {}, Validators.UserUpdateValidator>,
  response: Response
) {
  try {
    const userUpdateData: Validators.UserUpdateValidator = {
      email: request.body.email,
      username: request.body.username?.toLowerCase(),
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      birthday: request.body.birthday,
      currency: request.body.currency,
      theme: request.body.theme,
      onboarded: request.body.onboarded,
      mobileNumber: request.body.mobileNumber,
    };

    const user = await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data: userUpdateData,
    });
    const safeUser = Helpers.generateSafeUser(user);

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "account"),
      data: safeUser,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "account", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A USER'S PASSWORD ] ============================================================ //
// ========================================================================================= //

export async function updateUserPassword(
  request: RequestWithUserPasswords,
  response: Response
) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      request.body.newPassword,
      saltRounds
    );
    const userUpdatePasswordData: Validators.UserUpdatePasswordValidator = {
      password: hashedPassword,
    };

    await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data: userUpdatePasswordData,
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "password"),
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "password", true),
    });
  }
}

// ========================================================================================= //
// [ DELETE A USER ] ======================================================================== //
// ========================================================================================= //

export async function deleteUser(
  request: Request<{ userId: string }>,
  response: Response
) {
  try {
    await prisma.user.delete({
      where: { id: Number(request.params.userId) },
    });

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("delete", "account"),
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "account", true),
    });
  }
}
