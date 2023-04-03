import { PrismaClient, Purchase } from "@prisma/client";
import { Request, Response } from "express";

import * as HttpHelpers from "../helpers/http.helpers";
import * as Validators from "../validators/onboarding.validators";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ ONBOARD NEW USER ] ==================================================================== //
// ========================================================================================= //

export async function onboardNewUser(
  request: Request<{}, {}, Validators.OnboardingValidator>,
  response: Response
) {
  try {
    const overview = await prisma.overview.create({
      data: request.body.overview,
    });

    const recurringOverviewGroup = await prisma.overviewGroup.create({
      data: { ...request.body.recurringOverviewGroup, overviewId: overview.id },
    });

    const incomingOverviewGroup = await prisma.overviewGroup.create({
      data: { ...request.body.incomingOverviewGroup, overviewId: overview.id },
    });

    const recurringPurchasesData = request.body.recurringPurchases.map(
      (purchase: Validators.PurchaseCreateValidator) => {
        return {
          ...purchase,
          overviewGroupId: recurringOverviewGroup.id,
        };
      }
    );
    const recurringPurchases = await prisma.purchase.createMany({
      data: recurringPurchasesData,
      skipDuplicates: true,
    });

    const incomingPurchasesData = request.body.incomingPurchases.map(
      (purchase: Validators.PurchaseCreateValidator) => {
        return {
          ...purchase,
          overviewGroupId: incomingOverviewGroup.id,
        };
      }
    );
    const incomingPurchases = await prisma.purchase.createMany({
      data: incomingPurchasesData,
      skipDuplicates: true,
    });

    return HttpHelpers.respondWithSuccess(response, "created", {
      body: HttpHelpers.generateCudMessage("create", "onboarded user content"),
      data: {
        overview,
        recurringOverviewGroup,
        incomingOverviewGroup,
        recurringPurchases,
        incomingPurchases,
      },
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: HttpHelpers.generateCudMessage(
        "create",
        "onboarded user content",
        true
      ),
    });
  }
}
