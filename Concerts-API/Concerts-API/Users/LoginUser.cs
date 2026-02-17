using Concerts_API.Data;
using Concerts_API.Entities;
using Concerts_API.Users.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Concerts_API.Users;

public sealed class LoginUser
{
    private readonly WebDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    private readonly TokenProvider _tokenProvider;

    public LoginUser(WebDbContext context, PasswordHasher passwordHasher, TokenProvider tokenProvider)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenProvider = tokenProvider;
    }

    // Vstupní data (Email a Heslo)
    public sealed record Request(string Email, string Password);

    // Výstupní data - vrátíme token + info o uživateli
    // Přidejte ", string Role" nakonec seznamu
    public record Response(string Token, string Username, string Email, int UserId, string Role);

    public async Task<Response> Handle(Request request)
    {
        // 1. Najdeme uživatele podle emailu
        User? user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        // 2. Pokud uživatel neexistuje
        if (user is null)
        {
            throw new Exception("Nesprávný email nebo heslo.");
        }

        // 3. POJISTKA PRO STARÁ DATA
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new Exception("Uživatel nemá nastavené bezpečné heslo (starý účet).");
        }

        // 4. OVĚŘENÍ HESLA
        bool verified = _passwordHasher.Verify(request.Password, user.PasswordHash);
        if (!verified)
        {
            throw new Exception("Nesprávný email nebo heslo.");
        }

        // 5. Pokud je vše OK, vygenerujeme token
        string token = _tokenProvider.Create(user);

        // 6. Vrátíme token + informace o uživateli
        return new Response(
            Token: token,
            Username: user.Username,  // nebo user.Name, podle toho co máte v User entity
            Email: user.Email,
            UserId: user.Id,
            Role: user.Role
        );
    }
}