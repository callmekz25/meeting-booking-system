import React, { useState } from 'react';
import {
  Plus,
  Users,
  MapPin,
  Settings,
  MoreVertical,
  Search,
  Grid,
  List,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import AddRoomModal from '@/modules/room/components/addRoomModal';
import { useGetRoomsQuery } from '../hooks/room.hook';
import type { RoomFormType, RoomType } from '../types/room';
import { useDebounce } from '@/hooks/useDebounce';
import Loading from '@/components/ui/loading';

function RoomPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selecteRoom, setSelectRoom] = React.useState<RoomFormType | null>(null);
  const [page, setPage] = React.useState(1);
  const name = useDebounce(searchQuery);
  const { data, isLoading, isError } = useGetRoomsQuery(page, name);

  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const total = data?.data.total ?? 0;
  const pageSize = data?.data.pageSize ?? 6;
  const totalPages = Math.ceil(total / pageSize);

  const rooms = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Meeting Rooms</h1>
          <p className="text-muted-foreground mt-1">Manage your organization's meeting spaces</p>
        </div>
        <Button
          onClick={() =>
            setSelectRoom({
              roomID: undefined,
              capacity: undefined,
              code: '',
              isAvailable: true,
              name: '',
              assignEquipment: [],
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      <AddRoomModal
        open={!!selecteRoom}
        onOpenChange={() => setSelectRoom(null)}
        initRoom={selecteRoom}
        page={page}
        name={name}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(viewMode === 'grid' && 'bg-card shadow-sm')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(viewMode === 'list' && 'bg-card shadow-sm')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <div
          className={cn(
            'grid gap-4',
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
          )}
        >
          {rooms.map((room) => (
            <div key={room.roomID}>
              <Card className={cn(' border-border overflow-hidden', viewMode === 'list' && 'flex')}>
                <div
                  className={cn(
                    'bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center',
                    viewMode === 'grid' ? 'h-32' : 'w-32 h-full shrink-0',
                  )}
                >
                  <div className="text-3xl font-bold text-primary/30">{room.name.charAt(0)}</div>
                </div>

                <div className="flex-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground ">{room.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {room.code}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 ">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card">
                          <DropdownMenuItem
                            onClick={() =>
                              setSelectRoom({
                                roomID: room.roomID,
                                capacity: room.capacity,
                                code: room.code,
                                isAvailable: room.isAvailable,
                                name: room.name,
                                assignEquipments:
                                  room.roomEquipments && room.roomEquipments.length > 0
                                    ? room.roomEquipments?.map((r) => {
                                        return {
                                          inventoryID: r.inventoryID,
                                          serialNumber: r.serialNumber,
                                          typeName: r.typeName,
                                          quantity: r.assignQuantity,
                                        };
                                      })
                                    : [],
                              })
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{room.capacity} people</span>
                      </div>
                      <Badge
                        className={cn(
                          room.isAvailable
                            ? 'bg-green-100 text-green-500'
                            : 'bg-red-100 text-red-500',
                          'shadow-none',
                        )}
                        variant={room.isAvailable ? 'default' : 'destructive'}
                      >
                        {room.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-border">
                    <div className="w-full min-h-20">
                      <p className="text-xs text-muted-foreground mb-2">Default Equipment</p>
                      {room?.roomEquipments && room.roomEquipments.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {room.roomEquipments.slice(0, 3).map((eq) => {
                            return (
                              <div
                                key={eq.inventoryID}
                                className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs"
                                title={eq.typeName}
                              >
                                <span className="hidden sm:inline">{eq.typeName}</span>
                              </div>
                            );
                          })}

                          {room.roomEquipments.length > 3 && (
                            <div className="text-xs flex items-center">
                              +{room.roomEquipments.length - 3} Others
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No equipment assigned
                        </p>
                      )}
                    </div>
                  </CardFooter>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {!isLoading && rooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No rooms found matching your search.</p>
        </div>
      ) : (
        <div className="flex gap-3 items-center justify-center mt-10">
          {Array.from({ length: totalPages }).map((_, index) => {
            return (
              <Button
                onClick={() => setPage(index + 1)}
                variant={page === index + 1 ? 'default' : 'outline'}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default RoomPage;
