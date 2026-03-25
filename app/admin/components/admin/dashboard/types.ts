export interface DashboardData {
  overview: {
    totalSalons: number;
    activeSalons: number;
    totalClients: number;
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    pendingApprovals: number;
  };
  topSalons: Array<{
    salonId: string;
    salonName: string;
    totalRevenue: number;
    bookingCount: number;
  }>;
  subscriptionBreakdown: Array<{
    plan: string;
    _count: number;
    revenue?: number;
  }>;
  recentBookings: Array<{
    id: string;
    status: string;
    totalPrice: number;
    bookingDate: string;
    client?: {
      user?: {
        fullName: string;
        email: string;
      };
    };
    salon?: {
      name: string;
      id: string;
    };
    service?: {
      name: string;
    };
  }>;
  users?: Array<{
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role: string;
    createdAt: string;
  }>;
  analytics?: {
    bookingsBySalon?: Array<{
      salonId: string;
      salonName: string;
      bookings: number;
    }>;
  };
  salons?: Array<{
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    rating: number;
    reviewCount: number;
    isActive: boolean;
    subscriptionStatus: string;
    createdAt: string;
  }>;
  recentActivities?: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}