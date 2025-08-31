import { ReactElement } from 'react'
import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

function render(ui: ReactElement) {
  const user = userEvent.setup()
  return {
    user,
    ...rtlRender(ui),
  }
}

// Mock file data for tests
export const mockPdfFile: File = new File(['dummy pdf content'], 'test.pdf', {
  type: 'application/pdf',
})

// Mock preview data
export const mockPreview = {
  pageNumber: 1,
  imageUrl: 'data:image/jpeg;base64,dummy',
  width: 595,
  height: 842,
}

// Mock file data
export const mockPdfData = {
  id: 'test-id',
  name: 'test.pdf',
  fileUrl: 'blob:test',
  uploadedAt: '2025-08-31T12:00:00.000Z',
  size: 1024,
  pageCount: 2,
  tags: [],
  previews: [mockPreview, { ...mockPreview, pageNumber: 2 }],
  arrangement: [0, 1],
}

export * from '@testing-library/react'
export { render }
