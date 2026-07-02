# Security Notes

Security notes for the current Afen release line.

## Runtime Binding

Afen local runtime defaults to:

```text
http://127.0.0.1:8787
```

Docker binds inside the container and should be published explicitly:

```powershell
docker run -p 8787:8787 ghcr.io/anamn-in/afen:latest
```

For local development, keep the runtime bound to localhost unless you intentionally expose it.

## API Tokens

Some SDK examples pass an API key or bearer token.

For local development, use a placeholder token only:

```text
local-dev-token
```

For shared or production environments:

- use a real secret
- do not commit secrets
- rotate leaked tokens
- prefer environment variables

## Error Payload Privacy

Afen ingests stack traces and metadata. These can contain sensitive information.

Avoid sending:

- passwords
- access tokens
- cookies
- private keys
- full request bodies with user data
- personally identifiable information unless explicitly intended

Recommended metadata is operational, not personal:

```json
{
  "region": "us-east-1",
  "version": "v1.0.3",
  "service": "web"
}
```

## Local Data Storage

Afen stores runtime data locally. Database files may appear under runtime data folders.

Do not commit runtime database files:

```text
*.db
*.db-shm
*.db-wal
```

## Python Virtual Environments

Do not commit local Python virtual environments:

```text
.venv/
```

If `.venv` files appear in `git status`, remove them from tracking and add `.venv/` to `.gitignore`.

## Docker Images

Use the official GHCR image:

```text
ghcr.io/anamn-in/afen:latest
ghcr.io/anamn-in/afen:v1.0.3
```

Validate a pulled image before use:

```powershell
docker pull ghcr.io/anamn-in/afen:latest
docker run -p 8787:8787 ghcr.io/anamn-in/afen:latest
curl http://127.0.0.1:8787/health
```

## Vite / esbuild Dev Server Note

A previous review flagged Vite / esbuild dev-server exposure risk.

Current guidance:

- do not expose the Vite dev server publicly
- use it only for local UI development
- production runtime validation does not depend on the Vite dev server
- upgrade Vite/esbuild during a future dependency maintenance pass after compatibility testing

## Reporting Security Issues

Report security issues through the project repository:

```text
https://github.com/anamn-in/Afen/issues
```

Avoid posting secrets, tokens, private stack traces, or sensitive customer data in public issues.
