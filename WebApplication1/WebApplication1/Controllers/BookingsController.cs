using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bookings>>> GetBookings()
        {
            return await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .ThenInclude(r => r.Hotel)
                .ToListAsync();
        }

        // GET: api/bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Bookings>> GetBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .ThenInclude(r => r.Hotel)
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (booking == null)
            {
                return NotFound("Booking not found.");
            }

            return booking;
        }

        // GET: api/bookings/customer/1
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<Bookings>>> GetBookingsByCustomer(int customerId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.CustomerId == customerId)
                .Include(b => b.Room)
                .ThenInclude(r => r.Hotel)
                .ToListAsync();

            return bookings;
        }

        // POST: api/bookings
        [HttpPost]
        public async Task<ActionResult<Bookings>> CreateBooking(Bookings booking)
        {
            if (booking.CheckInDate >= booking.CheckOutDate)
            {
                return BadRequest("Check-out date must be after check-in date.");
            }

            var customer = await _context.Users.FindAsync(booking.CustomerId);
            if (customer == null)
            {
                return BadRequest("Invalid CustomerId. Customer does not exist.");
            }

            var room = await _context.Rooms.FindAsync(booking.RoomId);
            if (room == null)
            {
                return BadRequest("Invalid RoomId. Room does not exist.");
            }

            if (!room.IsAvailable)
            {
                return BadRequest("Selected room is not available.");
            }

            if (booking.GuestCount > room.Capacity)
            {
                return BadRequest("Guest count exceeds room capacity.");
            }

            var totalDays = (booking.CheckOutDate - booking.CheckInDate).Days;
            booking.TotalAmount = totalDays * room.PricePerNight;

            booking.BookingStatus = "Confirmed";
            booking.BookedAt = DateTime.Now;

            if (string.IsNullOrWhiteSpace(booking.ReservationNumber))
            {
                booking.ReservationNumber = Guid.NewGuid().ToString().Substring(0, 8);
            }

            _context.Bookings.Add(booking);

            // simple MVP logic:
            // once booked, mark room unavailable
            room.IsAvailable = false;

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBooking), new { id = booking.BookingId }, booking);
        }

        // PUT: api/bookings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(int id, Bookings booking)
        {
            if (id != booking.BookingId)
            {
                return BadRequest("BookingId mismatch.");
            }

            if (booking.CheckInDate >= booking.CheckOutDate)
            {
                return BadRequest("Check-out date must be after check-in date.");
            }

            var customerExists = await _context.Users.AnyAsync(u => u.UserId == booking.CustomerId);
            if (!customerExists)
            {
                return BadRequest("Invalid CustomerId. Customer does not exist.");
            }

            var room = await _context.Rooms.FindAsync(booking.RoomId);
            if (room == null)
            {
                return BadRequest("Invalid RoomId. Room does not exist.");
            }

            if (booking.GuestCount > room.Capacity)
            {
                return BadRequest("Guest count exceeds room capacity.");
            }

            var totalDays = (booking.CheckOutDate - booking.CheckInDate).Days;
            booking.TotalAmount = totalDays * room.PricePerNight;

            _context.Entry(booking).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookingExists(id))
                {
                    return NotFound("Booking not found.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PUT: api/bookings/5/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound("Booking not found.");
            }

            booking.BookingStatus = "Cancelled";

            var room = await _context.Rooms.FindAsync(booking.RoomId);
            if (room != null)
            {
                room.IsAvailable = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Booking cancelled successfully.",
                bookingId = booking.BookingId,
                status = booking.BookingStatus
            });
        }

        // DELETE: api/bookings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound("Booking not found.");
            }

            var room = await _context.Rooms.FindAsync(booking.RoomId);
            if (room != null)
            {
                room.IsAvailable = true;
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BookingExists(int id)
        {
            return _context.Bookings.Any(b => b.BookingId == id);
        }
    }
}