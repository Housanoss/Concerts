using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Fixes ToListAsync
using Concerts_API.Data;
using Concerts_API.Entities; // Fixes the 'Concerts' type error

[ApiController] // Tells .NET this is an API (not a website with HTML)
[Route("api/[controller]")] // Sets the URL to: your-site.com/api/concerts
public class ConcertsController : ControllerBase
{
    private readonly WebDbContext _context;

    // Dependency Injection: This "grabs" your database connection so the controller can use it
    public ConcertsController(WebDbContext context)
    {
        _context = context;
    }

    [HttpGet] // This method runs when the user does a GET request
    public async Task<ActionResult<IEnumerable<concerts>>> GetConcerts()
    {
        // 1. Ask the database for the list of concerts
        var list = await _context.Concerts.ToListAsync();

        // 2. Send that list back to the browser as JSON
        return Ok(list);
    }
}