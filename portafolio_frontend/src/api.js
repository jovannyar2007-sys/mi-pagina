const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path) {
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function readApiJson(response) {
  const contentType = response.headers.get('content-type') || '';
  const body = await response.text();

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(
      `La API respondió con HTML u otro formato (HTTP ${response.status}) en vez de JSON. ` +
      'Comprueba VITE_API_URL y verifica que el backend actualizado esté iniciado o desplegado.'
    );
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`La API devolvió JSON inválido (HTTP ${response.status}).`);
  }
}
