import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTotes, updateTote, deleteTote } from '@/services/totesService';
import { getAllItems } from '@/services/itemsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Edit, Trash2, Package, MapPin } from 'lucide-react';

export default function ToteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', location: '', description: '' });

  const { data: totes = [] } = useQuery({
    queryKey: ['totes'],
    queryFn: getAllTotes,
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
  });

  const tote = totes.find((t) => t.id === id);
  const itemsInTote = allItems.filter((item) => item.toteId === id);

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
        name: tote.name || '',
        location: tote.location || '',
        description: tote.description || '',
      });
      setIsEditOpen(true);
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
    if (window.confirm(`Are you sure you want to delete "${tote?.name}"? This will not delete the items inside.`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        alert(err.message || 'Failed to delete tote');
      }
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
            <h1 className="text-4xl font-bold text-primary mb-2">{tote.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              {tote.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{tote.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>{itemsInTote.length} items</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
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
              <DialogTitle>Edit Tote</DialogTitle>
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
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="e.g., Garage, Basement, Attic"
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
    </div>
  );
}
