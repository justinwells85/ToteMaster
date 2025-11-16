namespace ToteMasterAPI.Models;

public class Container
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int LocationId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Location? Location { get; set; }
    public ICollection<Item> Items { get; set; } = new List<Item>();
}
