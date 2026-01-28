# Four Pi Viewer

A 360° photo viewer built with Astro and Three.js, featuring WebXR VR support.

## Features

- 360° equirectangular photo viewing
- Multiple travel galleries with thumbnail navigation
- Fullscreen mode (press `F` or click button)
- Mouse/touch drag to pan view
- Scroll/pinch to zoom
- Keyboard navigation (arrow keys)
- WebXR VR headset support

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Adding a New Travel

1. Create a JSON file in `src/content/travels/`:

```json
{
  "title": "My Trip",
  "slug": "my-trip",
  "photos": [
    "photo1.jpg",
    "photo2.jpg"
  ]
}
```

2. Add photos to `public/travels/my-trip/photos/`

3. The travel will automatically appear on the home page.

## Project Structure

```
four-pi-viewer/
├── src/
│   ├── layouts/Layout.astro
│   ├── pages/
│   │   ├── index.astro          # Home page
│   │   └── travels/[slug].astro # Dynamic travel pages
│   ├── scripts/viewer.ts        # 360° viewer (reference)
│   └── content/travels/         # Travel data (JSON)
├── public/travels/              # Photos
├── astro.config.mjs
└── package.json
```

## Deployment

Build and deploy the `dist/` folder to any static hosting:

```bash
npm run build
```

For GitHub Pages, update `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/four-pi-viewer',
});
```

## License

MIT
