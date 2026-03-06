const API_BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('count_token')
}

export function setToken(token: string) {
  localStorage.setItem('count_token', token)
}

export function clearToken() {
  localStorage.removeItem('count_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

// Auth
export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse<{ token: string; user: any }>(res)
}

export async function apiGetMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() })
  return handleResponse<any>(res)
}

// Tenants
export async function apiGetTenants() {
  const res = await fetch(`${API_BASE}/tenants`, { headers: authHeaders() })
  return handleResponse<any[]>(res)
}

// Documents
export async function apiGetDocuments(tenantId: string) {
  const res = await fetch(`${API_BASE}/documents?tenantId=${tenantId}`, { headers: authHeaders() })
  return handleResponse<any[]>(res)
}

export async function apiGetDocument(id: string) {
  const res = await fetch(`${API_BASE}/documents/${id}`, { headers: authHeaders() })
  return handleResponse<any>(res)
}

export async function apiUpdateDocumentStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/documents/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  })
  return handleResponse<any>(res)
}

export async function apiUpdateDocumentOcr(id: string, ocrResult: any) {
  const res = await fetch(`${API_BASE}/documents/${id}/ocr`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ ocrResult }),
  })
  return handleResponse<any>(res)
}

// Journal
export async function apiGetJournal(tenantId: string) {
  const res = await fetch(`${API_BASE}/journal?tenantId=${tenantId}`, { headers: authHeaders() })
  return handleResponse<any[]>(res)
}

export async function apiCreateJournalEntry(entry: any) {
  const res = await fetch(`${API_BASE}/journal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(entry),
  })
  return handleResponse<any>(res)
}

// Kontenrahmen
export async function apiGetKontenrahmen() {
  const res = await fetch(`${API_BASE}/kontenrahmen`, { headers: authHeaders() })
  return handleResponse<any[]>(res)
}

// File URLs and upload
export function getFileUrl(tenantId: string, documentId: string, filename: string): string {
  return `${API_BASE}/documents/${tenantId}/${documentId}/${encodeURIComponent(filename)}`
}

export function uploadFile(
  file: File,
  tenantId: string,
  documentId: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('tenantId', tenantId)
    formData.append('documentId', documentId)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        try {
          const body = JSON.parse(xhr.responseText)
          reject(new Error(body.error || `Upload fehlgeschlagen (${xhr.status})`))
        } catch {
          reject(new Error(`Upload fehlgeschlagen (${xhr.status})`))
        }
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Netzwerkfehler beim Upload')))
    xhr.addEventListener('abort', () => reject(new Error('Upload abgebrochen')))

    xhr.open('POST', `${API_BASE}/documents/upload`)
    const token = getToken()
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(formData)
  })
}
