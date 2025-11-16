using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToteMasterAPI.Data;
using ToteMasterAPI.Models;

namespace ToteMasterAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly ToteMasterContext _context;

    public ItemsController(ToteMasterContext context)
    {
        _context = context;
    }

    // GET: api/Items
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Item>>> GetItems()
    {
        return await _context.Items
            .Include(i => i.Container)
                .ThenInclude(c => c!.Location)
            .ToListAsync();
    }

    // GET: api/Items/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> GetItem(int id)
    {
        var item = await _context.Items
            .Include(i => i.Container)
                .ThenInclude(c => c!.Location)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        return item;
    }

    // POST: api/Items
    [HttpPost]
    public async Task<ActionResult<Item>> CreateItem(Item item)
    {
        // Verify container exists
        if (!await _context.Containers.AnyAsync(c => c.Id == item.ContainerId))
        {
            return BadRequest("Container does not exist");
        }

        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        
        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
    }

    // PUT: api/Items/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, Item item)
    {
        if (id != item.Id)
        {
            return BadRequest();
        }

        // Verify container exists
        if (!await _context.Containers.AnyAsync(c => c.Id == item.ContainerId))
        {
            return BadRequest("Container does not exist");
        }

        item.UpdatedAt = DateTime.UtcNow;
        _context.Entry(item).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ItemExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/Items/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ItemExists(int id)
    {
        return _context.Items.Any(e => e.Id == id);
    }
}
