using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToteMasterAPI.Data;
using ToteMasterAPI.Models;

namespace ToteMasterAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly ToteMasterContext _context;

    public LocationsController(ToteMasterContext context)
    {
        _context = context;
    }

    // GET: api/Locations
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Location>>> GetLocations()
    {
        return await _context.Locations
            .Include(l => l.Containers)
            .ToListAsync();
    }

    // GET: api/Locations/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Location>> GetLocation(int id)
    {
        var location = await _context.Locations
            .Include(l => l.Containers)
                .ThenInclude(c => c.Items)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (location == null)
        {
            return NotFound();
        }

        return location;
    }

    // POST: api/Locations
    [HttpPost]
    public async Task<ActionResult<Location>> CreateLocation(Location location)
    {
        location.CreatedAt = DateTime.UtcNow;
        location.UpdatedAt = DateTime.UtcNow;
        
        _context.Locations.Add(location);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLocation), new { id = location.Id }, location);
    }

    // PUT: api/Locations/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLocation(int id, Location location)
    {
        if (id != location.Id)
        {
            return BadRequest();
        }

        location.UpdatedAt = DateTime.UtcNow;
        _context.Entry(location).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!LocationExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/Locations/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLocation(int id)
    {
        var location = await _context.Locations.FindAsync(id);
        if (location == null)
        {
            return NotFound();
        }

        _context.Locations.Remove(location);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool LocationExists(int id)
    {
        return _context.Locations.Any(e => e.Id == id);
    }
}
