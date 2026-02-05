using Concerts_API.Data;
using Concerts_API.Users;
using Concerts_API.Users.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer; // TOTO VYŘEŠÍ CHYBU
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // TOTO VYŘEŠÍ CHYBU TokenValidationParameters
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Připojení k DB (to už asi máte)
builder.Services.AddDbContext<WebDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Registrace vašich služeb (Dependency Injection) - BEZ TOHO TO NEPUJDE
builder.Services.AddScoped<TokenProvider>();
builder.Services.AddScoped<PasswordHasher>();
builder.Services.AddScoped<LoginUser>();

// 3. Konfigurace JWT Autentizace
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ... zbytek kódu (Swagger, MapControllers atd.) ...
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication(); // PŘIDAT: Musí být PŘED UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();