using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Concerts_API.Data;
using Concerts_API.Entities;

namespace Concerts_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConcertsController : ControllerBase
    {
        private readonly WebDbContext _context;

        public ConcertsController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/concerts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetConcerts()
        {
            try
            {
                
                var rawConcerts = await _context.Concerts.ToListAsync();

               
                var formattedList = rawConcerts.Select(c =>
                {
                    // Split 
                    var splitBands = c.Bands != null
                        ? c.Bands.Split(',').Select(b => b.Trim()).ToList()
                        : new List<string>();

                    // Logic: First band is Headliner, the rest are Openers
                    var dynamicHeadliner = splitBands.FirstOrDefault() ?? "TBA";
                    var dynamicOpeners = string.Join(", ", splitBands.Skip(1));

                    
                    return new
                    {
                        c.Id,
                        c.Venue,
                        c.Date,
                        c.Price,
                        c.Genres,
                        c.Description,
                        c.Sold_out,
                        Bands = c.Bands,
                        Headliner = dynamicHeadliner,
                        Openers = dynamicOpeners
                    };
                });

                return Ok(formattedList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database Error: {ex.Message}");
            }
        }
    }
}