using Concerts_API.Data;
using Concerts_API.Entities;
using Concerts_API.Users.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Concerts_API.Users;

// Musí být PUBLIC, aby ji viděl Controller
public sealed class RegisterUser
{
    private readonly WebDbContext _context;
    private readonly PasswordHasher _passwordHasher;

    public RegisterUser(WebDbContext context, PasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    // I toto musí být PUBLIC
    public sealed record Request(string Email, string Username, string Password);

    public async Task Handle(Request request)
    {
        // 1. Ověření, zda email už neexistuje
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new Exception("Email is already in use");
        }

        // 2. Vytvoření uživatele
        var user = new User
        {
            Email = request.Email,
            Username = request.Username,
            Password = _passwordHasher.Hash(request.Password) // Uložení hesla (zatím jen text, pokud nemáte hashování)
        };

        // 3. Uložení do DB
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }
}