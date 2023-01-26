import { User } from "../types/users.types";

// ========================================================================================= //
// [ EXCLUDING FIELDS FROM RETRIEVED USER OBJECT(S) ] ====================================== //
// ========================================================================================= //

export function excludeFieldFromUsersObject<User, Key extends keyof User>(
  users: User[],
  keys: Key[]
): Omit<User[], Key> {
  users.forEach((user: User) => {
    for (let key of keys) delete user[key];
  });
  return users;
}

export function excludeFieldFromUserObject<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  for (let key of keys) delete user[key];
  return user;
}

export function removePasswordFromUserObject(user: User) {
  return excludeFieldFromUserObject(user, ["password"]);
}
