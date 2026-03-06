<script setup lang="ts">
import { ref } from 'vue'
import { useDocumentStore } from '@/stores/documents'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { uploadFile } from '@/services/api'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [value: boolean]; uploaded: [] }>()

const documentStore = useDocumentStore()
const authStore = useAuthStore()
const notifications = useNotificationStore()
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const uploadError = ref<string | null>(null)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    selectFile(files[0])
  }
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectFile(input.files[0])
  }
}

function selectFile(file: File) {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
  if (!validTypes.includes(file.type)) {
    alert('Bitte nur PDF, JPG oder PNG Dateien hochladen.')
    return
  }
  uploadError.value = null
  selectedFile.value = file
  if (file.type.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
  }
}

async function doUpload() {
  if (!selectedFile.value || !authStore.currentTenant) return
  isUploading.value = true
  uploadProgress.value = 0
  uploadError.value = null

  const file = selectedFile.value
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
  const documentId = `doc-${Date.now()}`
  const tenantId = authStore.currentTenant.id

  try {
    await uploadFile(file, tenantId, documentId, (percent) => {
      uploadProgress.value = percent
    })

    uploadProgress.value = 100
    // Document was created by backend during upload, refresh from API
    await documentStore.refreshDocument(documentId)

    setTimeout(() => {
      isUploading.value = false
      selectedFile.value = null
      previewUrl.value = null
      uploadProgress.value = 0
      emit('update:visible', false)
      emit('uploaded')
    }, 300)
  } catch (err) {
    isUploading.value = false
    uploadProgress.value = 0
    uploadError.value = err instanceof Error ? err.message : 'Upload fehlgeschlagen'
    notifications.error('Upload fehlgeschlagen', uploadError.value!)
  }
}

function close() {
  if (isUploading.value) return
  selectedFile.value = null
  previewUrl.value = null
  uploadError.value = null
  emit('update:visible', false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal">
        <div class="modal__header">
          <h3>Beleg hochladen</h3>
          <button class="modal__close" @click="close" :disabled="isUploading">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal__body">
          <div
            v-if="!selectedFile"
            class="dropzone"
            :class="{ 'dropzone--active': isDragging }"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <i class="pi pi-cloud-upload dropzone__icon"></i>
            <p class="dropzone__text">Datei hierher ziehen</p>
            <p class="dropzone__hint">oder</p>
            <div class="dropzone__buttons">
              <label class="dropzone__btn">
                Datei auswählen
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="onFileSelect" hidden />
              </label>
              <label class="dropzone__btn dropzone__btn--camera">
                <i class="pi pi-camera"></i> Foto aufnehmen
                <input type="file" accept="image/*" capture="environment" @change="onFileSelect" hidden />
              </label>
            </div>
            <p class="dropzone__formats">PDF, JPG, PNG bis 10 MB</p>
          </div>

          <div v-else class="preview">
            <div class="preview__file">
              <div v-if="previewUrl" class="preview__image">
                <img :src="previewUrl" alt="Vorschau" />
              </div>
              <div v-else class="preview__pdf">
                <i class="pi pi-file-pdf"></i>
                <span>{{ selectedFile.name }}</span>
              </div>
            </div>

            <div v-if="uploadError" class="upload-error">
              <i class="pi pi-exclamation-triangle"></i>
              {{ uploadError }}
            </div>

            <div v-if="isUploading" class="progress">
              <div class="progress__bar">
                <div class="progress__fill" :style="{ width: Math.min(uploadProgress, 100) + '%' }"></div>
              </div>
              <span class="progress__text">{{ uploadProgress < 100 ? 'Wird hochgeladen...' : 'OCR wird durchgeführt...' }}</span>
            </div>

            <div v-else class="preview__actions">
              <button class="btn btn--secondary" @click="selectedFile = null; previewUrl = null; uploadError = null">
                Andere Datei
              </button>
              <button class="btn btn--primary" @click="doUpload">
                <i class="pi pi-upload"></i> Hochladen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal__header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1f2937;
}

.modal__close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.modal__body {
  padding: 1.5rem;
}

.dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropzone--active {
  border-color: #0B3D91;
  background: #f0f4ff;
}

.dropzone__icon {
  font-size: 2.5rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
}

.dropzone__text {
  font-size: 1rem;
  color: #4b5563;
  margin: 0 0 0.25rem;
}

.dropzone__hint {
  color: #9ca3af;
  font-size: 0.85rem;
  margin: 0.5rem 0;
}

.dropzone__buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.dropzone__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #0B3D91;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.dropzone__btn--camera {
  background: #4b5563;
}

.dropzone__formats {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

.preview__image {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.preview__image img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.preview__pdf {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.preview__pdf i {
  font-size: 2rem;
  color: #dc2626;
}

.preview__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.upload-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.progress {
  text-align: center;
}

.progress__bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress__fill {
  height: 100%;
  background: #0B3D91;
  border-radius: 3px;
  transition: width 0.2s ease;
}

.progress__text {
  font-size: 0.85rem;
  color: #6b7280;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn--primary {
  background: #0B3D91;
  color: white;
}

.btn--primary:hover {
  background: #092f73;
}

.btn--secondary {
  background: #f3f4f6;
  color: #4b5563;
}

.btn--secondary:hover {
  background: #e5e7eb;
}
</style>
