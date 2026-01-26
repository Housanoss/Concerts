using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Sockets;

namespace Concerts_API.Entities
{
    [Table("Concert")]
    public class Concert
    {
        public Concert()
        {
            Tickets = new HashSet<Ticket>();
        }

        [Key]
        [Column("Id")]
        public int Id { get; set; }

        // Mapping MySQL 'date' to C# DateTime
        [Column("Date")]
        public DateTime Date { get; set; }

        [Column("Venue", TypeName = "text")]
        public string Venue { get; set; }

        [Column("HeadLiner", TypeName = "varchar(50)")]
        public string HeadLiner { get; set; }

        [Column("Bands", TypeName = "varchar(255)")]
        public string Bands { get; set; }

        // Mapping decimal(10,0)
        [Column("Price", TypeName = "decimal(10, 0)")]
        public decimal Price { get; set; }

        // Mapping tinyint(1) to bool is standard for MySQL connector
        [Column("Sold_out")]
        public bool SoldOut { get; set; }

        [Column("Description", TypeName = "text")]
        public string Description { get; set; }

        [Column("Genres", TypeName = "text")]
        public string Genres { get; set; }

        // Navigation property: One Concert has many Tickets
        [InverseProperty(nameof(Ticket.Concert))]
        public virtual ICollection<Ticket> Tickets { get; set; }
    }
}
