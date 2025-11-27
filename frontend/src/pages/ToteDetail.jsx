import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTotes, updateTote, deleteTote, uploadTotePhotos, deleteTotePhoto } from '@/services/totesService';
import { getAllItems } from '@/services/itemsService';
import { getAllLocations } from '@/services/locationsService';
import { getAllTags, getTagsByToteId, addTagToTote, removeTagFromTote } from '@/services/tagsService';
import { generateToteLabel } from '@/lib/labelGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Edit, Trash2, Package, MapPin, QrCode, Tag as TagIcon, Hash, Image as ImageIcon, X, Upload } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoGallery from '@/components/PhotoGallery';

export default function ToteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [editForm, setEditForm] = useState({ locationId: '', description: '', color: '', tags: [] });
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: totes = [] } = useQuery({
    queryKey: ['totes'],
    queryFn: getAllTotes,
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: getAllLocations,
  });

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags,
  });

  const { data: toteTags = [] } = useQuery({
    queryKey: ['toteTags', id],
    queryFn: () => getTagsByToteId(id),
    enabled: !!id,
  });

  const tote = totes.find((t) => t.id === id);
  const itemsInTote = allItems.filter((item) => item.toteId === id);
  const location = locations.find((l) => l.id === tote?.locationId);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['totes'] });
      setIsEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['totes'] });
      navigate('/totes');
    },
  });

  const handleEdit = () => {
    if (tote) {
      setEditForm({
        locationId: tote.locationId || '',
        description: tote.description || '',
        color: tote.color || '',
        tags: tote.tags || [],
      });
      setIsEditOpen(true);
    }
  };

  const handleManageTags = () => {
    setSelectedTags(toteTags.map(t => t.id));
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
      const currentTagIds = toteTags.map(t => t.id);
      const toAdd = selectedTags.filter(id => !currentTagIds.includes(id));
      const toRemove = currentTagIds.filter(id => !selectedTags.includes(id));

      for (const tagId of toAdd) {
        await addTagToTote(id, tagId);
      }
      for (const tagId of toRemove) {
        await removeTagFromTote(id, tagId);
      }

      queryClient.invalidateQueries({ queryKey: ['toteTags', id] });
      setIsTagsOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to update tags');
    }
  };

  const handleUploadPhotos = async () => {
    if (selectedPhotos.length === 0) {
      alert('Please select at least one photo');
      return;
    }

    setIsUploading(true);
    try {
      await uploadTotePhotos(id, selectedPhotos);
      queryClient.invalidateQueries({ queryKey: ['totes'] });
      setIsPhotoUploadOpen(false);
      setSelectedPhotos([]);
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.message || 'Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoUrl) => {
    try {
      await deleteTotePhoto(id, photoUrl);
      queryClient.invalidateQueries({ queryKey: ['totes'] });
    } catch (err) {
      console.error('Delete error:', err);
      throw err; // Re-throw to let PhotoGallery handle the error
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ id, data: editForm });
    } catch (err) {
      alert(err.message || 'Failed to update tote');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete Tote #${tote?.id}? This will not delete the items inside.`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        alert(err.message || 'Failed to delete tote');
      }
    }
  };

  const handleGenerateLabel = async () => {
    if (!tote) return;
    try {
      await generateToteLabel(tote);
    } catch (err) {
      alert(err.message || 'Failed to generate label');
    }
  };

  if (!tote) {
    return (
      <div className="container mx-auto px-8 py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Tote not found</p>
          <Button onClick={() => navigate('/totes')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Totes
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
          onClick={() => navigate('/totes')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Totes
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {tote.color && (
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: tote.color }}
                  title={`Color: ${tote.color}`}
                />
              )}
            </div>
            <h1 className="text-4xl font-bold text-primary mb-2">Tote #{tote.id}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{location.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>{itemsInTote.length} items</span>
              </div>
              {toteTags.length > 0 && (
                <div className="flex items-center gap-1">
                  <TagIcon className="h-4 w-4" />
                  <span>{toteTags.length} tags</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateLabel}>
              <QrCode className="mr-2 h-4 w-4" />
              Label
            </Button>
            <Button variant="outline" onClick={handleManageTags}>
              <TagIcon className="mr-2 h-4 w-4" />
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

      {/* Tote Info */}
      <div className="grid gap-6 mb-8">
        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {tote.description || 'No description provided'}
            </p>
          </CardContent>
        </Card>

        {/* Location Details */}
        {location && (
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Location Name</span>
                  <span className="font-medium">{location.name}</span>
                </div>
                {location.room && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Room</span>
                    <span className="font-medium">{location.room}</span>
                  </div>
                )}
                {location.position && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Position</span>
                    <span className="font-medium">{location.position}</span>
                  </div>
                )}
                {location.specificReference && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-medium">{location.specificReference}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {toteTags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {toteTags.map((tag) => (
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Photos</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPhotoUploadOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </Button>
          </CardHeader>
          <CardContent>
            <PhotoGallery
              photos={tote?.photos || []}
              onDeletePhoto={handleDeletePhoto}
            />
          </CardContent>
        </Card>
      </div>

      {/* Items in Tote */}
      <Card>
        <CardHeader>
          <CardTitle>Items in This Tote</CardTitle>
          <CardDescription>
            {itemsInTote.length === 0
              ? 'No items in this tote yet'
              : `${itemsInTote.length} item${itemsInTote.length !== 1 ? 's' : ''} stored here`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {itemsInTote.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              This tote is empty. Add items from the Items page.
            </p>
          ) : (
            <div className="space-y-2">
              {itemsInTote.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/items/${item.id}`)}
                  className="flex items-center justify-between p-4 rounded-md border hover:bg-accent cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.category || 'Uncategorized'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent onClose={() => setIsEditOpen(false)}>
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>Edit Tote #{tote?.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select
                  value={editForm.locationId}
                  onChange={(e) => setEditForm({ ...editForm, locationId: e.target.value })}
                >
                  <option value="">No location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <Input
                  type="color"
                  value={editForm.color}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  className="h-10 w-full"
                />
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

      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoUploadOpen} onOpenChange={setIsPhotoUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Photos</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <PhotoUpload
              onPhotosSelected={setSelectedPhotos}
              maxFiles={10}
              disabled={isUploading}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPhotoUploadOpen(false);
                setSelectedPhotos([]);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadPhotos}
              disabled={isUploading || selectedPhotos.length === 0}
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedPhotos.length} Photo${selectedPhotos.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
