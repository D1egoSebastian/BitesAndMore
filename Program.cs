using BitesAndMore.API.Data;
using BitesAndMore.API.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Scalar.AspNetCore;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;


var builder = WebApplication.CreateBuilder(args);

// Fail fast: the API cannot issue or validate tokens without a signing key.
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("Configuration value 'Jwt:Key' is required. Set it through user secrets or an environment variable.");
}

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(
        options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
    );

//to define (for tokens)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(jwtKey);
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });


//Allow frontend petitions only from the configured origins (Cors:AllowedOrigins)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
    policy.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}


app.UseHttpsRedirection();

// CORS must run before authentication/authorization so preflight requests are answered.
app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Liveness probe for the external keep-alive cron. Deliberately touches no services or database,
// so pings keep the Render instance awake without waking the Neon compute.
app.MapGet("/health", () => Results.Ok(new { status = "ok" })).AllowAnonymous();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await AdminSeeder.SeedAsync(context, app.Configuration);
}

app.Run();

// Exposes the entry point to the integration test project (WebApplicationFactory<Program>).
public partial class Program { }
