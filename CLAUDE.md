# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Suasor Frontend Development Guide

### Build Commands

- **Dev**: `npm run dev` - Start development server
- **Build**: `npm run build` - Build for production
- **Preview**: `npm run preview` - Preview production build
- **Check**: `npm run check` - Type-check the codebase

### Test Commands

- **Run All Tests**: `npm run test` - Run all tests
- **Unit Tests**: `npm run test:unit` - Run unit tests
- **Single Unit Test**: `npm run test:unit -- -t "test name"` - Run specific test
- **E2E Tests**: `npm run test:e2e` - Run Playwright E2E tests

### Lint/Format Commands

- **Lint**: `npm run lint` - Check linting with Prettier and ESLint
- **Format**: `npm run format` - Fix formatting with Prettier

### Code Style Guidelines

- **Naming**: PascalCase for components/types, camelCase for variables/functions
- **Components**: .svelte extension, script tag with lang="ts", export let for props
- **TypeScript**: Strong typing throughout, explicit interface definitions, avoid any
- **Imports**: Group by source - Svelte imports first, external libraries next, relative imports last
- **Error Handling**: Custom ApiError class, try/catch blocks with error dispatching
- **Structure**: Organized component logic, reactive statements for derived state
- **Format**: 2-space indentation, trailing semicolons, single quotes
