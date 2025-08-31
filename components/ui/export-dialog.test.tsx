import { describe, it, expect, vi } from 'vitest'
import { render, screen, mockPdfData } from '@/test/test-utils'
import { ExportDialog } from '@/components/ui/export-dialog'
import { usePdfStore } from '@/lib/store/usePdfStore'

// Mock the PDF store
vi.mock('@/lib/store/usePdfStore', () => ({
  usePdfStore: vi.fn(() => ({
    files: [mockPdfData],
  })),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ExportDialog', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders export dialog when open', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={() => {}}
        fileId={mockPdfData.id}
      />
    )

    expect(screen.getByText(/Export PDF/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Filename/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Quality/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <ExportDialog
        open={false}
        onOpenChange={() => {}}
        fileId={mockPdfData.id}
      />
    )

    expect(screen.queryByText(/Export PDF/i)).not.toBeInTheDocument()
  })

  it('sets default filename from PDF data', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={() => {}}
        fileId={mockPdfData.id}
      />
    )

    const filenameInput = screen.getByLabelText(/Filename/i) as HTMLInputElement
    expect(filenameInput.value).toBe(mockPdfData.name)
  })

  it('allows changing quality settings', async () => {
    const { user } = render(
      <ExportDialog
        open={true}
        onOpenChange={() => {}}
        fileId={mockPdfData.id}
      />
    )

    const highQualityOption = screen.getByLabelText(/High/i)
    await user.click(highQualityOption)
    expect(highQualityOption).toBeChecked()
  })

  it('shows export progress', async () => {
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob()),
      })
    )

    const { user } = render(
      <ExportDialog
        open={true}
        onOpenChange={() => {}}
        fileId={mockPdfData.id}
      />
    )

    const exportButton = screen.getByRole('button', { name: /Export/i })
    await user.click(exportButton)

    expect(screen.getByText(/Generating PDF/i)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
