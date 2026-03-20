export interface PromotionPackageItem {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  userCount: number;
  duration: string;
  durationDays: number;
  categories: string[];
  recommended: boolean;
  isActive: boolean;
  userType: string;
  order: number;
}

const packagesStore: PromotionPackageItem[] = [];

export function listPromotionPackages(): PromotionPackageItem[] {
  return [...packagesStore].sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));
}

export function createPromotionPackage(input: Partial<PromotionPackageItem>): PromotionPackageItem {
  const item: PromotionPackageItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(input.name ?? "").trim(),
    description: String(input.description ?? "").trim(),
    price: Number(input.price ?? 0),
    features: Array.isArray(input.features) ? input.features.map(String) : [],
    userCount: Number(input.userCount ?? 0),
    duration: String(input.duration ?? ""),
    durationDays: Number(input.durationDays ?? 0),
    categories: Array.isArray(input.categories) ? input.categories.map(String) : [],
    recommended: !!input.recommended,
    isActive: input.isActive !== false,
    userType: String(input.userType ?? "BOTH"),
    order: Number(input.order ?? 0),
  };
  packagesStore.push(item);
  return item;
}

export function updatePromotionPackage(id: string, input: Partial<PromotionPackageItem>): PromotionPackageItem | null {
  const idx = packagesStore.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const current = packagesStore[idx];
  const updated: PromotionPackageItem = {
    ...current,
    ...input,
    price: input.price !== undefined ? Number(input.price) : current.price,
    userCount: input.userCount !== undefined ? Number(input.userCount) : current.userCount,
    durationDays: input.durationDays !== undefined ? Number(input.durationDays) : current.durationDays,
    features: input.features !== undefined ? (Array.isArray(input.features) ? input.features.map(String) : []) : current.features,
    categories:
      input.categories !== undefined ? (Array.isArray(input.categories) ? input.categories.map(String) : []) : current.categories,
  };
  packagesStore[idx] = updated;
  return updated;
}

export function deletePromotionPackage(id: string): boolean {
  const idx = packagesStore.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  packagesStore.splice(idx, 1);
  return true;
}
