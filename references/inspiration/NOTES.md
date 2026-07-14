# Referencias de inspiración (capturas agent-browser)

Capturas tomadas con [agent-browser](https://github.com/vercel-labs/agent-browser) en viewport **desktop 1440×900** y **iPhone 14**, no con el navegador embebido de Cursor.

Fecha: 2026-07-13

## Sitios

| Sitio | Estado | Carpeta |
|-------|--------|---------|
| [timmyomahony.com](https://timmyomahony.com/) | OK (favorito) | `timmyomahony/` |
| [mxb.dev](https://mxb.dev/) | OK | `mxb/` |
| [robbowen.digital](https://robbowen.digital/) | OK | `robbowen/` |
| [iakoe.com](https://iakoe.com/) | OK (SSL OK vía agent-browser) | `iakoe/` |
| [kemiadeleke.com](https://www.kemiadeleke.com/) | Falló: `ERR_CERT_COMMON_NAME_INVALID` | `kemiadeleke/` (error pages) |

Archivos por sitio (cuando aplica):

- `desktop-hero.png` — primer viewport
- `desktop-full.png` — página completa
- `mobile-hero.png` / `mobile-full.png` — same en móvil
- Extras Timmy: `desktop-projects.png`, `desktop-posts.png`
- Extra Robb: `desktop-mid.png`

---

## Hallazgos de diseño (para iterar nuestro Astro)

### Timmy (principal)

- **Hero desktop:** dos columnas — foto vertical grande a la **izquierda**, copy a la **derecha** (nombre en nav + email acento coral + headline serif + bio + iconos sociales).
- **Hero mobile:** foto full-width → headline serif → bio → iconos.
- Fondo crema cálido; tipografía **serif en H1** + **sans en UI/body**.
- Proyectos: grid **3 columnas**, media monócroma, título bold sans, descripción corta; mucho aire.
- Branding fuerte por **foto real + nombre**, no por ilustraciones abstractas.

### Max Böck

- Dark mode, headline serif grande (“I make websites.”).
- Nav numerada `01 home`… y underline magenta activo.
- Featured posts: fila horizontal de cards con imagen full-bleed y título sobrepuesto.
- Temas / personalidad (Mario Kart tracks) = diferenciador memorable.

### Robb Owen

- Hero tipográfico + ilustración line-art a la derecha.
- Loader / intro animada antes del contenido.
- Serif display + tipografía estrecha en caps para “MENU / HIRE ME”.
- Mucho movimiento intencional; página se siente “viva”.

### iakoe (agencia)

- Hero **full-bleed** fotográfico con headline serif blanco encima.
- CTA pill “BOOK A CALL”, barra “Trusted By” con logos.
- Útil para sección freelance de confianza, no para copiar el look de agencia.

### Kemi Adeleke

- No disponible: certificado SSL inválido. Revisitar cuando el cert esté OK.

---

## Ajustes sugeridos a nuestro portafolio

1. Acercar layout Timmy: **foto izquierda + copy derecha** en desktop (ya casi); reforzar **serif en el H1**.
2. Grid de proyectos más denso tipo Timmy (3 cols) cuando haya 6+ piezas.
3. Mantener animaciones estilo Robb (loader + reveals), sin sobrecargar el minimalismo Timmy.
4. Opcional: fila “trabajado con / stack” tipo trust strip de iakoe (logos de tools, no marcas inventadas).
5. Prioridad: **foto profesional real** — es el ancla #1 del sitio Timmy.
