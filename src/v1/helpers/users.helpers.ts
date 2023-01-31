import { User } from "@prisma/client";

// ========================================================================================= //
// [ EXCLUDING FIELDS FROM RETRIEVED USER OBJECT(S) ] ====================================== //
// ========================================================================================= //

export function excludeFieldFromUsersObject<User, Field extends keyof User>(
  users: User[],
  fields: Field[]
): Omit<User[], Field> {
  users.forEach((user: User) => {
    for (let field of fields) delete user[field];
  });
  return users;
}

export function excludeFieldFromUserObject<User, Field extends keyof User>(
  user: User,
  fields: Field[]
): Omit<User, Field> {
  for (let field of fields) delete user[field];
  return user;
}

export function removePasswordFromUserObject(user: User) {
  return excludeFieldFromUserObject(user, ["password"]);
}
