using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Concerts_API.Entities
{
    [Table("Band")]
    public class Band
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Column("Band_name")]
        [StringLength(255)]
        public string BandName { get; set; }

        [Column("Genres", TypeName = "text")]
        public string Genres { get; set; }

        [Column("Description", TypeName = "text")]
        public string Description { get; set; }
    }
}
