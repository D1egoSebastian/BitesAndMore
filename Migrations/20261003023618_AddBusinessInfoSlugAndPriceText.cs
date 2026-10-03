using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BitesAndMore.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessInfoSlugAndPriceText : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Price",
                table: "Services",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ServiceType",
                table: "Services",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Price changes from integer to free text. A plain AlterColumn would generate an ALTER without
            // a USING clause, which PostgreSQL rejects for this conversion, so the cast is written explicitly.
            migrationBuilder.Sql("ALTER TABLE \"Products\" ALTER COLUMN \"Price\" TYPE text USING \"Price\"::text;");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Products",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BusinessInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    BusinessName = table.Column<string>(type: "text", nullable: true),
                    Mission = table.Column<string>(type: "text", nullable: true),
                    Vision = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    WhatsAppNumber = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Instagram = table.Column<string>(type: "text", nullable: true),
                    Facebook = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessInfos", x => x.Id);
                });

            // Backfill slugs for existing products (lowercase, common Spanish accents removed, hyphen-separated).
            // Duplicates get a numeric suffix (-2, -3, ...) so the unique index can be created.
            migrationBuilder.Sql(@"
                WITH base AS (
                    SELECT ""Id"",
                           COALESCE(NULLIF(trim(both '-' from regexp_replace(
                               translate(lower(COALESCE(""Name"", '')), 'áéíóúüñ', 'aeiouun'),
                               '[^a-z0-9]+', '-', 'g')), ''), 'product') AS slug
                    FROM ""Products""
                ), ranked AS (
                    SELECT ""Id"", slug,
                           row_number() OVER (PARTITION BY slug ORDER BY ""Id"") AS rn
                    FROM base
                )
                UPDATE ""Products"" p
                SET ""Slug"" = CASE WHEN r.rn = 1 THEN r.slug ELSE r.slug || '-' || r.rn END
                FROM ranked r
                WHERE p.""Id"" = r.""Id"";");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Slug",
                table: "Products",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BusinessInfos");

            migrationBuilder.DropIndex(
                name: "IX_Products_Slug",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ServiceType",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Products");

            // Lossy by design: keeps only the digits of the text price (non-numeric prices become NULL).
            migrationBuilder.Sql("ALTER TABLE \"Products\" ALTER COLUMN \"Price\" TYPE integer USING NULLIF(regexp_replace(\"Price\", '[^0-9]', '', 'g'), '')::integer;");
        }
    }
}
