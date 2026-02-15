using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Concerts_API.Data;
using Concerts_API.Entities;
using Concerts_API.Users.Infrastructure; // Import pro PasswordHasher

namespace Concerts_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
       
        private readonly WebDbContext _context;
        private readonly PasswordHasher _passwordHasher;

        public UsersController(WebDbContext context, PasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        // 3. Metoda pro REGISTRACI
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Kontrola, jestli uživatel už neexistuje
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { Error = "Email is already taken." });
            }

            // Vytvoření nového uživatele
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                Role = "User",
                PasswordHash = _passwordHasher.Hash(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // Uložíme do DB

            return Ok(new { message = "User registered successfully!" });
        }

        // Zde můžete nechat metodu Login, pokud ji už máte...
    }

    // Pomocná třída pro data z formuláře
    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}