export const Roles = {
  ADMIN: "admin",
  PLAYER: "player",
  SUPPORT: "support",
  DEVELOPER: "developer",
  ACCOUNTANT: "accountant",
} as const;

export type Role = typeof Roles[keyof typeof Roles];