import { User } from "@prisma/client";
import { Request } from "express";

import { UserLoginValidator } from "../validators/auth.validators";

export type LoginUserRequest = Request<{}, {}, UserLoginValidator>;

export type RequestWithFoundUser<
  ExtendedParams = void,
  ExtendedResponse = void,
  ExtendedRequest = void
> = {
  foundUser: User;
} & Request<ExtendedParams, ExtendedResponse, ExtendedRequest>;
