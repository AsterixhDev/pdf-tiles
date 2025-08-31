# Changelog

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
