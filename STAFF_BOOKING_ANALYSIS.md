# Staff Names in Client Bookings - Current Implementation Analysis

## Summary

**Staff information is collected during booking but NOT displayed back to clients in their booking confirmations or booking history.**

---

## 1. DATABASE SCHEMA - Staff Relationship Exists ✅

### Booking Model (prisma/schema.prisma, lines 162-176)

```prisma
model Booking {
  id            String        @id @default(cuid())
  clientId      String?
  clientPhone   String?
  salonId       String
  serviceId     String
  staffId       String?           // ← Staff relationship exists
  bookingDate   DateTime
  startTime     String
  endTime       String
  status        BookingStatus @default(PENDING)
  paymentStatus PaymentStatus @default(PENDING)
  paymentMethod String        @default("PAY_AT_SALON")
  notes         String?
  totalPrice    Float
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  client        User?         @relation(fields: [clientId], references: [id], onDelete: Cascade)
  salon         Salon         @relation(fields: [salonId], references: [id], onDelete: Cascade)
  service       Service       @relation(fields: [serviceId], references: [id])
  staff         SalonStaff?   @relation(fields: [staffId], references: [id])  // ← Optional staff
  payment       Payment?
  review        Review?

  @@index([clientId])
  @@index([salonId])
  @@index([staffId])  // ← Indexed for queries
  @@index([status])
  @@index([bookingDate])
}
```

### SalonStaff Model (prisma/schema.prisma, lines 106-120)

```prisma
model SalonStaff {
  id           String              @id @default(cuid())
  userId       String              @unique
  salonId      String
  specialties  String[]            // Array of specialties
  hourlyRate   Float?
  isActive     Boolean             @default(true)
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt
  bookings     Booking[]           // Relationship to bookings
  salon        Salon               @relation(fields: [salonId], references: [id], onDelete: Cascade)
  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)  // ← Link to user name
  availability StaffAvailability[]

  @@index([salonId])
  @@index([isActive])
}
```

---

## 2. BOOKING CREATION - Staff IS Captured ✅

### Salon Booking Page (app/salon/[slug]/page.tsx, lines 27-38, 108-109)

**Staff Selection During Booking:**

```tsx
// Form state - line 37
const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

// Booking payload - line 108
const bookingPayload = {
  salonId: salon?.id,
  serviceIds: selectedServices,
  staffId: selectedStaff || undefined, // ← Staff selected HERE
  bookingDate,
  startTime,
  notes: notes || undefined,
  clientPhone: clientPhone.trim(),
};
```

**Staff Display During Selection (app/salon/[slug]/page.tsx, ~line 324-370):**

```tsx
{/* Staff Section */}
<div>
  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
    <User className="w-5 h-5 text-purple-600" />
    Select Staff (Optional)
  </h3>
  <div className="space-y-2">
    <button
      type="button"
      onClick={() => setSelectedStaff(null)}
      className={...}
    >
      <span className="font-medium text-gray-800">
        🤝 Any Available Staff
      </span>
    </button>

    {staff.map((member) => (
      <button
        key={member.id}
        type="button"
        // Staff button display - but STAFF NAME/INFO NOT SHOWN IN CONFIRMS
      >
        {/* Staff details would display here */}
      </button>
    ))}
  </div>
</div>
```

---

## 3. BOOKING CONFIRMATION/HISTORY - Staff NOT Displayed ❌

### Client Bookings Page Interface (app/client-bookings/page.tsx, lines 24-47)

**Current ClientBooking Interface - NO staff field:**

```tsx
interface BookingService {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface ClientBooking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  totalPrice: number;
  notes?: string;
  services: BookingService[]; // ← Services shown
  salon: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
  };
  // ↓ MISSING: NO STAFF INFORMATION
}
```

### API GET Route - No Staff Included (app/api/bookings/route.ts, lines 170+)

**For CLIENT Role Bookings:**

```tsx
} else if (userRole === "CLIENT") {
  // Clients see only their own bookings
  bookings = await prisma.booking.findMany({
    where: {
      clientPhone: {
        // This is a limitation - ideally should have clientId in bookings table
        // For now we filter by user's phone if available
      },
    },
    include: {
      service: true,  // ← Service included
      salon: {
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          city: true,
        },
      },
      // ↓ MISSING: NO STAFF INCLUDED
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
```

### Client Bookings Display - No Staff Section (app/client-bookings/page.tsx, lines 365-650)

**Mobile View - Services Shown, Staff NOT:**

