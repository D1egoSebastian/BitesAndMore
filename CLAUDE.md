# BitesAndMore.API

API REST del catálogo (ASP.NET Core .NET 10, EF Core + PostgreSQL, JWT, Cloudinary).

## Estructura del repositorio

- Raíz: la API (`BitesAndMore.API.csproj`), sus pruebas (`BitesAndMore.API.Tests/`) y el `Dockerfile` para Render (ADR-023).
- `frontend/`: el frontend Next.js, importado con `git subtree` (ADR-022). Tiene su propio `CLAUDE.md`. Está excluido de la compilación del API (`Remove="frontend/**"` en el `.csproj`) y del contexto de Docker (`.dockerignore`).
- Un push a `master` redespliega la API en Render y el frontend en Vercel. Producción y variables de entorno: `../docs/specs/008-deployment/plan.md`.

## Documentación del proyecto

La documentación SDD vive en `../docs/` (repositorio raíz):

- `../docs/constitution.md`: principios no negociables. Leer primero.
- `../docs/roadmap.md`: estado y deuda técnica conocida.
- `../docs/decisions.md`: decisiones de arquitectura.
- `../docs/specs/001` a `005`: funcionalidades del backend ya implementadas; `006` y `007`: frontend; `008`: despliegue.

Todo cambio empieza como una spec en `../docs/specs/`. Al terminar, marcar `tasks.md` con el hash del commit y actualizar `roadmap.md`.

## Ejecución

```bash
dotnet user-secrets set "Jwt:Key" "<clave de 32+ caracteres>"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<cadena de conexión Postgres>"
# también Cloudinary:CloudName, Cloudinary:ApiKey, Cloudinary:ApiSecret, Admin:Email, Admin:Name, Admin:Password

dotnet ef database update
dotnet run          # http://localhost:5047 ; Scalar en /scalar (solo Development)
```

## Pruebas

```bash
dotnet test BitesAndMore.API.Tests/BitesAndMore.API.Tests.csproj
```

xUnit + `WebApplicationFactory` + EF InMemory (no requiere base de datos ni secretos). EF InMemory no aplica claves foráneas ni índices únicos.

## Convenciones

- TDD estricto: prueba que falla → implementación mínima → refactorización.
- Secretos solo en user-secrets o variables de entorno; los `appsettings*.json` mantienen los valores secretos vacíos.
- Helpers en `Helpers/` (el espacio de nombres `Services` choca con `Models.Services`). Enums serializados como texto.
- Documentación en español; código, comentarios y commits en inglés; textos de interfaz del frontend en español (ADR-013). Conventional Commits sin atribución de IA.
