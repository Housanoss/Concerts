using Concerts_API.Data;
using Concerts_API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

        [HttpGet("mine")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserTickets(int userId)
        {
            // --- DEBUG VÝPIS DO KONZOLE SERVERU ---
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value
                       ?? User.FindFirst("id")?.Value;

            Console.WriteLine($"--------------------------------------------------");
            Console.WriteLine($"[DEBUG] Kdo volá API? ID string z tokenu je: '{userIdString}'");

            // Přejmenovali jsme proměnnou na 'parsedUserId', aby se nehádala s jinými
            if (!int.TryParse(userIdString, out int parsedUserId))
            {
                Console.WriteLine($"[DEBUG] CHYBA: Nedokázal jsem převést '{userIdString}' na číslo (int)!");
                return Unauthorized("Token neobsahuje platné ID uživatele.");
            }

            // Teď už víme, že ID je číslo, podíváme se do DB
            var ticketCount = await _context.Tickets.CountAsync(t => t.UserId == parsedUserId);
            Console.WriteLine($"[DEBUG] ID je {parsedUserId}. Počet lístků v DB pro toto ID: {ticketCount}");

            // Pro jistotu vypíšeme, komu lístky patří
            var existingIds = await _context.Tickets.Select(t => t.UserId).Distinct().ToListAsync();
            Console.WriteLine($"[DEBUG] V DB existují lístky jen pro tato UserId: {string.Join(", ", existingIds)}");
            Console.WriteLine($"--------------------------------------------------");
            // ---------------------------------------

            var rawTickets = await _context.Tickets
                    .Include(t => t.Concert)
                    .Where(t => t.UserId == parsedUserId)
                    .ToListAsync();

            if (rawTickets == null || !rawTickets.Any())
            {
                // Vrátíme 200 OK, ale prázdný seznam (žádné lístky)
                return Ok(new List<object>());
            }

            // 3. Formátování (stejné jako předtím)
            var formattedTickets = rawTickets.Select(t =>
            {
                var c = t.Concert;
                if (c == null) return null;

                var splitBands = string.IsNullOrEmpty(c.Bands)
                    ? new List<string>()
                    : c.Bands.Split(',').Select(b => b.Trim()).ToList();

                var dynamicHeadliner = splitBands.FirstOrDefault() ?? "TBA";
                var dynamicOpeners = string.Join(", ", splitBands.Skip(1));

                return new
                {
                    TicketId = t.Id,
                    UserId = t.UserId,
                    ConcertId = c.Id,
                    Venue = c.Venue,
                    Date = c.Date,
                    Price = c.Price,
                    Description = c.Description,
                    SoldOut = c.Sold_out,
                    Headliner = dynamicHeadliner,
                    Openers = dynamicOpeners
                };
            })
            .Where(x => x != null)
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