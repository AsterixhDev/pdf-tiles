import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { PdfFile, PdfPagePreview } from '@/types/pdf'

interface PdfStore {
  files: PdfFile[]
  activeFileId: string | null
  loading: boolean
  error: string | null
  // Actions
  addFile: (file: PdfFile) => void
  updateFile: (id: string, updates: Partial<PdfFile>) => void
  removeFile: (id: string) => void
  setActiveFile: (id: string | null) => void
  updatePageArrangement: (fileId: string, arrangement: number[]) => void
  updatePagePreviews: (fileId: string, previews: PdfPagePreview[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const usePdfStore = create<PdfStore>()(
  immer((set) => ({
    files: [],
    activeFileId: null,
    loading: false,
    error: null,

    addFile: (file) =>
      set((state) => {
        state.files.push(file)
      }),

    updateFile: (id, updates) =>
      set((state) => {
        const file = state.files.find((f) => f.id === id)
        if (file) {
          Object.assign(file, updates)
        }
      }),

    removeFile: (id) =>
      set((state) => {
        state.files = state.files.filter((f) => f.id !== id)
        if (state.activeFileId === id) {
          state.activeFileId = null
        }
      }),

    setActiveFile: (id) =>
      set((state) => {
        state.activeFileId = id
      }),

    updatePageArrangement: (fileId, arrangement) =>
      set((state) => {
        const file = state.files.find((f) => f.id === fileId)
        if (file) {
          file.arrangement = arrangement
        }
      }),

    updatePagePreviews: (fileId, previews) =>
      set((state) => {
        const file = state.files.find((f) => f.id === fileId)
        if (file) {
          file.previews = previews
        }
      }),

    setLoading: (loading) =>
      set((state) => {
        state.loading = loading
      }),

    setError: (error) =>
      set((state) => {
        state.error = error
      }),
  }))
)
