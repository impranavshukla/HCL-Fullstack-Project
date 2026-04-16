using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Model
{
    public class Rooms
    {
        [Key]
        public int RoomId { get; set; }

        [Required]
        public int HotelId { get; set; }

        [ForeignKey("HotelId")]
        public Hotel? Hotel { get; set; }

        [Required]
        [StringLength(20)]
        public string RoomNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string RoomType { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerNight { get; set; }

        [Required]
        public int Capacity { get; set; }

        public bool IsAvailable { get; set; } = true;

        [StringLength(250)]
        public string? AmenitiesText { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}