using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using Concerts_API.Data; 
using Concerts_API.Entities;


namespace Concerts_API.Controllers
{
    
    [Route("api/[controller]")] // address: api/concerts
    [ApiController]

    public class BandController : Controller
    {
        //private readonly dbConcerts _context;

        //// 1. Konstruktor: Tady si "převezmeme" připojení k databázi
        //public BandController(dbConcerts context)
        //{
        //    _context = context;
        //}

        // 2. Metoda pro získání všech koncertů
        // GET: api/concerts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Band>>> GetConcerts()
        {
            // Pokud je databáze prázdná, vrátí prázdný seznam.
            // Pokud v ní něco je, vrátí data.



            List<string> concerts = new List<string>();
            concerts.Add("asdfasdfa");
            concerts.Add("asdfasdfa");
            concerts.Add("asdfasdfa");
            //return await _context.Concerts.ToListAsync();
            return Json(concerts);
        }
    }
    
}
