# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-01-13

### Added
- Commercial support & services section in README
- Support the project section with GitHub Sponsors and donation links in README

### Changed
- Refactored codebase into modular handler system for improved maintainability
- Extracted resource-specific logic into dedicated handlers:
  - `articleHandler.ts` - Article operations
  - `categoryHandler.ts` - Category operations
  - `fieldHandler.ts` - Custom Fields operations
  - `mediaHandler.ts` - Media operations
  - `tagHandler.ts` - Tag operations
- Introduced `constants.ts` for shared configuration values
- Reduced main node file (`Joomla.node.ts`) from 754 lines to under 100 lines

## [0.2.0] - 2025-12-12

### Added
- Custom Fields support for all field types (Text, Textarea, Editor, Integer, List, Radio, Checkboxes, Calendar, URL, Media, SQL, Color, Email, User)
- Type-specific options for custom field creation
- Custom field operations: Create, Get, Get Many, Update, Delete

### Changed
- Enhanced article operations with custom fields support
- Enhanced category operations with custom fields support

## [0.1.0] - Initial Release

### Added
- Article operations: Create, Get, Get Many, Update, Delete
- Category operations: Create, Get, Get Many, Update, Delete
- Tag operations: Create, Get, Get Many, Update, Delete
- Media operations: List Files, Upload, Create Folder, Delete
- Support for article images (intro and full)
- Support for multilingual associations
- Joomla API Token authentication
