export function getFileUrl(tenantId: string, documentId: string, filename: string): string {
  return `/api/documents/${tenantId}/${documentId}/${encodeURIComponent(filename)}`
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

    xhr.open('POST', '/api/documents/upload')
    xhr.send(formData)
  })
}
