export {};

export type Roles = "user" | "admin" | "super_admin";

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles;
        };
    }
}
