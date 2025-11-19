import { userTable } from "../database/schemas/index.js";

export type User = typeof userTable.$inferSelect;
