export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { db } = await import("@/lib/db");
    const { runMigrations } = await import("@/lib/db/migrate");
    const { seedUser } = await import("@/lib/db/seed-user");

    runMigrations(db);
    seedUser(db);
  }
}
