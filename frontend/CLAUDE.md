@AGENTS.md

## Documentación del proyecto

Este frontend vive en la subcarpeta `frontend/` del repositorio de código (`BitesAndMore.API`, ADR-022); la antigua carpeta `bitesandmore-frontend/` está sustituida. Los commits se hacen en ese repositorio.

La documentación SDD vive en `../../docs/` (repositorio raíz). Antes de trabajar aquí:

- `../../docs/constitution.md`: principios no negociables (sin carrito ni pagos, pedidos por WhatsApp, una sola administradora).
- `../../docs/roadmap.md`: estado de las funcionalidades y preguntas abiertas para la clienta.
- `../../docs/specs/006-frontend-public-site/`: sitio público.
- `../../docs/specs/007-frontend-admin-panel/`: panel de administración.
- `../../docs/specs/008-deployment/`: despliegue en Vercel (*Root Directory* `frontend`, variable `API_URL`).

El contrato de la API está en el `plan.md` de cada spec. Al terminar trabajo, actualizar `tasks.md`, `spec.md` y `roadmap.md`.

Convenciones: documentación en español; código, identificadores, comentarios y commits en inglés; textos de interfaz en español neutro y profesional (ADR-013). Conventional Commits sin atribución de IA.

## Arquitectura

- `app/(site)/`: sitio público (Server Components, `revalidate = 60`). `app/admin/`: panel; `app/admin/(panel)/` exige sesión.
- `lib/api/`: cliente tipado de la API. `lib/api/server.ts` es solo de servidor (`API_URL`). El navegador nunca llama a la API ni ve el JWT.
- Sesión: cookie `httpOnly` `bam_session` (ADR-015); `proxy.ts` protege `/admin/*`; las Server Actions usan `runAdminAction` (`lib/admin/run.ts`).
- Diseño: `../../docs/design-system.md` (ADR-018, ADR-020; tonos pastel en `lib/tones.ts`; `public/mock/` son fotos de muestra locales que se eliminan antes de producción). Tokens semánticos de color y tipografía en `app/globals.css` (`@theme`); recetas de clases en `components/ui/styles.ts`. Las fotos usan `MediaImage`; el mordisco (`.bite-mask`) solo aparece en `HeroBite` de la portada. El rosa (`accent`) nunca es fondo de sección ni texto.
- Movimiento (ADR-019): tokens en `lib/motion.ts`, `MotionProvider` en el layout raíz, `usePrefersReducedMotion` (no el de framer-motion, que rompe la hidratación). Lo visible al cargar se anima con CSS (`.page-enter`, `.hero-word`, `.media-enter`, `.stagger-in` en `globals.css`); lo que aparece al desplazarse, con `components/motion/Reveal.tsx`. Diapositivas del hero en `lib/hero-slides.ts` (fotos de Unsplash provisionales).
- Pruebas: `npm test` (Vitest, ADR-014), escritas antes del código.
