using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/rooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rooms>>> GetRooms()
        {
            return await _context.Rooms
                .Include(r => r.Hotel)
                .ToListAsync();
        }

        // GET: api/rooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Rooms>> GetRoom(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.Hotel)
                .FirstOrDefaultAsync(r => r.RoomId == id);

            if (room == null)
            {
                return NotFound();
            }

            return room;
        }

        // GET: api/rooms/hotel/1
        [HttpGet("hotel/{hotelId}")]
        public async Task<ActionResult<IEnumerable<Rooms>>> GetRoomsByHotel(int hotelId)
        {
            var rooms = await _context.Rooms
                .Where(r => r.HotelId == hotelId)
                .Include(r => r.Hotel)
                .ToListAsync();

            return rooms;
        }

        // GET: api/rooms/available?hotelId=1
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<Rooms>>> GetAvailableRooms([FromQuery] int hotelId)
        {
            var rooms = await _context.Rooms
                .Where(r => r.HotelId == hotelId && r.IsAvailable)
                .Include(r => r.Hotel)
                .ToListAsync();

            return rooms;
        }

        // POST: api/rooms
        [HttpPost]
        public async Task<ActionResult<Rooms>> CreateRoom(Rooms room)
        {
            var hotelExists = await _context.Hotels.AnyAsync(h => h.HotelId == room.HotelId);
            if (!hotelExists)
            {
                return BadRequest("Invalid HotelId. Hotel does not exist.");
            }

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoom), new { id = room.RoomId }, room);
        }

        // PUT: api/rooms/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, Rooms room)
        {
            if (id != room.RoomId)
            {
                return BadRequest("RoomId mismatch.");
            }

            var hotelExists = await _context.Hotels.AnyAsync(h => h.HotelId == room.HotelId);
            if (!hotelExists)
            {
                return BadRequest("Invalid HotelId. Hotel does not exist.");
            }

            _context.Entry(room).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoomExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/rooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RoomExists(int id)
        {
            return _context.Rooms.Any(r => r.RoomId == id);
        }
    }
}