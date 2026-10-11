// Brings @testing-library/jest-dom's matcher types (toBeInTheDocument,
// toHaveAttribute, ...) into the TypeScript program. The runtime side is
// wired via jest.setup.js, but `tsc --noEmit` only sees files matched by
// tsconfig's `include` — jest.setup.js is a .js file, so the matcher
// augmentation never reached the typechecker and ui.test.tsx failed
// typecheck. A .d.ts with this import is the jest-dom v6 documented fix.
import '@testing-library/jest-dom';
