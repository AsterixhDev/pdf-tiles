import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { FileUploadDialog } from '@/components/ui/file-upload-dialog'

// Mock the useFileUpload hook
const mockUseFileUpload = vi.fn(() => ({
  uploadFile: vi.fn(),
  isUploading: false,
  progress: 0,
}))

vi.mock('@/lib/hooks/useFileUpload', () => ({
  useFileUpload: () => mockUseFileUpload(),
}))

describe('FileUploadDialog', () => {
  it('renders upload dialog when open', () => {
    render(
      <FileUploadDialog
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(screen.getByText(/Upload PDF/i)).toBeInTheDocument()
    expect(screen.getByText(/Drop a PDF file here/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <FileUploadDialog
        open={false}
        onOpenChange={() => {}}
      />
    )

    expect(screen.queryByText(/Upload PDF/i)).not.toBeInTheDocument()
  })

  it('shows progress bar when uploading', () => {
    // Override the mock for this test
    mockUseFileUpload.mockReturnValue({
      uploadFile: vi.fn(),
      isUploading: true,
      progress: 50,
    })

    render(
      <FileUploadDialog
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(screen.getByText(/Uploading file/i)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
