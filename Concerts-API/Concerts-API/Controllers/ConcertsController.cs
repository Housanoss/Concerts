using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Concerts_API.Data;
using Concerts_API.Entities;

namespace Concerts_API.Controllers
{
    [ApiController]
    // This defines the URL path. [controller] automatically becomes "Concerts"
    [Route("api/[controller]")]
    public class ConcertsController : ControllerBase
    {
        private readonly WebDbContext _context;

        // We "Inject" the database context here so we can use it in our methods
        public ConcertsController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/concerts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Concert>>> GetConcerts()
        {
            try
            {
                // Task.Run logic: Fetch all rows from the Concerts table in MySQL
                var list = await _context.Concerts.ToListAsync();

                // Send the data back to React with a "200 OK" status
                return Ok(list);
            }
            catch (Exception ex)
            {
                // If something breaks (like the DB connection), tell the user why
                return StatusCode(500, $"Database Error: {ex.Message}");
            }
        }
    }
}