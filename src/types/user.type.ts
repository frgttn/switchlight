import { userTable } from "../database/schemas";

export type User = typeof userTable.$inferSelect;
