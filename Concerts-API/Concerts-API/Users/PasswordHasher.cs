using Microsoft.AspNetCore.Identity; 
using Concerts_API.Users.Infrastructure;

namespace Concerts_API.Users.Infrastructure;

public sealed class PasswordHasher
{
    // Použijeme vestavěný bezpečný hasher od Microsoftu
    private readonly PasswordHasher<object> _hasher = new PasswordHasher<object>();

    // Tuto metodu voláte při REGISTRACI
    public string Hash(string password)
    {
       
        return _hasher.HashPassword(null, password);
    }

    // Tuto metodu voláte při PŘIHLÁŠENÍ (LOGIN)
    public bool Verify(string password, string passwordHash)
    {
        // Porovná zadané heslo (password) s uloženým hashem (passwordHash)
        var result = _hasher.VerifyHashedPassword(null, passwordHash, password);

        return result == PasswordVerificationResult.Success;
    }
}