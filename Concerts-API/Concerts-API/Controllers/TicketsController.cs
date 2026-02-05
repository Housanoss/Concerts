using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Concerts_API.Data;
using Concerts_API.Entities;

namespace Concerts_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly WebDbContext _context;

        public TicketsController(WebDbContext context)
        {
            _context = context;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserTickets(int userId)
        {
            // 1. Stáhneme lístky z DB v?etn? informací o koncertu
            var rawTickets = await _context.Tickets
                .Include(t => t.Concert) //P?ipojí tabulku Concerts
                .Where(t => t.UserId == userId)
                .ToListAsync();

            if (rawTickets == null || !rawTickets.Any())
            {
                return Ok(new List<object>());
            }

            // 2. Upraveni dat 
            var formattedTickets = rawTickets.Select(t =>
            {
                var c = t.Concert;

                //overeni ze existuje
                if (c == null) return null;

                //ROZD?LENÍ KAPEL (zkopírováno z ConcertsController)
                var splitBands = string.IsNullOrEmpty(c.Bands)
                    ? new List<string>()
                    : c.Bands.Split(',').Select(b => b.Trim()).ToList();

                var dynamicHeadliner = splitBands.FirstOrDefault() ?? "TBA";
                var dynamicOpeners = string.Join(", ", splitBands.Skip(1));

                // 3.  Data lístku + Data koncertu
                return new
                {
                    // Info o lístku
                    TicketId = t.Id,
                    UserId = t.UserId,

                    // Info o koncertu
                    ConcertId = c.Id,
                    Venue = c.Venue,
                    Date = c.Date,
                    Price = c.Price,
                    Description = c.Description,
                    SoldOut = c.Sold_out,

                    // Naformátované kapely
                    Headliner = dynamicHeadliner,
                    Openers = dynamicOpeners
                };
            })
            .Where(x => x != null) // Odfiltruje null hodnoty
            .ToList();

            return Ok(formattedTickets);
        }


        [HttpPost("purchase")]
        public async Task<ActionResult<Ticket>> PurchaseTicket([FromBody] Ticket ticket)
        {
            try
            {
                // Kontrola existence koncertu
                var concertExists = await _context.Concerts.AnyAsync(c => c.Id == ticket.ConcertId);
                if (!concertExists)
                {
                    return BadRequest("The selected concert does not exist.");
                }

                _context.Tickets.Add(ticket);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Ticket purchased successfully!", ticketId = ticket.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        // DELETE: Storno lístku
        [HttpDelete("{ticketId}")]
        public async Task<IActionResult> DeleteTicket(int ticketId)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
            {
                return NotFound("Ticket not found");
            }

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Ticket was cancelled." });
        }
    }
}