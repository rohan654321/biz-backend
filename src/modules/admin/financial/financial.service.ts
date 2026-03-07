export async function listTransactions(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const total = 0;
  return { data: [], pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function listPayments(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
}

export async function listSubscriptions(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
}

export async function listInvoices(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
}

export async function listPromotionPackages(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
}
