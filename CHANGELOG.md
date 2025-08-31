# Changelog

## 2025-08-31 - PDF Export Implementation (SHA: current)

### Files Changed
- Added app/api/export/route.ts for PDF generation endpoint
- Added components/ui/export-dialog.tsx for export configuration
- Added components/ui/radio-group.tsx
- Updated components/ui/gallery-grid.tsx with export functionality

### Summary
Implemented PDF export functionality with quality presets and page reordering support.

### Steps
1. Created PDF export API endpoint using pdf-lib
2. Added export dialog with filename and quality options
3. Added export button to gallery actions
4. Integrated export with page arrangement
5. Added progress feedback for export process

### Commands Run
```bash
pnpm dlx shadcn@latest add radio-group
```

### Tests Run
No tests implemented yet.

### Migration Notes
N/A

## 2025-08-31 - Page Reordering and Manual Add Implementation (SHA: ecaa3be)

### Files Changed
- Added components/ui/page-reorder-dialog.tsx for drag-and-drop page reordering
- Added components/ui/manual-add-dialog.tsx for adding PDFs by URL
- Updated components/ui/gallery-grid.tsx with reordering functionality
- Updated app/page.tsx with new UI for manual add feature
- Added @dnd-kit packages for drag-and-drop functionality

### Summary
Implemented page reordering functionality and manual PDF addition by URL.

### Steps
1. Added drag-and-drop page reordering using @dnd-kit
2. Created page reorder dialog with preview grid
3. Added manual PDF addition by URL with form validation
4. Updated main page UI with dropdown menu for add options
5. Integrated both features into the gallery grid

### Commands Run
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Tests Run
No tests implemented yet.

### Migration Notes
N/A

## 2025-08-31 - Gallery and Reader Implementation (SHA: 0342b04)

### Files Changed
- Created components/ui/gallery-grid.tsx
- Created components/ui/reader-modal.tsx
- Added Lucide icons

### Summary
Implemented PDF gallery view with thumbnails and a full-screen reader modal.

### Steps
1. Created GalleryGrid component with responsive grid layout
2. Added thumbnail view with page numbers and actions
3. Implemented ReaderModal with zoom controls and navigation
4. Added keyboard shortcuts for navigation
5. Implemented page download functionality

### Commands Run
```bash
pnpm add lucide-react
```

### Tests Run
No tests implemented yet.

### Migration Notes
N/A

## 2025-08-31 - File Upload Implementation (SHA: d27c9a2)

### Files Changed
- Created lib/store/usePdfStore.ts
- Created lib/hooks/useFileUpload.ts
- Created components/ui/file-upload-dialog.tsx
- Added components/ui/progress.tsx
- Added uuid and react-dropzone dependencies

### Summary
Implemented core PDF file management functionality with file upload capabilities.

### Steps
1. Created Zustand store with Immer for PDF file state management
2. Implemented PDF upload and preview generation using pdf.js
3. Created FileUploadDialog component with drag-and-drop support
4. Added Progress component for upload status
5. Added unique ID generation for files

### Commands Run
```bash
pnpm add uuid @types/uuid react-dropzone
pnpm dlx shadcn@latest add progress
```

### Tests Run
No tests implemented yet.

### Migration Notes
N/A

## 2025-08-31 - Project Structure and UI Components (SHA: 5d84dbe)

### Files Changed
- Added UI components from shadcn/ui (button, card, dialog, form, input, dropdown-menu)
- Added Sonner for notifications
- Created initial types in types/pdf.ts
- Updated app/layout.tsx to include Toaster
- Created project directory structure

### Summary
Set up the basic UI components and type definitions needed for the PDF gallery viewer.

### Steps
1. Added shadcn/ui components using the CLI
2. Installed and configured Sonner for notifications
3. Created TypeScript interfaces for PDF files and previews
4. Defined quality preset types and configurations
5. Set up project directory structure for API routes and components

### Commands Run
```bash
pnpm dlx shadcn@latest add button card dialog form input dropdown-menu
pnpm add sonner
mkdir -p app/api/{upload,proxy-image,manual-add,export} components/ui lib/{hooks,store,utils} types
```

### Tests Run
No tests implemented yet.

### Migration Notes
N/A

## 2025-08-31 - Initial Project Setup (SHA: initial)

### Files Changed
- Created Next.js project structure
- Added project dependencies
- Initialized shadcn/ui
- Created CHANGELOG.md

### Summary
Initialized PDF Gallery Viewer project with Next.js, TypeScript, Tailwind CSS, and core dependencies.

### Steps
1. Created project directory
2. Initialized Next.js project with TypeScript and Tailwind CSS
3. Set up shadcn/ui with zinc color theme
4. Installed core dependencies:
   - pdf-lib for PDF manipulation
   - pdfjs-dist for PDF rendering
   - zustand with immer for state management
   - html-to-image for image generation
   - Various UI components from Radix UI
   - Form handling with react-hook-form and zod

### Commands Run
```bash
pnpm create next-app . --typescript --tailwind --eslint --no-src-dir --app --import-alias "@/*"
pnpm dlx shadcn@latest init
pnpm add pdf-lib pdfjs-dist@3.11.174 zustand immer html-to-image @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot @radix-ui/react-toast class-variance-authority clsx tailwind-merge @hookform/resolvers zod react-hook-form
```

### Tests Run
No tests implemented yet.

### Migration Notes
N/A - Initial setup
