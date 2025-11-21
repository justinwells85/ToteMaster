import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllTotes } from '@/services/totesService';
import { getAllItems } from '@/services/itemsService';
import { getAllLocations } from '@/services/locationsService';
import { getAllTags } from '@/services/tagsService';
import { generateTestData, clearAllData } from '@/services/testDataService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, Box, MapPin, Database, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ totes: [], items: [], locations: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const { data: totes = [], isLoading: totesLoading } = useQuery({
    queryKey: ['totes'],
    queryFn: getAllTotes,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: getAllLocations,
  });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ totes: [], items: [], locations: [] });
      return;
    }

    const query = searchQuery.toLowerCase();

    const matchedTotes = totes.filter(
      (tote) =>
        tote.location?.toLowerCase().includes(query) ||
        tote.description?.toLowerCase().includes(query) ||
        tote.id?.toString().includes(query)
    );

    const matchedItems = items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );

    const matchedLocations = locations.filter(
      (location) =>
        location.name.toLowerCase().includes(query) ||
        location.room?.toLowerCase().includes(query) ||
        location.position?.toLowerCase().includes(query) ||
        location.specificReference?.toLowerCase().includes(query)
    );

    setSearchResults({ totes: matchedTotes, items: matchedItems, locations: matchedLocations });
  }, [searchQuery, totes, items, locations]);

  const handleGenerateTestData = async () => {
    try {
      setIsGenerating(true);
      const result = await generateTestData();
      toast.success('Test data generated successfully!', {
        description: `Created ${result.summary.totes} totes with ${result.summary.items} items`,
      });
      // Refetch all data
      queryClient.invalidateQueries(['totes']);
      queryClient.invalidateQueries(['items']);
      queryClient.invalidateQueries(['locations']);
      queryClient.invalidateQueries(['tags']);
    } catch (error) {
      toast.error('Failed to generate test data', {
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      return;
    }

    try {
      setIsClearing(true);
      const result = await clearAllData();
      toast.success('All data cleared successfully!', {
        description: `Deleted ${result.summary.totes} totes and ${result.summary.items} items`,
      });
      // Refetch all data
      queryClient.invalidateQueries(['totes']);
      queryClient.invalidateQueries(['items']);
      queryClient.invalidateQueries(['locations']);
      queryClient.invalidateQueries(['tags']);
    } catch (error) {
      toast.error('Failed to clear data', {
        description: error.message,
      });
    } finally {
      setIsClearing(false);
    }
  };

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags,
  });

  const stats = {
    totalTotes: totes.length,
    totalItems: items.length,
    totalTags: tags.length,
    totalLocations: locations.length,
  };

  const isLoading = totesLoading || itemsLoading || locationsLoading || tagsLoading;

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      {/* Global Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for totes, items, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base shadow-md"
          />
        </div>

        {/* Columnar Search Results */}
        {searchQuery && (
          <div className="mt-4 grid gap-4 md:grid-cols-3 max-w-6xl">
            {/* Totes Column */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Totes ({searchResults.totes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                {searchResults.totes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No totes found</p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.totes.map((tote) => (
                      <div
                        key={tote.id}
                        onClick={() => navigate(`/totes/${tote.id}`)}
                        className="p-3 rounded-md hover:bg-accent cursor-pointer transition-colors border border-border"
                      >
                        <p className="font-medium">
                          Tote #{tote.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tote.location || 'No location'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items Column */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Items ({searchResults.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                {searchResults.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items found</p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/items/${item.id}`)}
                        className="p-3 rounded-md hover:bg-accent cursor-pointer transition-colors border border-border"
                      >
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category || 'Uncategorized'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Locations Column */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Locations ({searchResults.locations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                {searchResults.locations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No locations found</p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.locations.map((location) => (
                      <div
                        key={location.id}
                        className="p-3 rounded-md border border-border"
                      >
                        <p className="font-medium">{location.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {location.room && `${location.room}`}
                          {location.position && ` - ${location.position}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Stats Cards - Now Clickable */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/totes')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totes</CardTitle>
            <Box className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isLoading ? '...' : stats.totalTotes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to view all totes
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/items')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isLoading ? '...' : stats.totalItems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to view all items
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/tags')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
            <Tag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isLoading ? '...' : stats.totalTags}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to manage tags
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/locations')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isLoading ? '...' : stats.totalLocations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to manage locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Data Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Test Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={handleGenerateTestData}
              disabled={isGenerating || isClearing}
              variant="default"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Test Data'}
            </Button>

            <Button
              onClick={handleClearAllData}
              disabled={isGenerating || isClearing}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? 'Clearing...' : 'Clear All Data'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Generate test data creates 10 totes with 1-4 random items each. Clear all data will permanently delete all your totes, items, locations, and tags.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
