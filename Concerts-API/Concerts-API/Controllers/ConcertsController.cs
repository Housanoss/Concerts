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
        public async Task<IActionResult> CreateConcert([FromBody] Concert concert)
        {
            if (concert == null) return BadRequest();
            _context.Concerts.Add(concert);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetConcert), new { id = concert.Id }, concert);
        }

        // 2. ÚPRAVA EXISTUJÍCÍHO KONCERTU (Pouze Admin)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConcert(int id, [FromBody] Concert concert)
        {
            if (id != concert.Id) return BadRequest("ID se neshoduje");
            var existing = await _context.Concerts.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Bands = concert.Bands;
            existing.Venue = concert.Venue;
            existing.Date = concert.Date;
            existing.Price = concert.Price;
            existing.Description = concert.Description;
            existing.Genres = concert.Genres;
            existing.Sold_out = concert.Sold_out;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Koncert byl aktualizován" });
        }

        // 3. SMAZÁNÍ KONCERTU (Pouze Admin)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConcert(int id)
        {
            var concert = await _context.Concerts.FindAsync(id);
            if (concert == null) return NotFound();

            // Nejdřív smažeme všechny lístky tohoto koncertu
            var tickets = await _context.Tickets.Where(t => t.ConcertId == id).ToListAsync();
            _context.Tickets.RemoveRange(tickets);

            // Pak smažeme koncert
            _context.Concerts.Remove(concert);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Koncert byl smazán." });
        }
    }
}