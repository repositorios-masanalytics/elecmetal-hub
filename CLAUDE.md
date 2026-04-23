# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # gulp serve — local dev server at https://localhost:4321
npm run build      # gulp bundle — build solution
npm run clean      # gulp clean — remove build artifacts
npm test           # gulp test — run tests
```

Requires Node 12 (see `.node-version`). Use `nvm use` or equivalent before running.

## Architecture

Single SPFx web part (SPFx v1.11.0) acting as a Power BI dashboard hub with standalone app appearance.

**Entry point:** `src/webparts/helloWorld/HelloWorldWebPart.ts`
- Fetches Microsoft Graph user profile (`displayName`, `jobTitle`, `department`, `officeLocation`) in `onInit()`
- Injects custom CSS to hide SharePoint chrome (suite bar, app bar, side nav)
- Passes user profile down to React components as props

**Component tree:**
```
HelloWorld.tsx         — stateful root; manages active report selection
├── Header.tsx         — top bar with Office UI Fabric CommandBar + user Persona
├── Sidebar.tsx        — collapsible left nav (240px/48px); lists reports
└── PowerBIViewer.tsx  — Power BI embed via iframe
```

Report data is a hardcoded `REPORTS` array in `HelloWorld.tsx` — no external data source.

**Styling:** SCSS modules. Dark blue (`#1b3a6b`) chrome. Full-viewport flex layout. Sidebar uses CSS transition for collapse animation.

**UI library:** Office UI Fabric React 6.x (`CommandBar`, `Persona`, `Icon`, `Text`, `Stack`).

**Graph permissions** declared in `config/package-solution.json`: `User.Read`, `User.ReadBasic.All`. Must be approved in SharePoint Admin Center after deployment.

## Key Config Files

| File | Purpose |
|------|---------|
| `config/package-solution.json` | Solution ID, version, Graph API permission scopes |
| `config/config.json` | Bundle entry points |
| `config/serve.json` | Dev server ports (API: 5432, HTTPS: 4321) |
| `tslint.json` | Extends `@microsoft/sp-tslint-rules/base-tslint.json` |
| `tsconfig.json` | ES5 target, React JSX, `experimentalDecorators: true`, strict nulls off |

## SPFx Deployment

```bash
gulp bundle --ship
gulp package-solution --ship
# Upload sharepoint/solution/*.sppkg to App Catalog
# Approve Graph API permissions in SharePoint Admin > API Access
```

## Interaction Rules

- Tono frío, directo, técnico. Sin preámbulos ni resúmenes de cierre.
- Solución primero, explicación solo si es necesaria para decidir.
- Después de cada archivo creado/modificado: resumen de 2 líneas (qué hiciste, qué toca después).
- No correr `gulp serve`, `npm install` ni comandos destructivos sin OK explícito.
- Si encontrás ambigüedad, preguntá. No inventes APIs ni endpoints.
- No uses "always allow" en operaciones sobre `package-solution.json` o `config/*.json`.

## Team Context

- Moisés Barraza (yo): Software Engineer en MAS Analytics, modalidad híbrida 22h/sem.
- Reporto a: Stanis (Liderazgo). Coordino con: Tomás Lagos (Recursos).
- Cliente: Elecmetal. Contactos técnicos: Alain Rachet (arachet@me-elecmetal.com),
  Macarena Soto (macarena.soto@ticel.cl, TICEL).

## Current Sprint — Dynamic Report Discovery

El catálogo hardcodeado `REPORTS` en `HelloWorld.tsx` se reemplaza por descubrimiento
dinámico vía Power BI REST API con permisos delegados.

**Ticket principal:** [BI] Pruebas de renderizado con reportes reales de la empresa
(Notion ID `345ce555-4cdf-8086-91fb-e4d7ab02dd07`).

**Endpoints objetivo:**
- `GET /v1.0/myorg/reports` — reportes de My Workspace
- `GET /v1.0/myorg/groups` — workspaces accesibles
- `GET /v1.0/myorg/groups/{id}/reports` — reportes por workspace

**Resource para AadHttpClient:** `https://analysis.windows.net/powerbi/api`
**Scope requerido:** `Report.Read.All` (delegated)

## Technical Constraints (verified)

- `webApiPermissionRequests` en `package-solution.json` usa **displayName**, no objectId.
  Formato: `{ "resource": "Power BI Service", "scope": "Report.Read.All" }`
  (confirmado en docs Microsoft, objectId causa error en aprobación).
- `embedUrl` viene ya en la respuesta de `GET /myorg/reports` y `/myorg/groups/{id}/reports`.
  **NO** implementar método `getEmbedUrl()` separado — sería N+1 innecesario.
- **NO usar `GenerateToken`** — nuestro iframe con `&autoAuth=true` usa SSO del usuario
  (embed for your organization), no embed-for-customers.
- `Dataset.Read.All` no es alternativa válida — da acceso a datasets, no a embed URLs.

## Admin Consent Paths

Dos caminos válidos para aprobar `Report.Read.All`:

1. **SharePoint Admin Center** → API Access → aprobar request generado por `webApiPermissionRequests`.
2. **portal.azure.com** → Entra ID → App Registrations → "SharePoint Online Client
   Extensibility Web Application Principal" → API Permissions → Grant admin consent.

Internamente ambos operan sobre el mismo service principal de AAD.

## Parallel Tickets (Notion)

- `[DevOps/Git] Inicialización de repositorio remoto y push de baseline` — pendiente
  (repo en `C:\dev\mi-primer-spfx`, fuera de OneDrive).
- `[Config/Deps] Alineación de dependencias SPFx con ambiente Elecmetal (spfx.zip)` —
  pendiente, en paralelo. Por ahora mantenemos SPFx 1.11.

## Environment

- Proyecto vive en `C:\dev\mi-primer-spfx` (movido desde OneDrive por conflictos de sync).
- Shell: PowerShell 7.6.0 (migrado desde Git Bash).
- Node: 12.x (declarado en `.node-version`).
- fnm activo en `$PROFILE` para auto-switch de Node al entrar al proyecto.
