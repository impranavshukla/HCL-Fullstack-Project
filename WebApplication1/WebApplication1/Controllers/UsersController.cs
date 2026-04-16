using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using WebApplication1.Data;
using WebApplication1.Model;
using WebApplication1.DTO;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Users>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Users>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(user);
        }

        // POST: api/users/register
        [HttpPost]
        public async Task<IActionResult> AddUser(Users user)
        {
            var passwordHasher = new PasswordHasher<Users>();

            // Hash password before saving
            user.password_hash = passwordHasher.HashPassword(user, user.password_hash);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User registered successfully",
                data = user
            });
        }

        // POST: api/users/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.email == login.email);

            if (user == null)
            {
                return Unauthorized("Invalid email");
            }

            var passwordHasher = new PasswordHasher<Users>();

            var result = passwordHasher.VerifyHashedPassword(
                user,
                user.password_hash,
                login.password
            );

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized("Invalid password");
            }

            return Ok(new
            {
                message = "Login successful",
                user = new
                {
                    user.user_id,
                    user.full_name,
                    user.email,
                    user.role
                }
            });
        }

        // PUT: api/users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, Users user)
        {
            if (id != user.user_id)
            {
                return BadRequest("User ID mismatch");
            }

            var passwordHasher = new PasswordHasher<Users>();
            user.password_hash = passwordHasher.HashPassword(user, user.password_hash);

            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok("User updated successfully");
        }

        // DELETE: api/users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound("User not found");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("User deleted successfully");
        }
    }
}