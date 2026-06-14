# Security Notes

## Vite / esbuild dev-server vulnerability (GHSA-gv7w-rqvm-qjhr)

- **Affects**: Vite ≤7.1.x (transitive via esbuild)
- **Our current version**: Vite 6.4.3, esbuild 0.25.12 (as of June 2026)
- **Risk**: The vulnerability only affects the Vite dev server (`npm run dev`). We do not expose the dev server to any network; it is used only locally. Production builds (`ui/dist`) are not affected.
- **Remediation plan**: Upgrade to Vite 8 (or a patched version) when time permits. This requires testing `@vitejs/plugin-react` compatibility and configuration changes. Tracked internally for a future maintenance release.

## Reporting New Issues

If you discover a security vulnerability, please report it via [GitHub Issues](https://github.com/anamnadmin/Afen/issues) (private disclosure) rather than public channels.