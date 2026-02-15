using Concerts_API.Data;
using Concerts_API.Entities;
using Concerts_API.Users;
using Concerts_API.Users.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace Concerts_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {

        private readonly WebDbContext _context;
        private readonly PasswordHasher _passwordHasher;
        private readonly LoginUser _loginUser;

        public UsersController(WebDbContext context, PasswordHasher passwordHasher, LoginUser loginUser)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _loginUser = loginUser;
        }

        // REGISTER
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
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully!" });
        }

        // LOGIN
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Zavoláme vaši třídu LoginUser, která ověří heslo a vyrobí token
                var response = await _loginUser.Handle(new LoginUser.Request(request.Email, request.Password));

                // Vrátíme token + informace o uživateli
                return Ok(new
                {
                    token = response.Token,
                    username = response.Username,
                    email = response.Email,
                    userId = response.UserId
                });
            }
            catch (Exception ex)
            {
                // Když se nepovede přihlásit (špatné heslo atd.), vrátíme chybu 401
                return Unauthorized(new { error = ex.Message });
            }
        }

        // DELETE CURRENT USER
        [Authorize]
        [HttpDelete("me")]
        public async Task<IActionResult> DeleteCurrentUser()
        {
            // Zjistíme ID přihlášeného uživatele z Tokenu
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            // Najdeme uživatele v databázi
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            // Smažeme uživatele
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account deleted successfully." });
        }

        // GET CURRENT USER INFO
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            // Zjistíme ID přihlášeného uživatele z Tokenu
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            // Najdeme uživatele v databázi
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            // Vrátíme základní info
            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role
            });
        }

        // UPDATE CURRENT USER
        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateCurrentUserRequest request)
        {
            // Zjistíme ID přihlášeného uživatele z Tokenu
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            // Najdeme uživatele v databázi
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            // Aktualizace údajů
            bool changed = false;

            // Změna jména
            if (!string.IsNullOrEmpty(request.Username) && request.Username != user.Username)
            {
                user.Username = request.Username;
                changed = true;
            }

            // Změna emailu
            if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
            {
                // Kontrola, jestli email už nemá někdo jiný
                if (await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId))
                {
                    return BadRequest(new { Error = "Email is already taken by someone else." });
                }
                user.Email = request.Email;
                changed = true;
            }

            // Změna hesla (volitelné)
            if (!string.IsNullOrEmpty(request.Password))
            {
                user.PasswordHash = _passwordHasher.Hash(request.Password);
                changed = true;
            }

            // Uložíme změny pouze pokud se něco změnilo
            if (changed)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Profile updated successfully!" });
        }

        // UPDATE (starý endpoint s CurrentPassword - můžeš si nechat oba)
        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest request)
        {
            // Zjistíme ID přihlášeného uživatele z Tokenu
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            // Najdeme uživatele v databázi
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            // BEZPEČNOST: Ověříme, že zadal správné aktuální heslo
            bool isPasswordCorrect = _passwordHasher.Verify(request.CurrentPassword, user.PasswordHash);
            if (!isPasswordCorrect)
            {
                return BadRequest(new { Error = "Wrong current password!" });
            }

            // Aktualizace údajů (jen pokud je vyplnil)

            // Změna jména
            if (!string.IsNullOrEmpty(request.NewUsername))
            {
                user.Username = request.NewUsername;
            }

            // Změna emailu
            if (!string.IsNullOrEmpty(request.NewEmail))
            {
                // Kontrola, jestli email už nemá někdo jiný
                if (await _context.Users.AnyAsync(u => u.Email == request.NewEmail && u.Id != userId))
                {
                    return BadRequest(new { Error = "Email is already taken by someone else." });
                }
                user.Email = request.NewEmail;
            }

            // Změna hesla
            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
            }

            // Uložíme změny
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully!" });
        }
    }

    // Pomocné třídy pro data z formuláře
    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class UpdateCurrentUserRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public class UpdateUserRequest
    {
        public string CurrentPassword { get; set; }
        public string? NewUsername { get; set; }
        public string? NewEmail { get; set; }
        public string? NewPassword { get; set; }
    }
}