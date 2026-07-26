import type { User } from "@/lib/types";

export interface IUserRepository {
  findAll(): User[];
  findById(id: number): User | undefined;
  findByUsername(username: string): User | undefined;
  create(input: {
    username: string;
    passwordHash: string;
    isAdmin: number;
    mustChangePassword: number;
  }): User;
  deleteById(id: number): void;
  updatePassword(id: number, passwordHash: string): void;
  setMustChangePassword(id: number, value: number): void;
}
