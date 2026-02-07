using Concerts_API.Data;
using Concerts_API.Entities;
using Concerts_API.Users;
using Concerts_API.Users.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer; // TOTO VYŘEŠÍ CHYBU
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // TOTO VYŘEŠÍ CHYBU TokenValidationParameters
using System.Reflection;
using System.Text;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// 1. Připojení k DB (to už asi máte)
// C#
builder.Services.AddDbContext<WebDbContext>(options =>
    options.UseMySQL(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Registrace vašich služeb (Dependency Injection) - BEZ TOHO TO NEPUJDE
builder.Services.AddScoped<TokenProvider>();
builder.Services.AddScoped<PasswordHasher>();
builder.Services.AddScoped<LoginUser>();
builder.Services.AddScoped<RegisterUser>();

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

builder.Services.AddScoped<RegisterUser>();
builder.Services.AddScoped<LoginUser>();
//builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});


var app = builder.Build();
app.UseCors("Frontend");


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

public class WebDbContext : DbContext
{
    public WebDbContext(DbContextOptions<WebDbContext> options) : base(options) { }

    public DbSet<Concert> Concerts { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Band> Bands { get; set; }
    public DbSet<Ticket> Tickets { get; set; }

}