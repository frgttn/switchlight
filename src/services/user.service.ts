import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "../database";
import { userTable } from "../database/schemas";
import { User } from "../types/user.type";

class UserService {
  async findUserByTelegramId(telegramId: number): Promise<User | undefined> {
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.telegramId, telegramId),
    });

    return user;
  }

  async createUser(data: {
    telegramId: number;
    username: string;
  }): Promise<User> {
    const newUser = await db.insert(userTable).values(data).returning();

    return newUser[0];
  }

  async setOutrageGroup(
    telegramId: number,
    outrageGroup: string
  ): Promise<void> {
    await db
      .update(userTable)
      .set({ outrageGroup })
      .where(eq(userTable.telegramId, telegramId));
  }

  async activateUserNotifications(userId: number): Promise<void> {
    await db
      .update(userTable)
      .set({ isActivated: true })
      .where(eq(userTable.id, userId));
  }

  async deactivateUserNotifications(userId: number): Promise<void> {
    await db
      .update(userTable)
      .set({ isActivated: false })
      .where(eq(userTable.id, userId));
  }

  async getUsersEligibleForNotifications(): Promise<User[]> {
    const users = await db.query.userTable.findMany({
      where: and(
        eq(userTable.isActivated, true),
        isNotNull(userTable.outrageGroup)
      ),
    });

    return users;
  }
}

export const userService = new UserService();
