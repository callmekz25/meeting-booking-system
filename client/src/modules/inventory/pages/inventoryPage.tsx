import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Link,
  AlertCircle,
  MoreHorizontal,
  UploadIcon,
  Loader2Icon,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { AddEquipmentModal } from '@/modules/inventory/components/addEquipmentModal';
import type { InventoryFormType } from '../types/inventory';
import { useGetInventories, useGetInventoryStatics } from '../hooks/inventory.hook';
import { useGetAllRooms } from '@/modules/room/hooks/room.hook';
import { useGetEquipmentType } from '@/modules/equipmentType/hooks/equipmentType.hook';
import { useDebounce } from '@/hooks/useDebounce';
import Loading from '@/components/ui/loading';
import UploadFileModal from '../components/uploadFileModal';

function EquipmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';
  const typeFilter = searchParams.get('type') ?? 'all';
  const statusFilter = searchParams.get('status') ?? 'all';
  const page = Number(searchParams.get('page') ?? 1);
  const [selected, setSelected] = React.useState<InventoryFormType | null>(null);
  const [openUploadFileModal, setOpenUploadFileModal] = React.useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput);

  React.useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      setSearchParams({
        q: debouncedSearch,
        type: typeFilter,
        status: statusFilter,
        page: '1',
      });
    }
  }, [debouncedSearch]);

  const { data: statics, isLoading: ilds } = useGetInventoryStatics();

  const {
    data,
    isLoading: ildi,
    isError,
  } = useGetInventories({
    page,
    searchQuery: debouncedSearch,
    statusFilter,
    typeFilter,
  });
  const { data: rooms, isLoading: ildr } = useGetAllRooms();
  const { data: equipmentTypes, isLoading: ileqt } = useGetEquipmentType();

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Badge
            variant="default"
            className="bg-green-100 shadow-none hover:bg-green-100 text-green-500 "
          >
            Available
          </Badge>
        );
      case 1:
        return (
          <Badge
            variant="default"
            className="bg-orange-100 shadow-none hover:bg-orange-100 text-orange-500 "
          >
            Maintenance
          </Badge>
        );
      case 2:
        return (
          <Badge
            variant="default"
            className="bg-red-100 shadow-none hover:bg-red-100 text-red-500 "
          >
            OutOfService
          </Badge>
        );
    }
  };

  const getEquipmentTypeName = (eqtId: number) => {
    if (!eqtId) return null;
    const eqt = equipmentTypes && equipmentTypes.data.find((eqt) => eqt.typeID === eqtId);
    return eqt?.typeName;
  };

  const getRoomName = (roomId: number) => {
    if (!roomId) return null;
    const room = rooms && rooms.data.find((r) => r.roomID === roomId);
    return room?.name;
  };

  const stats = {
    total: statics?.data?.total ?? 0,
    available: statics?.data?.totalAvailable ?? 0,
    outOfServie: statics?.data?.totalOutOfService ?? 0,
    maintenance: statics?.data?.totalMaintenance ?? 0,
  };

  const inventories = data?.data?.items ?? [];
  const total = data?.data.total ?? 0;
  const pageSize = data?.data.pageSize ?? 6;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Equipment</h1>
          <p className="text-muted-foreground mt-1">Manage all equipment and their assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenUploadFileModal(true)} variant="outline">
            <Upload className="size-4" />
            Upload File
          </Button>

          <Button
            onClick={() => {
              const data: InventoryFormType = {
                typeID: undefined,
                serialNumber: '',
                quantity: 1,
                status: '',
                roomEquipments: [],
              };
              setSelected(data);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>
      {openUploadFileModal && (
        <UploadFileModal
          open={openUploadFileModal}
          onOpenChange={() => setOpenUploadFileModal(false)}
        />
      )}
      {selected && (
        <AddEquipmentModal
          open={!!selected}
          onOpenChange={() => setSelected(null)}
          initData={selected}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Available', value: stats.available, color: 'text-success' },
          { label: 'OutOfService', value: stats.outOfServie, color: 'text-destructive' },
          { label: 'Maintenance', value: stats.maintenance, color: 'text-warning' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn('text-2xl font-semibold mt-1', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setSearchParams({
                q: searchQuery,
                type: value,
                status: statusFilter,
                page: '1',
              })
            }
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="all">All Types</SelectItem>
              {equipmentTypes &&
                equipmentTypes.data.map((eqt) => (
                  <SelectItem key={eqt.typeID} value={eqt.typeName} className="capitalize">
                    {eqt.typeName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setSearchParams({
                q: searchQuery,
                type: typeFilter,
                status: value,
                page: '1',
              })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="0">Available</SelectItem>
              <SelectItem value="1">Maintenance</SelectItem>
              <SelectItem value="2">OutOfService</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-medium">Equipment Type</TableHead>
              <TableHead className="font-medium">Serial Number</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Assigned Room</TableHead>
              <TableHead className="font-medium">In Stock</TableHead>
              <TableHead className="font-medium">In Use</TableHead>
              <TableHead className="font-medium">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ildi ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex items-center justify-center h-full">
                    <Loading />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              inventories &&
              inventories.map((eq) => {
                return (
                  <TableRow
                    key={eq.inventoryID}
                    className="group border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-4"></div>
                        <div>
                          <p className="font-medium text-foreground">
                            {getEquipmentTypeName(eq.typeID)}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code
                        className="text-xs bg-secondary px-2 py-1 rounded 
                   inline-block max-w-50 truncate"
                      >
                        {eq.serialNumber}
                      </code>
                    </TableCell>

                    <TableCell>{getStatusBadge(eq.status)}</TableCell>
                    <TableCell className="max-w-55">
                      <div className="flex flex-wrap gap-1.5 text-sm">
                        {eq.roomEquipments && eq.roomEquipments.length > 0 ? (
                          <>
                            {eq.roomEquipments.slice(0, 3).map((re) => {
                              const roomName = getRoomName(re.roomID);

                              return (
                                <div
                                  key={re.roomID}
                                  className="flex items-center gap-1.5 max-w-full"
                                >
                                  <Link className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="truncate max-w-40">{roomName}</span>
                                </div>
                              );
                            })}

                            {eq.roomEquipments.length > 3 && (
                              <span className="text-muted-foreground text-xs shrink-0">
                                +{eq.roomEquipments.length - 3} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{eq.quantity}</TableCell>
                    <TableCell>
                      {eq.roomEquipments && eq.roomEquipments.length > 0
                        ? eq.roomEquipments.reduce((total, item) => total + item.quantity, 0)
                        : 0}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 ">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card">
                          <DropdownMenuItem
                            onClick={() => {
                              console.log('Eq', eq.roomEquipments);
                              setSelected({
                                inventoryID: eq.inventoryID,
                                quantity: eq.quantity,
                                serialNumber: eq.serialNumber,
                                status: eq.status,
                                typeID: eq.typeID,
                                roomEquipments: eq.roomEquipments,
                              });
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!ildi && inventories.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No equipment found matching your filters.</p>
          </div>
        ) : (
          <div className="flex gap-3 items-center justify-center mt-10 mb-4">
            {Array.from({ length: totalPages }).map((_, index) => {
              return (
                <Button
                  key={index}
                  onClick={() =>
                    setSearchParams({
                      q: searchQuery,
                      type: typeFilter,
                      status: statusFilter,
                      page: (index + 1).toString(),
                    })
                  }
                  variant={page === index + 1 ? 'default' : 'outline'}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default EquipmentPage;
