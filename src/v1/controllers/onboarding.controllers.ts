import { PrismaClient } from "@prisma/client";
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

    const recurringPurchases = await prisma.purchase.createMany({
      data: {
        ...request.body.recurringPurchases,
        overviewGroupId: recurringOverviewGroup.id,
      },
      skipDuplicates: true,
    });

    const incomingPurchases = await prisma.purchase.createMany({
      data: {
        ...request.body.incomingPurchases,
        overviewGroupId: incomingOverviewGroup.id,
      },
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
