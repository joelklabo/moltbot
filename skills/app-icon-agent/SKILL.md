---
name: app-icon-agent
description: Generate and install app icons automatically (iOS .icon folder format + Android adaptive icons). Use when you want an AI-assisted workflow to create a new app icon from a prompt, wire it into an Expo/React Native project (app.json), and produce assets compatible with iOS 18+/iOS 26 .icon and Android 13+.
---

# App Icon Agent

This skill is adapted from Code with Beto’s App Icon Agent Skill / plugin.

References:
- X thread: https://x.com/betomoedano/status/2016579952364163372
- Docs: https://codewithbeto.dev/blog/introducing-code-with-beto-skills
- Repo: https://github.com/code-with-beto/skills (plugin: `plugins/cwb-app-icon`)

## Quick start (Expo)

1) From your Expo project root, generate an icon PNG with transparent background:

```bash
npx snapai icon \
  --prompt "<describe the icon>" \
  --background transparent
```

2) Create/replace the iOS `.icon` folder structure (recommended path):

- `assets/app-icon.icon/Assets/icon.png` should be the main icon image.
- Open it in Xcode Icon Composer if you want to tweak iOS glass/tint variants:

```bash
open assets/app-icon.icon
```

3) Update `app.json`:

- iOS: point to the `.icon` folder
- Android: configure adaptive icon foreground/background (and optional monochrome)

4) Rebuild:

```bash
npx expo prebuild --clean
npx expo run:ios
npx expo run:android
```

## Notes

- Prefer transparent backgrounds for modern iOS + Android theming.
- Commit the `.icon` folder and keep stable asset paths.
