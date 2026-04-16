using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Model
{
    public class Hotel
    {
        [Key]
        public int HotelId { get; set; }

        [Required]
        [StringLength(150)]
        public string HotelName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        public string Address { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Column(TypeName = "decimal(2,1)")]
        public decimal? Rating { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}