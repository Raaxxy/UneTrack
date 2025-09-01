"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Key,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "user" | "viewer"
  status: "active" | "inactive" | "pending"
  department: string
  phone?: string
  lastLogin?: string
  createdAt: string
  permissions: string[]
  avatar?: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
}

const mockUsers: User[] = []

const mockRoles: Role[] = []

const allPermissions = [
  { id: "read", name: "Read Assets", description: "View asset information" },
  { id: "write", name: "Write Assets", description: "Create and edit assets" },
  { id: "delete", name: "Delete Assets", description: "Remove assets from system" },
  { id: "reports", name: "View Reports", description: "Access reporting dashboard" },
  { id: "asset_management", name: "Asset Management", description: "Full asset management access" },
  { id: "user_management", name: "User Management", description: "Manage users and permissions" },
  { id: "system_settings", name: "System Settings", description: "Configure system settings" },
  { id: "admin", name: "Administrator", description: "Full system administration" },
]

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as const,
    department: "",
    phone: "",
    password: "",
  })

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = selectedRole === "all" || user.role === selectedRole
      const matchesStatus = selectedStatus === "all" || user.status === selectedStatus

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, selectedRole, selectedStatus])

  const handleAddUser = () => {
    setCurrentUser(null)
    setNewUser({
      name: "",
      email: "",
      role: "user",
      department: "",
      phone: "",
      password: "",
    })
    setIsUserModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setCurrentUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone || "",
      password: "",
    })
    setIsUserModalOpen(true)
  }

  const handleSaveUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (currentUser) {
      // Edit existing user
      setUsers(
        users.map((user) =>
          user.id === currentUser.id
            ? { ...user, ...newUser, permissions: roles.find((r) => r.id === newUser.role)?.permissions || [] }
            : user,
        ),
      )
      toast({
        title: "User Updated",
        description: `${newUser.name} has been updated successfully.`,
      })
    } else {
      // Add new user
      const newId = (Math.max(...users.map((u) => Number(u.id)), 0) + 1).toString()
      const user: User = {
        id: newId,
        ...newUser,
        status: "pending",
        createdAt: new Date().toISOString(),
        permissions: roles.find((r) => r.id === newUser.role)?.permissions || [],
      }
      setUsers([...users, user])
      toast({
        title: "User Created",
        description: `${newUser.name} has been added successfully.`,
      })
    }

    setIsUserModalOpen(false)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
    toast({
      title: "User Deleted",
      description: "User has been removed from the system.",
    })
  }

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) return

    switch (action) {
      case "activate":
        setUsers(users.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: "active" as const } : user)))
        toast({
          title: "Users Activated",
          description: `${selectedUsers.length} users have been activated.`,
        })
        break
      case "deactivate":
        setUsers(
          users.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: "inactive" as const } : user)),
        )
        toast({
          title: "Users Deactivated",
          description: `${selectedUsers.length} users have been deactivated.`,
        })
        break
      case "delete":
        setUsers(users.filter((user) => !selectedUsers.includes(user.id)))
        toast({
          title: "Users Deleted",
          description: `${selectedUsers.length} users have been deleted.`,
        })
        break
    }
    setSelectedUsers([])
  }

  const handleAddRole = () => {
    setCurrentRole(null)
    setNewRole({
      name: "",
      description: "",
      permissions: [],
    })
    setIsRoleModalOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setCurrentRole(role)
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    })
    setIsRoleModalOpen(true)
  }

  const handleSaveRole = () => {
    if (!newRole.name || !newRole.description) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (currentRole) {
      // Edit existing role
      setRoles(roles.map((role) => (role.id === currentRole.id ? { ...role, ...newRole } : role)))
      toast({
        title: "Role Updated",
        description: `${newRole.name} role has been updated successfully.`,
      })
    } else {
      // Add new role
      const newId = newRole.name.toLowerCase().replace(/\s+/g, "_")
      const role: Role = {
        id: newId,
        ...newRole,
        userCount: 0,
      }
      setRoles([...roles, role])
      toast({
        title: "Role Created",
        description: `${newRole.name} role has been created successfully.`,
      })
    }

    setIsRoleModalOpen(false)
  }

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: User["role"]) => {
    const colors = {
      admin: "bg-red-600",
      manager: "bg-blue-600",
      user: "bg-green-600",
      viewer: "bg-gray-600",
    }
    return <Badge className={colors[role]}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAddRole}>
            <Shield className="h-4 w-4 mr-2" />
            Add Role
          </Button>
          <Button onClick={handleAddUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="settings">Authentication Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* User Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Filters</CardTitle>
              <CardDescription>Filter and search users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  {selectedUsers.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Bulk Actions ({selectedUsers.length})</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate Users
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Deactivate Users
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Users
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                    <p className="text-sm">Add users to get started</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className={selectedUsers.includes(user.id) ? "bg-muted/50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>
                            {user.lastLogin ? (
                              <div className="text-sm">
                                <p>{format(new Date(user.lastLogin), "MMM dd, yyyy")}</p>
                                <p className="text-muted-foreground">{format(new Date(user.lastLogin), "HH:mm")}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Key className="h-4 w-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          {roles.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No roles found</p>
                <p className="text-sm">Create roles to manage permissions</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <Card key={role.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {role.name}
                      <Badge variant="outline">{role.userCount} users</Badge>
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Permissions</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {allPermissions.find((p) => p.id === permission)?.name || permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditRole(role)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>Configure authentication and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Password Complexity</Label>
                    <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Login Attempts</Label>
                    <p className="text-sm text-muted-foreground">Maximum failed login attempts</p>
                  </div>
                  <Select defaultValue="5">
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit User Dialog */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {currentUser ? "Update user information and permissions." : "Create a new user account."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                value={newUser.name}
                onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="user-email">Email Address</Label>
              <Input
                id="user-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: any) => setNewUser((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="user-department">Department</Label>
                <Input
                  id="user-department"
                  value={newUser.department}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="Department"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="user-phone">Phone Number</Label>
              <Input
                id="user-phone"
                value={newUser.phone}
                onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {!currentUser && (
              <div>
                <Label htmlFor="user-password">Password</Label>
                <div className="relative">
                  <Input
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>{currentUser ? "Update User" : "Create User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Role Dialog */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentRole ? "Edit Role" : "Create New Role"}</DialogTitle>
            <DialogDescription>
              {currentRole
                ? "Update role information and permissions."
                : "Create a new role with specific permissions."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={newRole.name}
                onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name"
              />
            </div>
            <div>
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                value={newRole.description}
                onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {allPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={newRole.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewRole((prev) => ({
                            ...prev,
                            permissions: [...prev.permissions, permission.id],
                          }))
                        } else {
                          setNewRole((prev) => ({
                            ...prev,
                            permissions: prev.permissions.filter((p) => p !== permission.id),
                          }))
                        }
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={permission.id} className="text-sm font-medium">
                        {permission.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>{currentRole ? "Update Role" : "Create Role"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
