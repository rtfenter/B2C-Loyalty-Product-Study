# B2C Commerce & Loyalty

## Purchase ≠ Final Transaction

A focused interactive PM case study following one journey: **Redeem → Purchase → Return → New Purchase**. Customer View and Product View remain visible together, with previous, next, and replay controls.

**Complexity belongs underneath the experience.** The customer should understand what happened to their money and rewards without needing to understand the reconciliation logic that made the result correct.

The fictional customer starts with 1,000 points, exchanges them for a $5 reward, and purchases a $20 item with the reward plus a $15 payment. Earning is 1 point per qualifying merchandise dollar before reward payment, so the purchase earns 20 points. One return action refunds $15, restores the original 1,000 points, and reverses the original 20-point earning. A separate $10 purchase earns 10 new points. The final position is 1,010 points, $10 net paid, no active reward, and the new $10 item retained.

`src/valueExchange.ts` contains the ordered records and originating-event references. `src/redemptionScenario.ts` controls navigation; moving backward or replaying selects a historical position without posting duplicate events. The return adjustments appear atomically. This is a deterministic local simulation, not a payment integration.

### Run and verify

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
```

Local URL: http://localhost:5173/B2C-Loyalty-Product-Study/ (use the port printed by Vite if different).

### Preserved for the next case study

Campaign Studio, audience segmentation, experiments, targeted offers, promotional logic, supporting fixtures, and their tests remain in the repository. They are disconnected from the rendered application and reserved for **Engagement & Incentives — Enrollment ≠ Activation**. Other earlier study modules are also retained but not mounted.

The React/TypeScript/Vite setup and GitHub Pages base path are unchanged. The existing deployment workflow runs tests, typechecking, and the production build. No deployment is required for local review.

<details>
<summary>Earlier study documentation (historical; not the current rendered experience)</summary>

# B2C Loyalty Product Study

An interactive product study exploring how a consumer loyalty program moves from enrollment to activation, engagement, earning, targeted promotions, experimentation, redemption, and retention.

The experience uses FORM, a fictional women's activewear brand, to make the product decisions tangible.

[Launch the interactive study →](https://rtfenter.github.io/B2C-Loyalty-Product-Study/)

## What it explores

- Enrollment vs activation
- Earning and redemption
- Targeted promotions
- Segmentation and eligibility
- A/B testing and control groups
- Engagement and retention
- Ecommerce and POS
- Returns and reconciliation

## About FORM

FORM and all members, transactions, campaigns, program rules, results, and imagery in this project are fictional. Simulated metrics are illustrative and do not represent any current company. 

## Why I built it

My professional experience includes consumer loyalty and targeted promotions. I wanted to explore those product concepts in a public environment where the rules, interactions, and tradeoffs could be made visible without exposing proprietary systems or data.


## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open http://localhost:5173/B2C-Loyalty-Product-Study/ (or the port printed by Vite). Use `npm run build` for a type-checked production build, `npm run preview` to serve it, or `npm run typecheck` for TypeScript validation.

## Implemented first slice

- `#home`: editorial activewear landing and rewards entry.
- `#rewards`: Maya’s enrolled account, 0 points, 500-point next reward, not yet activated, and four next-step actions.
- `#bag`: fixed Lift Legging ($78) and Sculpt Bra ($48), $126 subtotal, and an expandable explanation of the 126-point earning preview.

Purchase navigates to the bag. Profile and no-action choices show accessible inline feedback. The targeted-offer action opens its own member experience without changing the fixture. No checkout, points award, authentication, backend, customer data collection, or later loyalty flows are implemented. Browser refresh restores the same fixture state. Hash links support direct entry and browser back/forward.

## Structure and assets

`src/fixtures.ts` contains the member, merchandise, and earning rule. Screen components live under `src/components`; shared layout, branding, and local reference-image framing are separate components. `src/styles.css` contains responsive styles and visible keyboard focus treatment.

Imagery is served locally from the user-supplied `form.png`, retained as `public/images/form-reference.png` and framed with SVG viewboxes. There are no remote image/font requests or external service integrations. The second reference guides Campaign Studio’s workspace composition. Both views reuse the existing local image and FORM palette.

## Verification

Production build and TypeScript checks pass. Browser checks cover all three screens, all four account actions, the earning disclosure, and desktop/mobile layouts. The bag is intentionally fixed; quantity controls and payment processing are outside this slice.


## Slice 2: Campaign Studio

Enter Product View through the persistent FORM Loyalty Study navigation on any route, or open `#studio`. This workspace does not launch a campaign or mutate Maya’s account.

The workflow covers goal → audience → offer → experiment → results → decision. Five illustrative goals include contextual product questions. The featured scenario is Introduce category. Audience filters intersect deterministic synthetic membership flags; the selected funnel is 24,830 → 8,412 → 6,731 → 6,204. Rewards membership is already true for the starting population and therefore does not further narrow it. An optional repeat-purchase filter supports exploration.

