# Ali Baba Doner Kebab — website concept

A responsive, buildless restaurant website for a private pitch. Open `dist/index.html` directly, or serve `dist/` with any static server:

```sh
python -m http.server 4173 --directory dist
```

Visit http://localhost:4173. There is no install or build step.

The site includes 15 filterable dishes across döner, pizza, burgers, sides and drinks, with sample PKR prices, dish details, item notes, quantity selectors, and a shopping cart. Cart quantities, notes, and totals persist in this browser. Delivery has a sample Rs 200 fee; pickup is free.

Checkout demonstrates branch selection, delivery/pickup, contact details, address validation, and an order summary. **It creates a demo confirmation only: no restaurant order is sent and no payment is taken.** Checkout details are not saved or transmitted and are cleared when the cart closes. The contact chooser still links to the restaurant's live Foodpanda menu and phone numbers for real orders. Spain remains a contact-only location; sample PKR checkout covers the two Islamabad branches.

Edit menu items and demo prices in `dist/menu-data.js`. Branch details and UI interactions are in `dist/app.js`; cart calculations and storage validation are in `dist/cart-core.js`. Page content is in `dist/index.html`; styling is in `dist/styles.css` and `dist/cart.css`. Fonts and imagery are served locally.

To deploy through Vercel, import this GitHub repository with the root directory left at `./`. The checked-in `vercel.json` serves `dist/` with no build or install command. Alternatively, run `npx vercel@latest --prod` from `dist/` for a direct static deployment.

Developer tests require Node.js supported by jsdom (22.22.2+, 24.15+, or 26+) and test-only dependencies:

```sh
npm ci
npm test
```

The website itself has no runtime dependencies or build step. Tests cover cart calculations, untrusted stored carts, menu controls, cart persistence, checkout validation, and demo confirmation.

Menu images and business information come from the restaurant's public profiles, listing and mall directory. Prices and delivery fees are illustrative for this pitch; live prices, hours, and availability must be confirmed with the restaurant. The footer identifies this as an independent presentation concept, and indexing is disabled. Confirm current details and asset permission with the restaurant before a public launch.
