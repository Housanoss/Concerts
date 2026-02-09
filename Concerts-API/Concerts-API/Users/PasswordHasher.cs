namespace Concerts_API.Users.Infrastructure;

public sealed class PasswordHasher
{
    public string Hash(string password)
    {
        // Na hokusy pikusy musi se predelat na realne hashovani, napr. BCrypt nebo PBKDF2
        return password;
    }

    public bool Verify(string password, string passwordHash)
    {
        // Prozatím porovnání:
        return password == passwordHash;
    }
}