using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AmenitiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AmenitiesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/amenities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Amenities>>> GetAmenities()
        {
            return await _context.Amenities.ToListAsync();
        }

        // GET: api/amenities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Amenities>> GetAmenity(int id)
        {
            var amenity = await _context.Amenities.FindAsync(id);

            if (amenity == null)
            {
                return NotFound("Amenity not found.");
            }

            return amenity;
        }

        // POST: api/amenities
        [HttpPost]
        public async Task<ActionResult<Amenities>> CreateAmenity(Amenities amenity)
        {
            _context.Amenities.Add(amenity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAmenity), new { id = amenity.AmenityId }, amenity);
        }

        // PUT: api/amenities/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAmenity(int id, Amenities amenity)
        {
            if (id != amenity.AmenityId)
            {
                return BadRequest("AmenityId mismatch.");
            }

            _context.Entry(amenity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AmenityExists(id))
                {
                    return NotFound("Amenity not found.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/amenities/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAmenity(int id)
        {
            var amenity = await _context.Amenities.FindAsync(id);

            if (amenity == null)
            {
                return NotFound("Amenity not found.");
            }

            _context.Amenities.Remove(amenity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AmenityExists(int id)
        {
            return _context.Amenities.Any(e => e.AmenityId == id);
        }
    }
}