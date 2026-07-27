"use server";
import { currentUser } from "@clerk/nextjs/server";
import { generateServerUserToken } from "../stream/server-client";

export const tokenProvider = async () => {
  const user = await currentUser();
  if (!user) throw new Error("[Stream]: user is not logged in");

  return generateServerUserToken(user.id);
};
