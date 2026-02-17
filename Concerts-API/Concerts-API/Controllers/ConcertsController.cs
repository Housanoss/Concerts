using Concerts_API.Data;
using Concerts_API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        // GET all concerts
        [HttpGet]
        public async Task<IActionResult> GetAllConcerts()
        {
            var concerts = await _context.Concerts.ToListAsync();
            return Ok(concerts);
        }

        // GET single concert by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetConcert(int id)
        {
            var concert = await _context.Concerts.FindAsync(id);

            if (concert == null)
            {
                return NotFound(new { error = "Concert not found" });
            }

            return Ok(concert);
        }
        // 1. PŘIDÁNÍ NOVÉHO KONCERTU (Pouze Admin)
        [HttpPost]
        // [Authorize(Roles = "Admin")] // Odkomentujte, až budete mít hotové role
        public async Task<IActionResult> CreateConcert([FromBody] Concert concert)
        {
            if (concert == null) return BadRequest();

            // Zde jsme smazali logiku s Headlinerem, protože tu vlastnost nemáte.
            // Backend prostě uloží to, co přijde v 'Bands'.

            _context.Concerts.Add(concert);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetConcert), new { id = concert.Id }, concert);
        }

        // 2. ÚPRAVA EXISTUJÍCÍHO KONCERTU (Pouze Admin)
        [HttpPut("{id}")]
        // [Authorize(Roles = "Admin")] // Odkomentujte, až budete mít hotové role
        public async Task<IActionResult> UpdateConcert(int id, [FromBody] Concert concert)
        {
            if (id != concert.Id) return BadRequest("ID se neshoduje");

            var existing = await _context.Concerts.FindAsync(id);
            if (existing == null) return NotFound();

            // Aktualizace polí (Headliner a Openers jsme vyhodili)
            existing.Bands = concert.Bands;
            existing.Venue = concert.Venue;
            existing.Date = concert.Date;
            existing.Price = concert.Price;
            existing.Description = concert.Description;
            existing.Genres = concert.Genres;

            // Pokud máte v DB sloupec Sold_out (nebo SoldOut), použijte správný název:
            existing.Sold_out = concert.Sold_out;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Koncert byl aktualizován" });
        }
    }
}