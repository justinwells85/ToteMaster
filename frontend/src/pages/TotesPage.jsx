import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { getAllTotes, deleteTote, createTote } from '@/services/totesService';
import { getAllLocations, createLocation } from '@/services/locationsService';
import { getAllTags } from '@/services/tagsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Trash2, Eye, ArrowUpDown, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function TotesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    locationId: '',
    description: '',
    color: '',
    tags: [],
  });
  const [newLocationMode, setNewLocationMode] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    room: '',
    position: '',
    specificReference: '',
  });

  const { data: totes = [], isLoading, error } = useQuery({
    queryKey: ['totes'],
    queryFn: getAllTotes,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: getAllLocations,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['totes'] });
      toast.success('Tote deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete tote', {
        description: error.message,
      });
    },
  });

  const createToteMutation = useMutation({
    mutationFn: createTote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['totes'] });
      setIsCreateOpen(false);
      setCreateForm({ locationId: '', description: '', color: '', tags: [] });
      setNewLocationMode(false);
      setNewLocation({ name: '', room: '', position: '', specificReference: '' });
      toast.success('Tote created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create tote', {
        description: error.message,
      });
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: (newLoc) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setCreateForm({ ...createForm, locationId: newLoc.id });
      setNewLocationMode(false);
      setNewLocation({ name: '', room: '', position: '', specificReference: '' });
      toast.success('Location created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create location', {
        description: error.message,
      });
    },
  });

  const handleDelete = async (toteId) => {
    if (window.confirm(`Are you sure you want to delete Tote #${toteId}?`)) {
      deleteMutation.mutate(toteId);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.name.trim()) {
      toast.error('Location name is required');
      return;
    }
    createLocationMutation.mutate(newLocation);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // If in new location mode, create location first
    if (newLocationMode) {
      if (!newLocation.name.trim()) {
        toast.error('Please complete the location details or switch back to select mode');
        return;
      }
      // Location will be created and tote creation will happen after location is created
      await handleCreateLocation(e);
      return;
    }

    createToteMutation.mutate(createForm);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="hover:bg-accent"
            >
              Tote ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-bold text-primary">#{row.getValue('id')}</div>
        ),
      },
      {
        accessorKey: 'locationId',
        header: 'Location',
        cell: ({ row }) => {
          const locationId = row.getValue('locationId');
          const location = locations.find((loc) => loc.id === locationId);
          return (
            <div className="flex items-center gap-2 text-muted-foreground">
              {location ? (
                <>
                  <MapPin className="h-3 w-3" />
                  <span>{location.name}</span>
                </>
              ) : (
                <span className="italic">No location</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="text-muted-foreground truncate max-w-md">
            {row.getValue('description') || <span className="italic">No description</span>}
          </div>
        ),
      },
      {
        accessorKey: 'color',
        header: 'Color',
        cell: ({ row }) => {
          const color = row.getValue('color');
          return color ? (
            <Badge variant="outline">{color}</Badge>
          ) : (
            <span className="text-muted-foreground italic">None</span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const tote = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/totes/${tote.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(tote.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate, locations]
  );

  const table = useReactTable({
    data: totes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
  });

  if (error) {
    return (
      <div className="container mx-auto px-8 py-8">
        <div className="text-destructive">Error loading totes: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Totes</h1>
        <p className="text-muted-foreground">
          Manage your storage containers and organize your inventory
        </p>
      </div>

      {/* Toolbar */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search totes by ID, description, or location..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Tote
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="rounded-md">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No totes found. Create your first tote to get started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-end space-x-2 p-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                totes.length
              )}{' '}
              of {totes.length} totes
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create New Tote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your tote will be automatically assigned a sequential ID number
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                {!newLocationMode ? (
                  <div className="space-y-2">
                    <Select
                      value={createForm.locationId}
                      onValueChange={(value) => setCreateForm({ ...createForm, locationId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No location</SelectItem>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name} {loc.room && `(${loc.room})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewLocationMode(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Location
                    </Button>
                  </div>
                ) : (
                  <Card className="p-4 space-y-3 border-primary">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">New Location</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewLocationMode(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        value={newLocation.name}
                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                        placeholder="Location name *"
                        required
                      />
                      <Input
                        value={newLocation.room}
                        onChange={(e) => setNewLocation({ ...newLocation, room: e.target.value })}
                        placeholder="Room (e.g., Garage)"
                      />
                      <Input
                        value={newLocation.position}
                        onChange={(e) => setNewLocation({ ...newLocation, position: e.target.value })}
                        placeholder="Position (e.g., Shelf #2)"
                      />
                      <Input
                        value={newLocation.specificReference}
                        onChange={(e) => setNewLocation({ ...newLocation, specificReference: e.target.value })}
                        placeholder="Specific reference (e.g., Top shelf, left side)"
                      />
                    </div>
                  </Card>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <Select
                  value={createForm.color}
                  onValueChange={(value) => setCreateForm({ ...createForm, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No color</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="clear">Clear</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsCreateOpen(false);
                setNewLocationMode(false);
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createToteMutation.isPending || createLocationMutation.isPending}>
                {createToteMutation.isPending || createLocationMutation.isPending ? 'Creating...' : 'Create Tote'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
