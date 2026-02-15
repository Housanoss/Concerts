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

        // --- REGISTRACE ---
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { Error = "Email is already taken." });
            }

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

        // --- PŘIHLÁŠENÍ ---
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
        {
            try
            {
                var response = await _loginUser.Handle(new LoginUser.Request(request.Email, request.Password));

                return Ok(new
                {
                    token = response, // Token je string
                    // Pokud LoginUser vrací jen string, nemůžeme vrátit username/email/id.
                    // Pokud jste LoginUser neupravoval, vrací jen token.
                    // Pro jednoduchost teď vracíme jen token:
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        // --- ZÍSKÁNÍ DAT O UŽIVATELI (ME) ---
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return NotFound("User not found.");

            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role
            });
        }

        // --- AKTUALIZACE PROFILU (Bezpečná verze) ---
        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest request)
        {
            // 1. Identifikace uživatele
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            // 2. OVĚŘENÍ STARÉHO HESLA (Nutné!)
            bool isPasswordCorrect = _passwordHasher.Verify(request.CurrentPassword, user.PasswordHash);
            if (!isPasswordCorrect)
            {
                return BadRequest(new { Error = "Zadali jste špatné současné heslo." });
            }

            // 3. Změny údajů
            bool changed = false;

            if (!string.IsNullOrEmpty(request.NewUsername))
            {
                user.Username = request.NewUsername;
                changed = true;
            }

            if (!string.IsNullOrEmpty(request.NewEmail) && request.NewEmail != user.Email)
            {
                if (await _context.Users.AnyAsync(u => u.Email == request.NewEmail && u.Id != userId))
                {
                    return BadRequest(new { Error = "Tento email už používá někdo jiný." });
                }
                user.Email = request.NewEmail;
                changed = true;
            }

            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
                changed = true;
            }

            // 4. Uložení
            if (changed)
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Profil byl úspěšně aktualizován!" });
            }

            return Ok(new { message = "Nic se nezměnilo." });
        }
    }

    // --- DTO TŘÍDY (Obálky na data) ---

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

    // Toto je ta BEZPEČNÁ verze, kterou jsme si nechali
    public class UpdateUserRequest
    {
        public string CurrentPassword { get; set; } // Povinné pro ověření
        public string? NewUsername { get; set; }
        public string? NewEmail { get; set; }
        public string? NewPassword { get; set; }
    }
}