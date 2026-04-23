# Phase 6 — Sass mixed-decls Warnings

**Tipo:** mixed-decls (único tipo)
**Cantidad:** 9 warnings (6 visibles + 3 omitidos en output)
**Fuente:** `office-ui-fabric-react@6.214.0` (legacy Fabric SCSS)

## Mixins afectados

| Mixin | Archivo | Línea |
|-------|---------|-------|
| `ms-fontColor-white()` | `_Font.Mixins.scss` | 292 |
| clearfix `&::after` | `_General.Mixins.scss` | 162–164 |
| `ms-Grid-col()` | `_Grid.Mixins.scss` | 28–29 |
| RTL selector `[dir='rtl'] &` | `_Directionality.Mixins.scss` | 17–19 |

## Archivo proyecto afectado

`src/webparts/helloWorld/components/HelloWorld.module.scss` — líneas 12–18

## Severidad

Warning, no bloquea build.

## Resolución

Phase 6 — eliminar `office-ui-fabric-react`, refactor a Fluent v9.
`HelloWorld.module.scss` se elimina (archivo sin uso real: `HelloWorld.tsx` ya importa `Sidebar.module.scss`).
Estilos restantes: `makeStyles` + tokens Fluent v9 donde aplique; SCSS modules para estilos custom no-Fluent.

