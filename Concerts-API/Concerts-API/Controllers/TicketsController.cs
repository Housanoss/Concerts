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

        
        // Filters tickets by the UserId column
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetUserTickets(int userId)
        {
            var userTickets = await _context.Tickets
                // Load the Concert info so we see "Sabaton" instead of just "1"
                .Include(t => t.Concert)
                .Where(t => t.UserId == userId)
                .ToListAsync();

            if (userTickets == null || !userTickets.Any())
            {
                return Ok(new List<Ticket>()); // Return empty list instead of 404
            }

            return Ok(userTickets);
        }

        // POST: api/tickets/purchase
        // Saves a new ticket to the database
        [HttpPost("purchase")]
        public async Task<ActionResult<Ticket>> PurchaseTicket([FromBody] Ticket ticket)
        {
            try
            {
                // Safety Check: Ensure the Concert exists before selling a ticket
                var concertExists = await _context.Concerts.AnyAsync(c => c.Id == ticket.ConcertId);
                if (!concertExists)
                {
                    return BadRequest("The selected concert does not exist.");
                }

                // Add and Save
                _context.Tickets.Add(ticket);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Ticket purchased successfully!", ticketId = ticket.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }
    }
}