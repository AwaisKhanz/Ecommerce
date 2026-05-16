# 📚 Project Documentation — AlpSolid-style E-Commerce Platform

**Codename:** `industrial-shop`
**Type:** Production e-commerce platform for industrial & work-related products (generators, water pumps, electrical equipment, etc.)
**Payment Model:** Cash on Delivery (COD) — no online payment gateway
**Owner:** Client (single-vendor shop)
**Doc Version:** 1.0
**Last Updated:** 2026-05-15

---

## 📁 Documentation Tree

```
docs/
├── README.md                          ← You are here (index)
│
├── 01-foundation/
│   ├── PROJECT_OVERVIEW.md            ← Business context, vision, scope
│   ├── PRODUCT_REQUIREMENTS.md        ← Full PRD with user stories
│   └── TECH_STACK.md                  ← Stack choices + rationale
│
├── 02-architecture/
│   ├── SYSTEM_ARCHITECTURE.md         ← High-level architecture diagrams
│   ├── API_ARCHITECTURE.md            ← API design patterns
│   ├── DATABASE_SCHEMA.md             ← Tables, RLS, relationships
│   ├── STORAGE_ARCHITECTURE.md        ← Supabase Storage layout
│   ├── AUTH_FLOW.md                   ← Admin auth + RBAC
│   ├── STATE_MANAGEMENT.md            ← Client + server state patterns
│   ├── NAVIGATION_ARCHITECTURE.md     ← Routing strategy
│   └── ADMIN_PANEL_ARCHITECTURE.md    ← Admin dashboard architecture
│
├── 03-engineering/
│   ├── FOLDER_STRUCTURE.md            ← Full project structure
│   ├── CODING_STANDARDS.md            ← Conventions, naming, TS rules
│   ├── DESIGN_SYSTEM.md               ← Tokens, components, theme
│   ├── API_DOCUMENTATION.md           ← Endpoint reference
│   ├── ERROR_HANDLING.md              ← Error strategy
│   ├── FEATURE_FLAGS.md               ← Flag system
│   └── TESTING_STRATEGY.md            ← Unit / integration / e2e
│
├── 04-operations/
│   ├── ENVIRONMENT_VARIABLES.md       ← All env vars
│   ├── DEPLOYMENT_GUIDE.md            ← Vercel deployment
│   ├── SUPABASE_SETUP.md              ← Supabase bootstrap
│   ├── EMAIL_SYSTEM.md                ← Resend transactional emails
│   ├── LOGGING_MONITORING.md          ← Logs, alerts, observability
│   ├── ANALYTICS_ARCHITECTURE.md      ← Event tracking
│   └── SECURITY.md                    ← Security model
│
├── 05-quality/
│   ├── PERFORMANCE_GUIDELINES.md      ← Web Vitals, optimization
│   ├── ACCESSIBILITY_GUIDELINES.md    ← WCAG 2.2 AA
│   ├── SEO_GUIDELINES.md              ← SEO + structured data
│   └── INTERNATIONALIZATION.md        ← i18n + RTL support
│
└── 06-roadmap/
    └── ROADMAP_MASTER_PLAN.md         ← ⭐ The build plan for Claude Code
```

---

## 🎯 How To Use This Documentation

1. **New to the project?** Start with `01-foundation/PROJECT_OVERVIEW.md`.
2. **Building features?** Read the relevant `02-architecture/` doc, then follow `06-roadmap/ROADMAP_MASTER_PLAN.md`.
3. **Setting up the dev environment?** Go to `04-operations/SUPABASE_SETUP.md` → `ENVIRONMENT_VARIABLES.md` → `DEPLOYMENT_GUIDE.md`.
4. **Writing code?** Always have `03-engineering/CODING_STANDARDS.md` and `FOLDER_STRUCTURE.md` open.
5. **Using Claude Code?** Feed it `06-roadmap/ROADMAP_MASTER_PLAN.md` phase by phase.

---

## 🧭 Reading Order for First-Time Onboarding

1. `PROJECT_OVERVIEW.md`
2. `PRODUCT_REQUIREMENTS.md`
3. `TECH_STACK.md`
4. `SYSTEM_ARCHITECTURE.md`
5. `DATABASE_SCHEMA.md`
6. `FOLDER_STRUCTURE.md`
7. `DESIGN_SYSTEM.md`
8. `ROADMAP_MASTER_PLAN.md`

---

## 🔑 Key Principles Across All Docs

- **Feature-based folder architecture** (not type-based)
- **No hardcoded design values** — everything goes through design tokens
- **Strict TypeScript** — no `any`, no implicit returns, no untyped APIs
- **Server Components by default**, Client Components only when needed
- **Supabase RLS for security**, never trust the client
- **Reusable everything** — components, hooks, services, validation
- **i18n-ready from day 1** — even if launched with one language
- **Accessibility from day 1** — WCAG 2.2 AA baseline
