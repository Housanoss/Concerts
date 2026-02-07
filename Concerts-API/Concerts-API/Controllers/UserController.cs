using Concerts_API.Users;
using Microsoft.AspNetCore.Mvc;
using Concerts_API.Entities;
using Concerts_API.Data;
using Microsoft.EntityFrameworkCore;


namespace Concerts_API.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
public class UsersController : ControllerBase
{
    // ==========================================
    //  REGISTRACE
    // ==========================================
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterUser.Request request,   // (email, username, password)
        [FromServices] RegisterUser registerUser)  // to zpracuje
    {
        try
        {
            await registerUser.Handle(request);
            return Ok(new { Message = "User registered successfully!" });
        }
        catch (Exception ex)
        {
            // Pokud email už existuje, vrátíme chybu 400
            return BadRequest(new { Error = ex.Message });
        }
    }

    // ==========================================
    //  PŘIHLÁŠENÍ 
    // =========================================
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginUser.Request request,      // (email, password)
        [FromServices] LoginUser loginUser)        //ověří heslo a vyrobí token
    {
        try
        {
            string token = await loginUser.Handle(request);

            // Vrátíme token v JSONu, aby si ho React mohl uložit
            return Ok(new { Token = token });
        }
        catch (Exception ex)
        {
            // Pokud je špatné heslo nebo uživatel neexistuje
            return BadRequest(new { Error = ex.Message });
        }
    }
}