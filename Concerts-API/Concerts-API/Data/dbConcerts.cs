using Microsoft.EntityFrameworkCore;
namespace Concerts_API.Data
{
    public class dbConcerts : DbContext
    {
        public DbSet<Concert> Concerts { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySQL("server=mysqlstudenti.litv.sssvt.cz;database=4c1_simunekmartin_db2;user=simunekmartin;password=123456");
        }
    }
}
