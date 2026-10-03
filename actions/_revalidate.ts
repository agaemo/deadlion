"use server";

import { revalidatePath } from "next/cache";

export function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/gantt");
}
