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

    public sealed record Request(string Email, string Password);

    public async Task<string> Handle(Request request)
    {
        // Získání uživatele
        User? user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        // Ověření verifikace emailu
        if (user is null) //|| !user.EmailVerified zatim jen jestli existuje, zeptat se na email
        {
            throw new Exception("The user was not found or not verified");
        }

        // Ověření hesla
        bool verified = _passwordHasher.Verify(request.Password, user.Password);

        if (!verified)
        {
            throw new Exception("The password is incorrect");
        }

        // Vygenerování tokenu
        string token = _tokenProvider.Create(user);

        return token;
    }
}