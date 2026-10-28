# Ali Baba Doner Kebab — website concept

A responsive, buildless restaurant website for a private pitch. Open `dist/index.html` directly, or serve `dist/` with any static server:

```sh
python -m http.server 4173 --directory dist
```

Visit http://localhost:4173. There is no install or build step.

The site includes a six-item filterable menu showcase, dish detail dialogs, three selectable restaurant locations, Google Maps directions, click-to-call contacts, an order chooser linking to the live Foodpanda menu, mobile navigation, and social profile links. No customer data is collected or stored.

Update menu content and branch information in `dist/app.js`; primary page copy is in `dist/index.html`, and the visual system is in `dist/styles.css`. Fonts and imagery are served locally. The Sites identity and static directory are recorded in `.openai/hosting.json`.

Menu images and business information come from the restaurant's public profiles, listing and mall directory. See [ASSET-SOURCES.md](ASSET-SOURCES.md) for provenance. Prices and hours are deliberately delegated to live restaurant channels because they may change. The footer identifies this as an independent presentation concept, and indexing is disabled. Confirm current details and asset permission with the restaurant before a public launch.
