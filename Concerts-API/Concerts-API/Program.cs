var builder = WebApplication.CreateBuilder(args);

// --- 1. ALL SERVICES GO HERE ---
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Add your DB Context here if it's not already there
builder.Services.AddDbContext<Concerts_API.Data.WebDbContext>();

// Add CORS here (BEFORE builder.Build)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// --- 2. BUILD THE APP (ONLY ONCE) ---
var app = builder.Build();

// --- 3. MIDDLEWARE PIPELINE GOES HERE ---
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Use the policy we defined above
app.UseCors("AllowReactApp");

app.UseAuthorization();
app.MapControllers();

app.Run();