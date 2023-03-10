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
    const users: Validators.UserRelationsValidator[] =
      await prisma.user.findMany({
        orderBy: { id: "asc" },
        include: {
          overview: { include: { groups: true } },
          logbooks: { include: { entries: { include: { purchases: true } } } },
        },
      });
    const usersWithoutPassword = Helpers.excludeFieldFromUsersObject(users, [
      "password",
    ]);
    return response
      .status(HttpStatusCodes.OK)
      .json({ data: usersWithoutPassword });
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
    const user: Validators.UserRelationsValidator =
      await prisma.user.findUniqueOrThrow({
        where: { id: Number(request.params.userId) },
        include: {
          overview: { include: { groups: true } },
          logbooks: { include: { entries: { include: { purchases: true } } } },
        },
      });
    const userWithoutPassword = Helpers.removePasswordFromUserObject(user);
    return response
      .status(HttpStatusCodes.OK)
      .json({ data: userWithoutPassword });
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
      mobileNumber: request.body.mobileNumber,
    };

    const user: Validators.UserRelationsValidator = await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data: userUpdateData,
      include: {
        overview: { include: { groups: true } },
        logbooks: { include: { entries: { include: { purchases: true } } } },
      },
    });
    const userWithoutPassword = Helpers.removePasswordFromUserObject(user);
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "account"),
      data: userWithoutPassword,
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
      include: {
        overview: { include: { groups: true } },
        logbooks: { include: { entries: { include: { purchases: true } } } },
      },
    });
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage("update", "password"),
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage("update", "password", true),
    });
  }
}

// ========================================================================================= //
// [ UPDATE A USER'S `totalMoneySavedToDate` FIELD ] ======================================= //
// ========================================================================================= //

export async function updateUserTotalMoneySavedToDate(
  request: Request<
    { userId: string },
    {},
    Validators.UserTotalMoneySavedToDateValidator
  >,
  response: Response
) {
  try {
    const totalMoneySavedToDateData: Validators.UserTotalMoneySavedToDateValidator =
      {
        totalMoneySavedToDate: request.body.totalMoneySavedToDate,
      };

    const user: Validators.UserRelationsValidator = await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data: totalMoneySavedToDateData,
      include: {
        overview: { include: { groups: true } },
        logbooks: { include: { entries: { include: { purchases: true } } } },
      },
    });

    const { totalMoneySavedToDate } =
      Helpers.removePasswordFromUserObject(user);

    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: HttpHelpers.generateCudMessage(
        "update",
        "total money saved to date"
      ),
      data: totalMoneySavedToDate,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "Failed to update your total money saved to date. Please refresh the page and try again.",
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
      data: null,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: HttpHelpers.generateCudMessage("delete", "account", true),
    });
  }
}
