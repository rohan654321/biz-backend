import { adminListEventCategories } from "../admin.service";

export async function listEventCategories() {
  return adminListEventCategories();
}
