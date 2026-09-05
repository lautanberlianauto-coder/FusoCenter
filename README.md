# FusoCenter Frontend

Official frontend repository for **FusoCenter.com**.

## Baseline

- Next.js App Router
- TypeScript
- Tailwind CSS
- Headless WordPress CMS: `https://cms.fusocenter.com`
- Customer domain: `https://fusocenter.com`

## Branch policy

- `main`: stable baseline / production branch candidate
- `develop`: active frontend development and preview branch

## Guardrails

- Do not hard-code CMS-governed prices, promotions, product specifications, or marketing content.
- Do not commit secrets or analytics IDs that have not been verified.
- `harga_mulai = null` must never render as `Rp0`.
- Featured Image is the canonical product hero when available; missing media must use a deliberate placeholder.
