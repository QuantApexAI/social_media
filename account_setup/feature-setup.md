# Remaining Setup & Future Security Hardening

---

## Outstanding Items

### 1. Pin TradingView Docker Image Digest

The `tradingview-mcp` server in `.claude/.mcp.json` still uses `:latest` tag. When Docker is running:

```bash
docker pull atilaahmet/tradingview-mcp:latest
docker inspect --format '{{index .RepoDigests 0}}' atilaahmet/tradingview-mcp:latest
```

Then replace `atilaahmet/tradingview-mcp:latest` in `.claude/.mcp.json` with the full digest:
```
atilaahmet/tradingview-mcp@sha256:<the-hash-from-above>
```

**Why:** The `:latest` tag can be overwritten by the publisher at any time. Pinning to a digest ensures you always run the exact same image you audited.

### 2. Tighten settings.local.json Permissions

The current `.claude/settings.local.json` grants unrestricted access (`Bash(*)`, `Read(*)`, `Write(*)`, etc.). This overrides the project-level scoping in `settings.json`.

Consider replacing `Bash(*)` with:
```json
"Bash(*/Users/plamensavchev/Development/QuantApex/social_media/*)"
```

This matches the project-level `settings.json` and prevents Claude from executing commands outside the project directory.

### 3. Move Credential Notes to a Password Manager

If `account_setup/creds.md` contains any actual credential values, move them to a password manager (1Password, Bitwarden, etc.) and delete the file. The `.claudeignore` and `.gitignore` protect it from git and Claude access, but a file on disk is still a risk if your device is compromised.

---

## Claude Code Sandbox Mode

### What Is It?

Claude Code's sandbox mode runs all Bash commands inside an isolated environment that restricts:

- **File system access** — only the project directory and specified paths are readable/writable
- **Network access** — only explicitly allowed domains can be reached
- **Process isolation** — commands cannot access files, processes, or sockets outside the sandbox

When sandbox is enabled, even if Claude (or an MCP server, or a dependency) tries to read `/etc/passwd`, access `~/.ssh/`, or reach an unexpected URL, the operating system blocks it.

### How to Enable It

Add to `.claude/settings.json` (project-level) or `~/.claude/settings.json` (global):

```json
{
  "sandbox": {
    "enabled": true,
    "network": {
      "allowedDomains": [
        "api.twitter.com",
        "upload.twitter.com",
        "api.telegram.org",
        "www.tradingview.com",
        "registry.npmjs.org",
        "pypi.org",
        "api.search.brave.com",
        "api.githubcopilot.com",
        "localhost"
      ]
    },
    "filesystem": {
      "denyRead": [
        "/Users/plamensavchev/.ssh",
        "/Users/plamensavchev/.aws",
        "/Users/plamensavchev/.gnupg"
      ]
    }
  }
}
```

### Pros

- **Hard OS-level isolation** — even if Claude, an MCP server, or an npm package is compromised, it cannot access files or network endpoints outside the allowlist
- **Defense in depth** — complements the existing permission rules and hooks
- **Protects credentials** — `.ssh`, `.aws`, and other sensitive directories are blocked at the OS level, not just by Claude's permission system
- **Prevents data exfiltration** — network requests to unlisted domains are blocked
- **No code changes needed** — purely a configuration change

### Cons

- **May break MCP servers** — if a server needs a domain not in the allowlist, it will silently fail. You'll need to add domains as you discover them.
- **Docker interaction** — the `tradingview-mcp` server runs via Docker, which requires access to the Docker socket. This may need special configuration (`allowUnixSockets` or excluding the Docker command from sandbox).
- **Playwright needs network** — chart capture connects to `tradingview.com` via a headless browser. The sandbox must allow this domain and the browser binary path.
- **Development friction** — some legitimate operations (installing new packages, running system commands) may be blocked and require allowlist updates.
- **macOS vs Linux** — sandbox implementation differs by platform. On macOS it uses a Seatbelt profile; on Linux it uses seccomp + namespaces. macOS sandboxing is less granular.

### Recommendation

Start with sandbox mode in `settings.json` (project-level) with a generous allowlist. Test all workflows (drafting, chart capture, posting) to confirm nothing breaks. Tighten the allowlist over time as you confirm which domains are actually needed.

If sandbox causes issues with Docker or Playwright, you can use `excludedCommands` to let specific commands bypass the sandbox while keeping everything else restricted.

---

## Security Layers Summary (Current State)

| Layer | What It Does | Status |
|-------|-------------|--------|
| `.gitignore` | Prevents credentials from being committed | Active |
| `.claudeignore` | Prevents Claude from reading credential files | Active |
| `settings.json` permissions | Scopes Bash to project directory | Active (overridden by settings.local.json) |
| PreToolUse compliance hook | Blocks non-compliant social media posts | Active |
| Global security hooks | Blocks dangerous commands, scans for injection, guards credentials | Active (in ~/.claude/settings.json) |
| MCP version pinning | Prevents supply chain attacks via auto-updated packages | Active (except Docker image) |
| Sandbox mode | OS-level isolation for file and network access | Not yet enabled |
