import React, { useState } from 'react';
import { Plus, Search, Edit, AlertCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import Loading from '@/components/ui/loading';
import type { UserFormType } from '../types/user';
import { useGetUsers } from '../hooks/user.hook';
import { UserModal } from '../components/userModal';

function UserPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page') ?? 1);
  const [selected, setSelected] = React.useState<UserFormType | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput);
  const { data: usersResponse, isLoading: ildu, isError } = useGetUsers(page, debouncedSearch);

  React.useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      setSearchParams({
        q: debouncedSearch,
        page: '1',
      });
    }
  }, [debouncedSearch]);

  const users = usersResponse?.data?.items ?? [];
  const total = usersResponse?.data.total ?? 0;
  const pageSize = usersResponse?.data.pageSize ?? 15;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage all users</p>
        </div>
        <Button
          onClick={() => {
            const data: UserFormType = {
              email: '',
              fullName: '',
              phoneNumber: '',
              roleID: '',
              userID: '',
            };
            setSelected(data);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <UserModal open={!!selected} onOpenChange={() => setSelected(null)} initData={selected} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-medium">Full Name</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Phone Number</TableHead>
              <TableHead className="font-medium">Role</TableHead>
              <TableHead className="font-medium">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ildu ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex items-center justify-center h-full">
                    <Loading />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users &&
              users.map((u) => {
                return (
                  <TableRow
                    key={u.userID}
                    className="group border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-4"></div>
                        <div>
                          <p className="font-medium text-foreground">{u.fullName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p> {u.email}</p>
                    </TableCell>

                    <TableCell>{<p>{u.phoneNumber}</p>}</TableCell>
                    <TableCell className="">
                      <p>{u.role}</p>
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
                              const data: UserFormType = {
                                email: u.email,
                                fullName: u.fullName,
                                phoneNumber: u.phoneNumber,
                                roleID: u.roleID!,
                                userID: u.userID,
                              };
                              setSelected(data);
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

        {!ildu && users.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No user found matching your filters.</p>
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
export default UserPage;
