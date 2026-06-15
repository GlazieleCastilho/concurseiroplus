import { auth } from "@clerk/nextjs/server";
import type { Roles } from "@/@types/clerk";

export const CheckRole = async (role: Roles) => {
    const {sessionClaims} = await auth();
    return sessionClaims?.metadata?.role === role;
};