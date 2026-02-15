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

    public async Task<string> Handle(Request request)
    {
        // 1. Najdeme uživatele podle emailu
        User? user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        // 2. Pokud uživatel neexistuje
        if (user is null)
        {
            throw new Exception("Nesprávný email nebo heslo.");
        }

        // 3. POJISTKA PRO STARÁ DATA
        // Pokud máte v databázi uživatele vytvořené před změnou na hashování,
        // nemají žádný hash (je null). Těm se nejde přihlásit.
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new Exception("Uživatel nemá nastavené bezpečné heslo (starý účet).");
        }

        // 4. OVĚŘENÍ HESLA
        // Voláme metodu Verify z vašeho PasswordHasheru.
        // DŮLEŽITÉ: První je heslo z formuláře, druhé je hash z databáze.
        bool verified = _passwordHasher.Verify(request.Password, user.PasswordHash);

        if (!verified)
        {
            throw new Exception("Nesprávný email nebo heslo.");
        }

        // 5. Pokud je vše OK, vygenerujeme token
        string token = _tokenProvider.Create(user);

        return token;
    }
}