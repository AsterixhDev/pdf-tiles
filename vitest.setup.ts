import '@testing-library/jest-dom/vitest'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})
