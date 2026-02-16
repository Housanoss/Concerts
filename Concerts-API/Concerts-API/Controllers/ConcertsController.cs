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
    }
}