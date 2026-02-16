using Concerts_API.Data;
using Concerts_API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Concerts_API.Controllers
{
    [ApiController]
    [Route("api/tickets")]
    public class TicketsController : ControllerBase
    {
        private readonly WebDbContext _context;

        public TicketsController(WebDbContext context)
        {
            _context = context;
        }

        // GET all tickets
        [HttpGet]
        public async Task<IActionResult> GetAllTickets()
        {
            var tickets = await _context.Tickets.ToListAsync();
            return Ok(tickets);
        }

        // GET tickets by concert ID
        [HttpGet("concert/{concertId}")]
        public async Task<IActionResult> GetTicketsByConcert(int concertId)
        {
            var tickets = await _context.Tickets
                .Where(t => t.ConcertId == concertId)
                .ToListAsync();
            return Ok(tickets);
        }

        // GET tickets for current user
        [Authorize]
        [HttpGet("mine")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserTickets()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value
                       ?? User.FindFirst("id")?.Value;

            Console.WriteLine($"--------------------------------------------------");
            Console.WriteLine($"[DEBUG] Kdo vola API? ID string z tokenu je: '{userIdString}'");

            if (!int.TryParse(userIdString, out int parsedUserId))
            {
                Console.WriteLine($"[DEBUG] CHYBA: Nedokazal jsem prevest '{userIdString}' na cislo (int)!");
                return Unauthorized("Token neobsahuje platne ID uzivatele.");
            }

            var ticketCount = await _context.Tickets.CountAsync(t => t.UserId == parsedUserId);
            Console.WriteLine($"[DEBUG] ID je {parsedUserId}. Pocet listku v DB pro toto ID: {ticketCount}");

            var existingIds = await _context.Tickets.Select(t => t.UserId).Distinct().ToListAsync();
            Console.WriteLine($"[DEBUG] V DB existuji listky jen pro tato UserId: {string.Join(", ", existingIds)}");
            Console.WriteLine($"--------------------------------------------------");

            var rawTickets = await _context.Tickets
                    .Include(t => t.Concert)
                    .Where(t => t.UserId == parsedUserId)
                    .ToListAsync();

            if (rawTickets == null || !rawTickets.Any())
            {
                return Ok(new List<object>());
            }

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
                    ConcertId = t.ConcertId,
                    Venue = c.Venue,
                    Date = c.Date,
                    Price = t.Price,
                    Type = t.Type,
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

        // POST purchase ticket
        [Authorize]
        [HttpPost("{ticketId}/purchase")]
        public async Task<IActionResult> PurchaseTicket(int ticketId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null) return NotFound(new { error = "Ticket not found" });

            if (ticket.UserId != null && ticket.UserId != 0)
                return BadRequest(new { error = "Ticket already sold" });

            ticket.UserId = userId;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Ticket purchased successfully" });
        }

        // POST create new ticket (original purchase endpoint)
        [HttpPost("purchase")]
        public async Task<ActionResult<Ticket>> CreateTicket([FromBody] Ticket ticket)
        {
            try
            {
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

        // DELETE ticket
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