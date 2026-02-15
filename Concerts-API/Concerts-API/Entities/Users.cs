using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Sockets;

namespace Concerts_API.Entities
{
    [Table("Users")]
    public class User
    {
        // Constructor to initialize the collection for the relationship
        public User()
        {
            Tickets = new HashSet<Ticket>();
        }

        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Column("Username")]
        [StringLength(255)] // Good practice based on varchar(255)
        public string Username { get; set; }

        [Column("Email")]
        [StringLength(255)]
        public string Email { get; set; }

        [Column("Password")]
        [StringLength(255)]
        public string PasswordHash { get; set; }

        // Navigation property: One User has many Tickets
        [InverseProperty(nameof(Ticket.User))]
        public virtual ICollection<Ticket> Tickets { get; set; }

        [Column("Role")]
        public string Role { get; set; } = "User";
    }
}
