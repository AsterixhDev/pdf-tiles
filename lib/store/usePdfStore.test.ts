import { describe, it, expect } from 'vitest'
import { usePdfStore } from '@/lib/store/usePdfStore'
import { mockPdfData } from '@/test/test-utils'

describe('usePdfStore', () => {
  it('adds a file', () => {
    const store = usePdfStore.getState()
    store.addFile(mockPdfData)
    expect(store.files).toContainEqual(mockPdfData)
  })

  it('removes a file', () => {
    const store = usePdfStore.getState()
    store.addFile(mockPdfData)
    store.removeFile(mockPdfData.id)
    expect(store.files).not.toContainEqual(mockPdfData)
  })

  it('updates file arrangement', () => {
    const store = usePdfStore.getState()
    store.addFile(mockPdfData)
    const newArrangement = [1, 0]
    store.updatePageArrangement(mockPdfData.id, newArrangement)
    const updatedFile = store.files.find(f => f.id === mockPdfData.id)
    expect(updatedFile?.arrangement).toEqual(newArrangement)
  })

  it('sets active file', () => {
    const store = usePdfStore.getState()
    store.addFile(mockPdfData)
    store.setActiveFile(mockPdfData.id)
    expect(store.activeFileId).toBe(mockPdfData.id)
  })

  it('updates file previews', () => {
    const store = usePdfStore.getState()
    store.addFile(mockPdfData)
    const newPreviews = [{ ...mockPdfData.previews[0], imageUrl: 'new-url' }]
    store.updatePagePreviews(mockPdfData.id, newPreviews)
    const updatedFile = store.files.find(f => f.id === mockPdfData.id)
    expect(updatedFile?.previews).toEqual(newPreviews)
  })

  it('handles error state', () => {
    const store = usePdfStore.getState()
    const errorMessage = 'Test error'
    store.setError(errorMessage)
    expect(store.error).toBe(errorMessage)
  })

  it('handles loading state', () => {
    const store = usePdfStore.getState()
    store.setLoading(true)
    expect(store.loading).toBe(true)
    store.setLoading(false)
    expect(store.loading).toBe(false)
  })
})
