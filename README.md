<div align="center">
    <img alt="logo" src="./public/logo.svg" width="120px" />
</div>

<br>

# Default-Creds Web

<br>
<div align="center">
    <a href="https://github.com/anotherhadi/default-creds-web/stargazers">
        <img src="https://img.shields.io/github/stars/anotherhadi/default-creds-web?color=8FD0CB&labelColor=0b0b0b&style=for-the-badge&logo=starship&logoColor=8FD0CB">
    </a>
    <a href="https://github.com/anotherhadi/default-creds-web/">
        <img src="https://img.shields.io/github/repo-size/anotherhadi/default-creds-web?color=8FD0CB&labelColor=0b0b0b&style=for-the-badge&logo=github&logoColor=8FD0CB">
    </a>
    <a href="https://github.com/anotherhadi/default-creds-web/blob/main/LICENSE">
        <img src="https://img.shields.io/static/v1.svg?style=for-the-badge&label=License&message=MIT&colorA=0b0b0b&colorB=8FD0CB&logo=unlicense&logoColor=8FD0CB"/>
    </a>
</div>
<br>

This is the web frontend for **[Default Creds](https://github.com/anotherhadi/default-creds)**, a centralized, community-driven database of factory-set credentials.

**Live Instance:** [default-creds.hadi.icu](https://default-creds.hadi.icu?utm_source=github&utm_medium=readme)

**API Documentation:** [default-creds.hadi.icu/api-docs](https://default-creds.hadi.icu/api-docs?utm_source=github&utm_medium=readme)

> Looking to add or fix a credential? That data lives in a separate repo: **[anotherhadi/default-creds](https://github.com/anotherhadi/default-creds)**. This repo is code-only.

## ⚙️ How it Works

This application is built with **Astro** and **Svelte 5**.

1. **On boot:** clones the data repo (shallow) into a local, git-ignored directory if it isn't there yet.
2. **Periodically:** re-fetches and hard-resets to the remote's latest commit (default every 6h), so the site stays current without needing a redeploy whenever the data changes.
3. **On update:** the in-memory search cache is invalidated so the next request picks up fresh data.

Configurable via environment variables:

| Variable                   | Default                                            | Description                          |
| -------------------------- | -------------------------------------------------- | ------------------------------------ |
| `DATA_REPO_URL`            | `https://github.com/anotherhadi/default-creds.git` | Git URL of the data repository       |
| `DATA_REPO_DIR`            | `./.data-repo`                                     | Where to clone the data repo locally |
| `DATA_SYNC_INTERVAL_HOURS` | `6`                                                | How often to re-pull                 |

## 💻 Local Development

### Prerequisites

- Bun (or nix, just `nix develop`)
- `git` available on `PATH` (used to clone/pull the data repo)

### Installation

```bash
git clone https://github.com/anotherhadi/default-creds-web.git
cd default-creds-web
bun dev
```

The data repo is cloned automatically into `.data-repo/` on first run.

### 🛠️ Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **UI Logic:** [Svelte 5 (Runes)](https://svelte.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)

## ⚠️ Legal Disclaimer

Usage of **Default Creds** for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state, and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program.

---

<div align="center">
  <a href="https://github.com/anotherhadi/default-creds-web">github</a> |
  <a href="https://gitlab.com/anotherhadi_mirror/default-creds-web">gitlab (mirror)</a> |
  <a href="https://git.hadi.icu/anotherhadi/default-creds-web">gitea (mirror)</a>
</div>
