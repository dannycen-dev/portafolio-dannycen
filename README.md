# Portafolio — Danny Cen

Sitio personal en Astro para ofrecer servicios como desarrollador web y freelancer (automatización e IA).

## Stack

- [Astro](https://astro.build) 7
- GSAP (loader, hero reveal, scroll)
- View Transitions (`ClientRouter`)
- Tipografía: Syne + Figtree

## Desarrollo

```bash
npm install
npm run dev
```

Abre la URL que imprima Astro (por defecto `http://localhost:4321`).

```bash
npm run build
npm run preview
```

## Contenido editable

- Datos personales / nav / servicios: `src/data/site.ts`
- Proyectos: `src/data/projects.ts`
- Foto: reemplaza el placeholder del hero en `src/components/Hero.astro`

## Estructura

```
src/
  components/   Header, Footer, Hero, ProjectCard, SiteLoader
  data/         contenido del CV
  layouts/      BaseLayout
  pages/        /, /about, /projects, /contact
  scripts/      animaciones GSAP
  styles/       tokens y estilos globales
```
