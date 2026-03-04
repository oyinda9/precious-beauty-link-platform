'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar } from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, admins: 0, owners: 0, clients: 0 });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Mock users data - in production, create actual endpoint
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'admin@salon.com',
            fullName: 'Admin User',
            phone: '+1234567890',
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            email: 'owner@salon.com',
            fullName: 'Salon Owner',
            phone: '+1234567891',
            role: 'SALON_OWNER',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            email: 'client@salon.com',
            fullName: 'John Client',
            phone: '+1234567892',
            role: 'CLIENT',
            createdAt: new Date().toISOString(),
          },
        ];

        setUsers(mockUsers);
        setStats({
          total: mockUsers.length,
          admins: mockUsers.filter(u => u.role === 'ADMIN').length,
          owners: mockUsers.filter(u => u.role === 'SALON_OWNER').length,
          clients: mockUsers.filter(u => u.role === 'CLIENT').length,
        });
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    SALON_OWNER: 'bg-blue-100 text-blue-700',
    CLIENT: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">Manage all users in the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.admins}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Salon Owners</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.owners}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Clients</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.clients}</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : users.length === 0 ? (
        <Card className="bg-card text-center py-12">
          <p className="text-muted-foreground">No users found</p>
        </Card>
      ) : (
        <Card className="bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Name</th>
                  <th className="px-6 py-4 text-left font-medium">Email</th>
                  <th className="px-6 py-4 text-left font-medium">Role</th>
                  <th className="px-6 py-4 text-left font-medium">Phone</th>
                  <th className="px-6 py-4 text-left font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.fullName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail size={16} />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={roleColors[user.role]}>
                        {user.role === 'SALON_OWNER' ? 'Salon Owner' : user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {user.phone ? (
                          <>
                            <Phone size={16} />
                            {user.phone}
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
