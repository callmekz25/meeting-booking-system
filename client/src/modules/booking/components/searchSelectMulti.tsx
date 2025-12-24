import React from 'react';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import type { User } from '@/modules/user/types/user';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetUsersByEmail } from '@/modules/user/hooks/user.hook';
import { Badge } from '@/components/ui/badge';

const SearchSelectMulti = ({
  users,
  start,
  end,
  onChange,
}: {
  users: User[];
  start: string;
  end: string;
  onChange: (value: User[]) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const debounce = useDebounce(email);

  const { data, isLoading } = useGetUsersByEmail(debounce, start, end);

  const toggleUser = (user: User) => {
    const exists = users.some((u) => u.userID === user.userID);

    let newValue;
    if (exists) {
      newValue = users.filter((u) => u.userID !== user.userID);
    } else {
      newValue = [...users, user];
    }

    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full font-normal py-4.5 bg-white justify-between">
            Select email
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="p-0 w-[600px]">
          <Command>
            <CommandInput
              value={email}
              onValueChange={setEmail}
              placeholder="Search email…"
              className=""
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              <CommandGroup>
                {data && data.data
                  ? data.data.map((user) => {
                      const isSelected = users.some((u) => u.userID === user.userID);
                      return (
                        <CommandItem
                          key={user.userID}
                          value={user.email}
                          className="py-2 flex items-center gap-2"
                          onSelect={() => toggleUser(user)}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                          />
                          <div className="flex items-center justify-between flex-1">
                            <div className="">
                              <p className="text-sm font-medium ">{user.fullName}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="">
                              {user.isAvailable ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                  Available
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                  Busy
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })
                  : users.map((user) => {
                      const isSelected = users.some((u) => u.userID === user.userID);
                      return (
                        <CommandItem
                          key={user.userID}
                          value={user.email}
                          className="py-3"
                          onSelect={() => toggleUser(user)}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                          />
                          {user.email}
                        </CommandItem>
                      );
                    })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <Badge key={user.userID} variant="secondary" className="flex items-center gap-1 pr-1">
            {user.email}
            <button onClick={() => toggleUser(user)} className="ml-1 hover:bg-muted rounded p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};
export default SearchSelectMulti;