```tsx
{/* Services */}
<div className="space-y-2">
  <p className="text-xs font-medium text-gray-500 uppercase">
    Services ({booking.services.length})
  </p>
  <div className="space-y-2">
    {booking.services.map((service) => (
      <div
        key={service.id}
        className="flex items-center justify-between bg-purple-50 rounded-lg p-3"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Scissors className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {service.name}
            </p>
            <p className="text-xs text-gray-500">
              {service.duration} mins
            </p>
          </div>
        </div>
        <p className="text-sm font-medium text-purple-600 flex-shrink-0 ml-2">
          ₦{service.price.toLocaleString()}
        </p>
      </div>
    ))}
  </div>
</div>

{/* Date & Time */}
<div className="grid grid-cols-2 gap-3 pt-2">
  <div className="bg-purple-50 rounded-lg p-3">
    <Calendar className="w-4 h-4 text-purple-600 mb-1" />
    <p className="text-xs text-gray-600">Date</p>
    <p className="font-medium text-sm">{...}</p>
  </div>
  <div className="bg-pink-50 rounded-lg p-3">
    <Clock className="w-4 h-4 text-pink-600 mb-1" />
    <p className="text-xs text-gray-600">Time</p>
    <p className="font-medium text-sm">{formatTime(booking.startTime)}</p>
  </div>
</div>

{/* Notes - if any */}
{booking.notes && (
  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 italic">
    "{booking.notes}"
  </div>
)}

{/* ↑ NO STAFF INFORMATION DISPLAYED */}
```

**Desktop View - Same Issue:**

```tsx
{/* Services Grid */}
<div className="pt-2">
  <p className="text-sm font-medium text-gray-600 mb-3">
    Services ({booking.services.length})
  </p>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {booking.services.map((service) => (
      // Services displayed...
    ))}
  </div>
</div>

{/* Notes */}
{booking.notes && (
  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 italic border border-gray-200 mt-3">
    "{booking.notes}"
  </div>
)}

{/* ↑ NO STAFF INFORMATION DISPLAYED HERE EITHER */}
```

---

## 4. WHERE STAFF INFO SHOULD APPEAR

### Current Data Flow:

```
Booking Creation (salon/[slug]/page.tsx)
  ↓ Staff selected & sent in payload
API POST /api/bookings
  ↓ staffId saved to database ✅
Database
  ↓ Booking.staffId exists ✅
API GET /api/bookings
  ↓ NOT fetching staff info ❌
Client (app/client-bookings/page.tsx)
  ↓ NO way to display staff ❌
User sees booking WITHOUT staff name
```

---

## 5. WHAT'S MISSING

### Missing in API Response (app/api/bookings/route.ts):

```tsx
// CURRENTLY:
include: {
  service: true,
  salon: {
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
    },
  },
  // ❌ MISSING:
  // staff: {
  //   select: {
  //     id: true,
  //     user: {
  //       select: {
  //         fullName: true,
  //         phone: true,
  //       },
  //     },
  //     specialties: true,
  //   },
  // },
}
```

### Missing in Frontend Interface (app/client-bookings/page.tsx):

```tsx
interface ClientBooking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  totalPrice: number;
  notes?: string;
  services: BookingService[];
  salon: { ... };

  // ❌ MISSING:
  // staff?: {
  //   id: string;
  //   user: {
  //     fullName: string;
  //     phone?: string;
  //   };
  //   specialties: string[];
  // } | null;
}
```

### Missing in UI Display (app/client-bookings/page.tsx):

```tsx
{
  /* Staff Assignment Section - NOT PRESENT */
}
{
  booking.staff && (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase">
        Assigned Staff
      </p>
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
        <div className="flex items-center gap-2">
          {/* Staff avatar/info would go here */}
          <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {booking.staff.user.fullName}
            </p>
            {booking.staff.specialties.length > 0 && (
              <p className="text-xs text-gray-500">
                {booking.staff.specialties.join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. FILES THAT NEED CHANGES

| File                                | Change                               | Priority |
| ----------------------------------- | ------------------------------------ | -------- |
| `app/api/bookings/route.ts`         | Add `staff` to include clause        | HIGH     |
| `app/client-bookings/page.tsx`      | Add `staff` to interface & display   | HIGH     |
| `app/salon-admin/bookings/page.tsx` | Staff already shown for salon admins | LOW      |

---

## 7. KEY FINDINGS

1. ✅ **Database**: Staff relationship properly defined in schema
2. ✅ **Booking Creation**: Client can select staff at `app/salon/[slug]/page.tsx`
3. ✅ **Storage**: stafffId saved to database correctly
4. ❌ **API**: GET endpoint doesn't fetch staff data
5. ❌ **Frontend Interface**: ClientBooking type missing staff field
6. ❌ **UI**: No section to display staff in booking confirmation

---

## 8. IMPACT

- **For Clients**: Cannot see which staff member is assigned to their booking
- **For Salon Owners/Admins**: Can already see staff assignments (different page)
- **User Experience**: Booking feels incomplete as key info is hidden
- **Data Loss**: Staff selection is "lost" from client perspective post-booking
