# BitesAndMore.API

API REST del catálogo (ASP.NET Core .NET 10, EF Core + PostgreSQL, JWT, Cloudinary).

## Documentación del proyecto

La documentación SDD vive en `../docs/` (repositorio raíz):

- `../docs/constitution.md`: principios no negociables. Leer primero.
- `../docs/roadmap.md`: estado y deuda técnica conocida.
- `../docs/decisions.md`: decisiones de arquitectura.
- `../docs/specs/001` a `005`: funcionalidades del backend ya implementadas; `008`: despliegue.

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
- Documentación en español; código, comentarios, textos de interfaz y commits en inglés. Conventional Commits sin atribución de IA.
