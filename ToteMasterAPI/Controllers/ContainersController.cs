using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToteMasterAPI.Data;
using ToteMasterAPI.Models;

namespace ToteMasterAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContainersController : ControllerBase
{
    private readonly ToteMasterContext _context;

    public ContainersController(ToteMasterContext context)
    {
        _context = context;
    }

    // GET: api/Containers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Container>>> GetContainers()
    {
        return await _context.Containers
            .Include(c => c.Location)
            .Include(c => c.Items)
            .ToListAsync();
    }

    // GET: api/Containers/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Container>> GetContainer(int id)
    {
        var container = await _context.Containers
            .Include(c => c.Location)
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (container == null)
        {
            return NotFound();
        }

        return container;
    }

    // POST: api/Containers
    [HttpPost]
    public async Task<ActionResult<Container>> CreateContainer(Container container)
    {
        // Verify location exists
        if (!await _context.Locations.AnyAsync(l => l.Id == container.LocationId))
        {
            return BadRequest("Location does not exist");
        }

        container.CreatedAt = DateTime.UtcNow;
        container.UpdatedAt = DateTime.UtcNow;
        
        _context.Containers.Add(container);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContainer), new { id = container.Id }, container);
    }

    // PUT: api/Containers/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateContainer(int id, Container container)
    {
        if (id != container.Id)
        {
            return BadRequest();
        }

        // Verify location exists
        if (!await _context.Locations.AnyAsync(l => l.Id == container.LocationId))
        {
            return BadRequest("Location does not exist");
        }

        container.UpdatedAt = DateTime.UtcNow;
        _context.Entry(container).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ContainerExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/Containers/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteContainer(int id)
    {
        var container = await _context.Containers.FindAsync(id);
        if (container == null)
        {
            return NotFound();
        }

        _context.Containers.Remove(container);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ContainerExists(int id)
    {
        return _context.Containers.Any(e => e.Id == id);
    }
}
