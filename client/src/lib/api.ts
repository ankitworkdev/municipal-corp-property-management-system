export async function api(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  return res.json();
}

export async function apiPost(path: string, body: any) {
  return api(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPut(path: string, body: any) {
  return api(path, { method: "PUT", body: JSON.stringify(body) });
}
