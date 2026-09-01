# DSH Universe

> Plugin marketplace, CLI tools, and knowledge hub for the DeepSeek Harness ecosystem.

[![Website](https://img.shields.io/badge/website-duink.com-4B8BF5)](https://duink.com)
[![GitHub Org](https://img.shields.io/badge/github-dsh--universe-181717)](https://github.com/dsh-universe)

**DSH Universe** is the open ecosystem hub for DeepSeek Harness (DSH) — a continuously updated, searchable plugin marketplace, CLI tooling, and AI intelligence hub.

Main site: **[https://duink.com](https://duink.com)**

---

## What's inside

| Module | Description | Link |
|---|---|---|
| 🛍️ **Plugin Marketplace** | 7,000+ curated DSH plugins, continuously synced from GitHub, searchable & categorized | [duink.com/plugins](https://duink.com/plugins) |
| 🧠 **Skills Directory** | Community skills for the DSH ecosystem | [duink.com/skills](https://duink.com/skills) |
| ⭐ **Plugin Reviews & Comparisons** | Curated "worth-it" picks and head-to-head comparisons | [duink.com/best-plugins](https://duink.com/best-plugins) · [duink.com/compare/](https://duink.com/compare/) |
| 📰 **AI Intel & News** | Daily AI news digest, tracked & summarized (Global AI, China AI, Finance) | [duink.com/news](https://duink.com/news) |
| 📓 **Journal** | Ecosystem notes & updates | [duink.com/journal](https://duink.com/journal) |
| 🧩 **CLI Tools** | `@dsh-universe/cli` (npm) · `dsh-universe` (PyPI) | [npm](https://www.npmjs.com/package/@dsh-universe/cli) · [PyPI](https://pypi.org/project/dsh-universe/) |

## Quick start

```bash
# Install the DSH Universe CLI
npm install -g @dsh-universe/cli
# or
pip install dsh-universe
```

## Repository layout

```
src/          Astro site source (public edition)
packages/     Shared packages (plugin store)
scripts/      Sync, build & data tooling
public/       Static assets
sync-all.sh   Daily sync pipeline: GitHub plugins → trends → site rebuild
```

## Contributing

- **Submit your plugin** — [duink.com/submit](https://duink.com/submit)
- **Propose a plugin / report issues** — [dsh-universe-plugins issues](https://github.com/dsh-universe/dsh-universe-plugins/issues)
- **Ecosystem & docs** — [github.com/dsh-universe](https://github.com/dsh-universe)

## License

MIT — see [LICENSE](LICENSE).
