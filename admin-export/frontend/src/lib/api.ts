const BASE = "/api";

function getToken() {
  return localStorage.getItem("admin_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Error desconocido");
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    req<{ token: string }>("POST", "/auth/login", { email, password }),

  getProducts: () => req<Product[]>("GET", "/products"),
  getStats: () => req<Stats>("GET", "/products/stats"),
  getCategories: () => req<string[]>("GET", "/categories"),

  createProduct: (data: ProductInput) =>
    req<Product>("POST", "/products", data),
  updateProduct: (id: number, data: Partial<ProductInput>) =>
    req<Product>("PUT", `/products/${id}`, data),
  deleteProduct: (id: number) =>
    req<{ success: boolean }>("DELETE", `/products/${id}`),

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${BASE}/upload`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error("Error al subir imagen");
    const data = await res.json();
    return data.url as string;
  },
};

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  created_at: string;
}

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
}

export interface Stats {
  totalProducts: number;
  totalCategories: number;
  priceRange: { min: number; max: number };
}
