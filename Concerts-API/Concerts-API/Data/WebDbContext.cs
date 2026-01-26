using Concerts_API.Entities;
using Microsoft.EntityFrameworkCore;


namespace Concerts_API.Data
{
    public class WebDbContext : DbContext
    {
        public DbSet<Concert> Concerts { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Band> Bands { get; set; }
        public DbSet<Ticket> Tickets { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySQL("server=mysqlstudenti.litv.sssvt.cz;database=4c1_simunekmartin_db2;user=simunekmartin;password=123456");
        }
    }
}
