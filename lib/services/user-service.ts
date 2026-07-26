import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { User } from "@/lib/types";
import type { Result } from "@/lib/types";
import type { IUserRepository } from "@/lib/db/repositories/interfaces/user-repository";

type Deps = { userRepo: IUserRepository };

export function createUserService({ userRepo }: Deps) {
  return {
    listUsers(): User[] {
      return userRepo.findAll();
    },

    createUser(username: string, password: string): Result<User> {
      if (userRepo.findByUsername(username)) {
        return { ok: false, error: "そのユーザー名はすでに使用されています" };
      }
      const passwordHash = hashPassword(password);
      const user = userRepo.create({
        username,
        passwordHash,
        isAdmin: 0,
        mustChangePassword: 1,
      });
      return { ok: true, data: user };
    },

    deleteUser(id: number, requesterId: number): Result<void> {
      if (id === requesterId) {
        return { ok: false, error: "自分自身は削除できません" };
      }
      if (!userRepo.findById(id)) {
        return { ok: false, error: "ユーザーが見つかりません" };
      }
      userRepo.deleteById(id);
      return { ok: true, data: undefined };
    },

    changePassword(
      userId: number,
      currentPassword: string,
      newPassword: string,
    ): Result<void> {
      const user = userRepo.findById(userId);
      if (!user) {
        return { ok: false, error: "ユーザーが見つかりません" };
      }
      if (!verifyPassword(currentPassword, user.passwordHash)) {
        return { ok: false, error: "現在のパスワードが正しくありません" };
      }
      userRepo.updatePassword(userId, hashPassword(newPassword));
      userRepo.setMustChangePassword(userId, 0);
      return { ok: true, data: undefined };
    },
  };
}
