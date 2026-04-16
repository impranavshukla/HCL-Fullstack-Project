using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Model
{
    public class Amenities
    {
        [Key]
        public int AmenityId { get; set; }

        [Required]
        [StringLength(100)]
        public string AmenityName { get; set; } = string.Empty;
    }
}
