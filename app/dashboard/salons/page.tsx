'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, MapPin, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

interface Salon {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchSalons = async () => {
    try {
      const res = await fetch('/api/salons?limit=100');
      if (res.ok) {
        const data = await res.json();
        setSalons(data.salons);
      }
    } catch (error) {
      console.error('Failed to fetch salons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this salon?')) {
      try {
        const res = await fetch(`/api/salons/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setSalons(salons.filter(s => s.id !== id));
        }
      } catch (error) {
        console.error('Failed to delete salon:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salons</h1>
          <p className="text-muted-foreground mt-1">Manage all salons in the system</p>
        </div>
        <Link href="/dashboard/salons/new">
          <Button>
            <Plus size={18} className="mr-2" />
            New Salon
          </Button>
        </Link>
      </div>

      {/* Salons List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : salons.length === 0 ? (
        <Card className="bg-card text-center py-12">
          <p className="text-muted-foreground">No salons found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon) => (
            <Card key={salon.id} className="bg-card hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{salon.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      ⭐ {salon.rating} ({salon.reviewCount} reviews)
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    salon.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {salon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={16} />
                    <span>{salon.address}, {salon.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={16} />
                    <span>{salon.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={16} />
                    <span>{salon.email}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Link href={`/dashboard/salons/${salon.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(salon.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
