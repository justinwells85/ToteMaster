import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllItems, updateItem, deleteItem } from '@/services/itemsService';
import { getAllTotes } from '@/services/totesService';
import { getAllTags, getTagsByItemId, addTagToItem, removeTagFromItem } from '@/services/tagsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Edit, Trash2, Package, Tag, Image as ImageIcon } from 'lucide-react';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    description: '',
    toteId: ''
  });
  const [selectedTags, setSelectedTags] = useState([]);

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
  });

  const { data: totes = [] } = useQuery({
    queryKey: ['totes'],
    queryFn: getAllTotes,
  });

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags,
  });

  const { data: itemTags = [] } = useQuery({
    queryKey: ['itemTags', id],
    queryFn: () => getTagsByItemId(id),
    enabled: !!id,
  });

  const item = items.find((i) => i.id === id);
  const tote = totes.find((t) => t.id === item?.toteId);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setIsEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/items');
    },
  });

  const handleEdit = () => {
    if (item) {
      setEditForm({
        name: item.name || '',
        category: item.category || '',
        description: item.description || '',
        toteId: item.toteId || '',
      });
      setIsEditOpen(true);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          ...editForm,
          toteId: editForm.toteId || null,
        }
      });
    } catch (err) {
      alert(err.message || 'Failed to update item');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${item?.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        alert(err.message || 'Failed to delete item');
      }
    }
  };

  const handleManageTags = () => {
    setSelectedTags(itemTags.map(t => t.id));
    setIsTagsOpen(true);
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSaveTags = async () => {
    try {
      const currentTagIds = itemTags.map(t => t.id);
      const toAdd = selectedTags.filter(id => !currentTagIds.includes(id));
      const toRemove = currentTagIds.filter(id => !selectedTags.includes(id));

      for (const tagId of toAdd) {
        await addTagToItem(id, tagId);
      }
      for (const tagId of toRemove) {
        await removeTagFromItem(id, tagId);
      }

      queryClient.invalidateQueries({ queryKey: ['itemTags', id] });
      setIsTagsOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to update tags');
    }
  };

  if (!item) {
    return (
      <div className="container mx-auto px-8 py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Item not found</p>
          <Button onClick={() => navigate('/items')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/items')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Items
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">{item.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              {item.category && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{item.category}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>{tote ? `Tote #${tote.id}` : 'No tote'}</span>
              </div>
              {itemTags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{itemTags.length} tags</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleManageTags}>
              <Tag className="mr-2 h-4 w-4" />
              Tags
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Item Details */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {item.description || 'No description provided'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            {tote ? (
              <div
                onClick={() => navigate(`/totes/${tote.id}`)}
                className="p-4 rounded-md border hover:bg-accent cursor-pointer transition-colors"
              >
                <p className="font-medium">Tote #{tote.id}</p>
                <p className="text-sm text-muted-foreground">
                  {tote.location || 'No location specified'}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Not assigned to any tote. Use the edit button to assign it.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        {itemTags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {itemTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                      color: tag.color || '#374151',
                      border: `1px solid ${tag.color || '#d1d5db'}`,
                    }}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        {item.photos && item.photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {item.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden border bg-muted flex items-center justify-center"
                  >
                    <img
                      src={photo}
                      alt={`Item photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="flex items-center justify-center w-full h-full text-muted-foreground"><ImageIcon class="h-12 w-12" /></div>`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">
                  {item.category || 'Uncategorized'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent onClose={() => setIsEditOpen(false)}>
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  placeholder="e.g., Electronics, Tools, Clothing"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tote</label>
                <Select
                  value={editForm.toteId}
                  onChange={(e) => setEditForm({ ...editForm, toteId: e.target.value })}
                >
                  <option value="">No tote</option>
                  {totes.map((tote) => (
                    <option key={tote.id} value={tote.id}>
                      Tote #{tote.id}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tags Management Dialog */}
      <Dialog open={isTagsOpen} onOpenChange={setIsTagsOpen}>
        <DialogContent onClose={() => setIsTagsOpen(false)}>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {allTags.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No tags available. Create tags from the Dashboard.
                </p>
              ) : (
                allTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="w-4 h-4"
                      />
                      <span>{tag.name}</span>
                    </div>
                    {tag.color && (
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTagsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTags}>
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
