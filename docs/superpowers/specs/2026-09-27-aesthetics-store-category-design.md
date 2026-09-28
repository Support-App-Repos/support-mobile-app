# Aesthetics Store & Category Split — Design

**Date:** 2026-09-27  
**Status:** Approved (recommended full-stack approach)

## Goal

- Store creation is for **Aesthetics** businesses only.
- **Events, Products, Services, Property** listings do not require a store.
- **Beauty** is removed as a Service subtype and promoted to a top-level **Aesthetics** listing category.
- Creating an **Aesthetics** listing requires a **verified** store.

## Create Store

- Business category picker: **Aesthetics** only.
- Remove: Product, Service, Property, Event, Mixed.
- Backend allowlist: `['Aesthetics']`.

## Select Category

- Always reachable from **+** (no global store gate).
- Cards: Events, Products, Services, Property, **Aesthetics**.
- Events / Products / Services / Property → existing flows, no store check.
- Aesthetics → verified store required; otherwise alert with path to Store hub.
- Do not filter the category list by `store.businessCategory`.

## Services

- Hide/remove **Beauty** from Select Service Type.
- Services copy no longer implies beauty is under Services.

## Aesthetics listing flow

- Selecting Aesthetics (when store verified) opens the existing service listing form with beauty specializations (no intermediate Beauty service-type picker).
- Listings are created under the **Aesthetics** category (seeded in backend).

## Gating

- `canCreateListing` / create-from-store for Aesthetics means: user has a verified store.
- Global **+** always opens Select Category; gate only applies when choosing Aesthetics.

## Out of scope

- Migrating historical Beauty listings’ category IDs (optional follow-up).
- Admin portal UI beyond API allowlist if not shared.
