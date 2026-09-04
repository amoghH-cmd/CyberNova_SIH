---
title: CyberNova Backend
emoji: 🛡️
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# CyberNova Backend

FastAPI backend for the CyberNova Autonomous SOC platform, including the
Community Forensics ViT deepfake/synthetic-image detector.

Set these as Space secrets/variables (Settings → Variables and secrets)
before use — same keys as `.env.example`:

- `CORS_ORIGINS` — the deployed frontend's public URL
- `GEMINI_API_KEY`
- `SECRET_KEY`
- any others from `.env.example` you want to override

The `DATABASE_URL` default (SQLite) is fine for a demo; the file lives on
the Space's ephemeral disk and resets on rebuild.
