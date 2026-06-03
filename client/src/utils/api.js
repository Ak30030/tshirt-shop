export const API = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || "http://localhost:5001";

export async function api(path, options) {
  const url = `${API}${path}`;
  return fetch(url, options);
}

export default api;