Configure both treatments, including type, value, category, eligibility, dates, and limits. The member preview follows the selected treatment. The default requested 33% / 33% / 33% allocation assigns the remaining 1% to Control, producing 34% / 33% / 33% and 2,110 / 2,047 / 2,047 members. Largest-remainder rounding keeps all counts whole and totals exact. Invalid allocations, incentive values, and dates show validation feedback in the builder. The separate example results remain available.

**Configuration and outcomes are separate:** the builder updates audience, group sizes, offer details, and member previews. “Explore example results” moves to a separate fixed fictional experiment without changing the configured campaign. Results always identify Control with no incentive, Treatment A with 2× sports-bra points, and Treatment B with 250 bonus points after a qualifying sports-bra purchase. They do not predict responses to visitor settings. For example, a configured 4× offer remains 4× while the example explicitly remains 2×. The independent `ExampleResults` component receives no builder state. Its comparisons and product decisions always refer to that fixed experiment.

`src/campaignFixtures.ts` owns synthetic audience flags, outcome fixtures, and allocation helpers. Campaign UI and scoped styles live in `src/components/campaign`. Refreshing or resetting restores deterministic defaults. There is no persistent storage or external integration.

Run `npm test` for the fixture and allocation tests, alongside `npm run typecheck` and `npm run build`. Browser verification covers desktop and narrow mobile layouts, filters, treatment previews, allocation/date validation, all four decisions, and the original member journey.


## Slice 3: Maya’s Member Journey

Open `#journey` from the Product View navigation alongside Campaign Studio. A five-event editorial timeline follows Maya through Enrolled → Activated → Engaged → At risk → Reactivated. Previous/next controls, direct event selection, and reset replay a deterministic scenario; nothing writes to the original Maya account or Campaign Studio.

`src/journeyFixtures.ts` owns FORM’s fictional definitions, thresholds, dated events, evaluator, product options, and decision tradeoffs. Day 0 enrollment starts at 0 points; qualifying purchases on days 7, 35, and 132 earn 126, 96, and 78 points. Day 125 is exactly 90 days after the previous qualifying purchase. Points progress is 0 → 126 → 222 → 222 → 300. Engagement includes the 60-day boundary, risk begins at 90 days of inactivity after prior engagement, and a purchase after At risk takes reactivation priority. States remain until another featured rule is met; these are study choices, not industry standards.

Each event explains its previous state, received event, facts, evaluated rule, and result. “See what Maya sees” reveals a compact consumer preview without internal lifecycle labels. At risk offers four optional product reflections; selecting one does not send a communication, alter future events, or claim to cause Maya’s later return. Tests cover transitions, threshold boundaries, qualification, replay/reset, and the separation of internal state from customer copy.


## Study navigation

The shared `StudyNavigation` portfolio wrapper persists across Home, Rewards, Bag, Campaign Studio, and Member Journey. It groups destinations under Member View and Product View, marks the active destination, and leaves FORM’s consumer header underneath on member pages. Product pages use a single content layout beneath the shared wrapper; the old Campaign Studio sidebar and Member Journey header are consolidated. On mobile, an accessible disclosure menu shows grouped links, closes on route selection, and supports Escape with focus returned to its toggle. Bag explicitly remains in Member View.


## Targeted Offer

Maya’s “Use a targeted offer” action opens `#offer`, within Member View and the shared study navigation. A fixed eligible offer provides 2× points on sports bras during September 1–30, 2026. The deterministic scenario date is September 16, 2026; the prototype does not use the wall clock to change eligibility.

“Use offer with Sculpt Bra” reveals an on-page $48 merchandise preview. The expandable explanation separates 48 base points and 48 additional promotional points, for 96 total points after a qualifying purchase. The preview awards no points; completing the explicitly labeled simulated purchase awards 96 points once and changes Maya to Activated. No real checkout or payment occurs. The original $126 bag continues to preview 126 base-rate points.

`src/offerFixtures.ts` contains offer terms, scenario eligibility, and earning calculations. “Why is Maya eligible?” explains Rewards membership, marketing eligibility, leggings purchase history, no sports-bra purchase history, and the active period. The broader fictional purchase history is separate from Maya’s canonical enrolled/0-point account and Member Journey. A product-study note directs reviewers to Campaign Studio through the global navigation; campaign example results remain independent.

### Purchase completion + activation

Member screens share an in-memory session reducer. Completing the targeted Sculpt Bra simulation marks the offer used and changes Maya from Enrolled / 0 points to Activated / 96 points, with 96/500 reward progress. Repeated completion is idempotent. Confirmation explains the transaction, base/promotional award, and first-qualifying-purchase activation definition. Rewards and confirmation expose a reset; reloading the app also restores the initial scenario. Neither reset nor purchase modifies Campaign Studio or the separate Member Journey timeline. Activation makes no claim about future behavior.


## GitHub Pages deployment

The production base path is `/B2C-Loyalty-Product-Study/`. Hash routes remain within that path. Local imagery uses Vite’s base URL.

`.github/workflows/pages.yml` installs dependencies with `npm ci`, runs tests and typecheck, builds, then uploads and deploys `dist` using GitHub’s Pages artifact actions. It runs on pushes to `main` and can also be started manually. In repository **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.

To check the production build locally, run `npm run build` followed by `npm run preview` and open the repository path at the address Vite prints.

</details>
