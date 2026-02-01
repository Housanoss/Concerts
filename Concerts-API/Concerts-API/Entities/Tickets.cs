using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Concerts_API.Entities
{
    [Table("Tickets")]
    public class Ticket
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        // Foreign Key for Concert
        [Column("Concert_id")]
        public int ConcertId { get; set; }

        // Foreign Key for User
        [Column("User_id")]
        public int UserId { get; set; }

        [Column("Price", TypeName = "decimal(10, 0)")]
        public decimal Price { get; set; }

        [Column("Type", TypeName = "text")]
        public string Type { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ConcertId))]
        [InverseProperty("Tickets")]
        public virtual Concert Concert { get; set; }

        [ForeignKey(nameof(UserId))]
        [InverseProperty("Tickets")]
        public virtual User User { get; set; }
    }
}
