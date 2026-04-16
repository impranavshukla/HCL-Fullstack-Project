using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Model
{
    public class Users
    {
        [Key]
        public int user_id { get; set; }

        [Required]
        [StringLength(100)]
        public string full_name { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string email { get; set; }

        [Required]
        public string password_hash { get; set; }

        [Required]
        public string role { get; set; }

        public string? profile_image_url { get; set; }

        public DateTime created_at { get; set; } = DateTime.Now;
    }
}