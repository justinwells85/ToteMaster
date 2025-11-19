import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllTotes } from '@/services/totesService';
import { getAllItems } from '@/services/itemsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Package, Box, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ totes: [], items: [] });

  const { data: totes = [], isLoading: totesLoading } = useQuery({
    queryKey: ['totes'],
    queryFn: getAllTotes,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
  });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ totes: [], items: [] });
      return;
    }

    const query = searchQuery.toLowerCase();
    const matchedTotes = totes.filter(
      (tote) =>
        tote.name.toLowerCase().includes(query) ||
        tote.location?.toLowerCase().includes(query) ||
        tote.description?.toLowerCase().includes(query)
    );

    const matchedItems = items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );

    setSearchResults({ totes: matchedTotes, items: matchedItems });
  }, [searchQuery, totes, items]);

  const stats = {
    totalTotes: totes.length,
    totalItems: items.length,
    recentItems: items.slice(0, 5),
  };

  const isLoading = totesLoading || itemsLoading;

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      {/* Hero Section with Global Search */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Welcome to ToteMaster
        </h1>
        <p className="text-muted-foreground mb-8">
          Find anything in your home inventory instantly
        </p>

        {/* Global Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for totes or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base shadow-md"
          />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mt-4 max-w-2xl">
            <Card>
              <CardContent className="p-4">
                {searchResults.totes.length === 0 && searchResults.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No results found</p>
                ) : (
                  <div className="space-y-4">
                    {searchResults.totes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 text-primary">
                          Totes ({searchResults.totes.length})
                        </h3>
                        <div className="space-y-2">
                          {searchResults.totes.map((tote) => (
                            <div
                              key={tote.id}
                              onClick={() => navigate(`/totes/${tote.id}`)}
                              className="p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                            >
                              <p className="font-medium">{tote.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {tote.location || 'No location'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {searchResults.items.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 text-primary">
                          Items ({searchResults.items.length})
                        </h3>
                        <div className="space-y-2">
                          {searchResults.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => navigate(`/items/${item.id}`)}
                              className="p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                            >
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.category || 'Uncategorized'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Totes</CardTitle>
            <Box className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isLoading ? '...' : stats.totalTotes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Storage containers tracked
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isLoading ? '...' : stats.totalItems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Items in inventory
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Tote</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isLoading
                ? '...'
                : stats.totalTotes > 0
                ? Math.round(stats.totalItems / stats.totalTotes)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Items per container
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Items</CardTitle>
          <CardDescription>Your most recently added items</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : stats.recentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet. Start adding items to your inventory!</p>
          ) : (
            <div className="space-y-3">
              {stats.recentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/items/${item.id}`)}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.category || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.toteId ? `In tote ${item.toteId}` : 'No tote'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
