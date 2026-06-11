const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to get auth token
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('pos_token');
  } catch {
    return null;
  }
}

// Fetch wrapper with auth
async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { response: { data: error, status: response.status } };
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return res.data || res;
  },
  getProfile: async () => {
    const res = await fetchApi('/auth/profile');
    return res.data || res;
  },
};

// Store API
export const storeApi = {
  getInfo: () => fetchApi('/store'),
  update: (data: any) =>
    fetchApi('/store', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Orders API
export const ordersApi = {
  getStoreOrders: (storeId: number) => fetchApi(`/orders/store/${storeId}`),
  getOrderDetail: (orderId: number) => fetchApi(`/orders/${orderId}`),
  updateStatus: (orderId: number, status: string, rejectReason?: string) =>
    fetchApi(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reject_reason: rejectReason }),
    }),
  // Backend processPayment does NOT accept a body — only orderId as param
  processPayment: (orderId: number) =>
    fetchApi(`/orders/${orderId}/pay`, {
      method: 'POST',
    }),
};

// Menu API
export const menuApi = {
  getMenu: (storeId: number) => fetchApi(`/menu/store/${storeId}`),
  createCategory: (data: any) =>
    fetchApi('/menu/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: any) =>
    fetchApi(`/menu/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: number) =>
    fetchApi(`/menu/categories/${id}`, { method: 'DELETE' }),
  createProduct: (data: any) =>
    fetchApi('/menu/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) =>
    fetchApi(`/menu/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: number) =>
    fetchApi(`/menu/products/${id}`, { method: 'DELETE' }),
  toggleAvailability: (id: number) =>
    fetchApi(`/menu/products/${id}/toggle-availability`, { method: 'PATCH' }),
};

// Tables API
export const tablesApi = {
  getTables: () => fetchApi('/tables'),
  createTable: (data: any) =>
    fetchApi('/tables', { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (id: number, data: any) =>
    fetchApi(`/tables/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTable: (id: number) =>
    fetchApi(`/tables/${id}`, { method: 'DELETE' }),
  regenerateQR: (id: number) =>
    fetchApi(`/tables/${id}/regenerate-qr`, { method: 'PATCH' }),
  updateStatus: (id: number, status: string) =>
    fetchApi(`/tables/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Notifications API
export const notificationsApi = {
  getAll: () => fetchApi('/notifications'),
  getCount: () => fetchApi('/notifications/count'),
  markRead: (id: number) =>
    fetchApi(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => fetchApi('/notifications/read-all', { method: 'PATCH' }),
};

// ── Standalone function exports (backward compat for useOrders / kitchen) ──

export async function getStoreOrders(storeId: number) {
  const res = await ordersApi.getStoreOrders(storeId);
  return res.data || res;
}

export async function updateOrderStatus(orderId: number, payload: { status: string; reject_reason?: string }) {
  return ordersApi.updateStatus(orderId, payload.status, payload.reject_reason);
}

export async function processPayment(orderId: number) {
  return ordersApi.processPayment(orderId);
}

export async function updateItemStatus(itemId: number, payload: { item_status: string }) {
  return fetchApi(`/orders/items/${itemId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// ── Standalone exports for useTables hook ──

export async function getTables() {
  const res = await tablesApi.getTables();
  return res.data || res;
}

export async function createTable(data: any) {
  return tablesApi.createTable(data);
}

export async function updateTable(id: number, data: any) {
  return tablesApi.updateTable(id, data);
}

export async function deleteTable(id: number) {
  return tablesApi.deleteTable(id);
}

export async function regenerateQR(id: number) {
  return tablesApi.regenerateQR(id);
}

export async function updateTableStatus(id: number, status: string) {
  return tablesApi.updateStatus(id, status);
}

// ── Standalone exports for useMenu hook ──

export async function getMenu(storeId: number) {
  const res = await menuApi.getMenu(storeId);
  return res.data || res;
}

export async function getCategories(storeId: number) {
  const res = await fetchApi(`/menu/store/${storeId}/categories`);
  return res.data || res;
}

export async function createCategory(_storeId: number, data: any) {
  return menuApi.createCategory(data);
}

export async function updateCategory(id: number, data: any) {
  return menuApi.updateCategory(id, data);
}

export async function deleteCategory(id: number) {
  return menuApi.deleteCategory(id);
}

export async function createProduct(data: any) {
  return menuApi.createProduct(data);
}

export async function updateProduct(id: number, data: any) {
  return menuApi.updateProduct(id, data);
}

export async function deleteProduct(id: number) {
  return menuApi.deleteProduct(id);
}

export async function toggleAvailability(id: number) {
  return menuApi.toggleAvailability(id);
}

export async function getMenuOptions() {
  const res = await fetchApi('/menu/options');
  return res.data || res;
}

// ── Standalone exports for login page ──

export async function login(username: string, password: string) {
  return authApi.login(username, password);
}

// ── Standalone exports for settings page ──

export async function getStore() {
  return storeApi.getInfo();
}

export async function updateStore(data: any) {
  return storeApi.update(data);
}

// ── Reviews API (POS admin) ──

export async function getStoreReviews(storeId: number) {
  const res = await fetchApi(`/reviews/store/${storeId}`);
  return res.data || res;
}

export async function toggleReviewVisibility(id: number) {
  return fetchApi(`/reviews/${id}/visibility`, { method: 'PATCH' });
}

// ── Standalone exports for useServiceRequests hook ──

export async function getServiceRequests(storeId: number) {
  const res = await fetchApi(`/service-requests/store/${storeId}`);
  return res.data || res;
}

export async function acknowledgeRequest(id: number) {
  return fetchApi(`/service-requests/${id}/acknowledge`, { method: 'PATCH' });
}

export async function resolveRequest(id: number) {
  return fetchApi(`/service-requests/${id}/resolve`, { method: 'PATCH' });
}

// ── Generic fetch export for users page ──

export { fetchApi as apiFetch };
