'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAdmin } from '@/lib/mutations';
import { useAllPermissions } from '@/lib/queries';
import {
  groupPermissionsByCategory,
  getCategoryDisplayName,
} from '@/utils/permissionUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShimmerCard } from '@/components/ui/shimmer';

const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fname: z.string().min(1, 'First name is required'),
  lname: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'superAdmin'] as const, {
    message: 'Please select a role',
  }),
  phoneNumber: z.string().optional(),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

interface AddAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAdminModal({ open, onOpenChange }: AddAdminModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const createAdminMutation = useCreateAdmin();

  // Fetch permissions
  const { data: permissions = [], isLoading: permissionsLoading } =
    useAllPermissions();
  const groupedPermissions = groupPermissionsByCategory(permissions);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      role: 'admin',
    },
  });

  const selectedRole = watch('role');

  // Clear permissions when switching to superAdmin
  useEffect(() => {
    if (selectedRole === 'superAdmin') {
      setSelectedPermissions([]);
    }
  }, [selectedRole]);

  // Handle permission toggle
  const handlePermissionToggle = (permissionKey: string) => {
    if (selectedRole === 'superAdmin') return; // Don't allow selection for superAdmin

    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  // Handle select all in category
  const handleSelectAllCategory = (category: string) => {
    if (selectedRole === 'superAdmin') return;

    const categoryPerms = groupedPermissions[category] || [];
    const categoryKeys = categoryPerms.map((p) => p.key);
    const allSelected = categoryKeys.every((key) =>
      selectedPermissions.includes(key)
    );

    if (allSelected) {
      // Deselect all in category
      setSelectedPermissions((prev) =>
        prev.filter((key) => !categoryKeys.includes(key))
      );
    } else {
      // Select all in category
      setSelectedPermissions((prev) => [
        ...new Set([...prev, ...categoryKeys]),
      ]);
    }
  };

  const onSubmit = async (data: CreateAdminFormData) => {
    setIsLoading(true);
    try {
      // Only include permissions if role is 'admin' and permissions are selected
      const adminData = {
        ...data,
        permissions:
          selectedRole === 'admin' && selectedPermissions.length > 0
            ? selectedPermissions
            : undefined,
      };

      await createAdminMutation.mutateAsync(adminData);
      reset();
      setSelectedPermissions([]);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by mutation
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedPermissions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Admin</DialogTitle>
          <DialogDescription>
            Create a new admin account. Super Admin accounts have full system
            access.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fname">First Name *</Label>
                    <Input
                      id="fname"
                      {...register('fname')}
                      placeholder="John"
                      disabled={isLoading}
                    />
                    {errors.fname && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.fname.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lname">Last Name *</Label>
                    <Input
                      id="lname"
                      {...register('lname')}
                      placeholder="Doe"
                      disabled={isLoading}
                    />
                    {errors.lname && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lname.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="admin@example.com"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    {...register('username')}
                    placeholder="adminuser"
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="Minimum 8 characters"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) =>
                      setValue('role', value as 'admin' | 'superAdmin')
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superAdmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.role.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedRole === 'superAdmin'
                      ? 'Super Admin has full system access and can create other admins'
                      : 'Admin has limited access based on assigned permissions'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                  <Input
                    id="phoneNumber"
                    {...register('phoneNumber')}
                    placeholder="1234567890"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Separator />

              {/* Permissions Section - Only for Admin role */}
              {selectedRole === 'admin' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold">
                      Select Permissions
                    </h3>
                    <p className="mb-4 text-xs text-gray-500">
                      Choose which actions this admin can perform. If no
                      permissions are selected, admin will get default role
                      permissions.
                    </p>
                  </div>

                  {permissionsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <ShimmerCard key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : Object.keys(groupedPermissions).length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No permissions available
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(
                        ([category, perms]) => {
                          const categoryKeys = perms.map((p) => p.key);
                          const allSelected = categoryKeys.every((key) =>
                            selectedPermissions.includes(key)
                          );
                          const someSelected = categoryKeys.some((key) =>
                            selectedPermissions.includes(key)
                          );

                          return (
                            <div
                              key={category}
                              className="space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">
                                  {getCategoryDisplayName(category)}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleSelectAllCategory(category)
                                  }
                                  className="h-7 text-xs"
                                >
                                  {allSelected ? 'Deselect All' : 'Select All'}
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {perms.map((perm) => (
                                  <div
                                    key={perm.key}
                                    className="flex items-start space-x-3 rounded p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                  >
                                    <Checkbox
                                      id={perm.key}
                                      checked={selectedPermissions.includes(
                                        perm.key
                                      )}
                                      onCheckedChange={() =>
                                        handlePermissionToggle(perm.key)
                                      }
                                      disabled={isLoading}
                                      className="mt-1"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <Label
                                        htmlFor={perm.key}
                                        className="cursor-pointer text-sm font-medium"
                                      >
                                        {perm.name}
                                      </Label>
                                      <p className="mt-0.5 text-xs text-gray-500">
                                        {perm.key}
                                      </p>
                                      {perm.description && (
                                        <p className="mt-1 text-xs text-gray-400">
                                          {perm.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      )}

                      {selectedPermissions.length > 0 && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {selectedPermissions.length} permission
                            {selectedPermissions.length !== 1 ? 's' : ''}{' '}
                            selected
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedRole === 'superAdmin' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Super Admin Note:</strong> Super Admins
                    automatically have all permissions. No need to select
                    permissions.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
