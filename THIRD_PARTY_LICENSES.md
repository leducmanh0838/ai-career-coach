# Third-Party Software Licenses

This document provides an inventory of third-party software dependencies used by **AI Career Coach**.

The project is distributed under the [MIT License](./LICENSE). Third-party dependencies remain subject to their respective licenses and copyright notices.

## 1. License Inventory

The dependency inventories are generated from the project's Python and npm environments.

| Component | Ecosystem | License inventory |
|---|---|---|
| Backend | Python / pip | [`backend/THIRD_PARTY_LICENSES_PYTHON.md`](./backend/THIRD_PARTY_LICENSES_PYTHON.md) |
| Frontend | Node.js / npm | [`frontend/frontend-licenses.json`](./frontend/frontend-licenses.json) |

### Backend — Python

The backend dependency inventory lists Python packages, their versions, license metadata, and available project URLs.

See [THIRD_PARTY_LICENSES_PYTHON.md](./backend/THIRD_PARTY_LICENSES_PYTHON.md).

### Frontend — npm

The frontend dependency inventory is provided in JSON format and contains package information reported by `license-checker`.

See [frontend-licenses.json](./frontend/frontend-licenses.json).

The JSON file can be inspected with a text editor or processed programmatically to review package names, versions, license declarations, and available repository information.

## 2. License Compatibility

The main project uses the MIT License. Third-party dependencies may use different open-source licenses, each with its own conditions.

License compatibility should be assessed based on the actual components included in the distributed application and the applicable terms of their licenses.

The review should pay particular attention to:

- Dependencies with missing, unknown, or ambiguous license metadata.
- Dual-licensed packages and the applicable licensing options.
- Requirements to retain copyright notices and license texts.
- Additional attribution, source-disclosure, or redistribution obligations.
- Differences between runtime dependencies and development-only tools.

## 3. Verification and Maintenance

License information is collected automatically from package metadata and dependency environments. Automatically generated information may be incomplete or inaccurate and should be verified against the corresponding package license files or authoritative project sources where necessary.

The inventories should be regenerated and reviewed when dependencies are added, removed, or upgraded.

## 4. Disclaimer

This document is provided for software license transparency and compliance review. It is not legal advice and does not, by itself, constitute a guarantee that all third-party licensing obligations have been satisfied.

## 5. Packages Requiring Additional License Review

The automated npm license inventory identifies the following packages for additional review:

- `@img/sharp-win32-x64@0.35.5` — reported as `Apache-2.0 AND LGPL-3.0-or-later`. Review the package's license file and bundled third-party libraries, including applicable LGPL notices and redistribution conditions.
- `lightningcss@1.32.0` and `lightningcss@1.33.0` — reported as `MPL-2.0`.
- `lightningcss-win32-x64-msvc@1.32.0` and `lightningcss-win32-x64-msvc@1.33.0` — reported as `MPL-2.0`.

These packages are subject to further verification of their actual use, distribution scope, license texts, and applicable notice or source-disclosure obligations. Their presence in the development environment alone does not establish that they are distributed as part of the released application.

Review status: Pending verification against the corresponding package license files and deployment artifacts.