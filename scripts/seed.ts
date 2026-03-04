import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Create super admin user
    const superAdminPassword = await hashPassword("password123");
    const superAdminUser = await prisma.user.create({
      data: {
        email: "superadmin@salon.com",
        password: superAdminPassword,
        fullName: "Super Admin",
        phone: "+1234567890",
        role: UserRole.SUPER_ADMIN,
      },
    });

    await prisma.superAdmin.create({
      data: {
        userId: superAdminUser.id,
      },
    });

    console.log("✅ Super admin user created");

    // Create salon admin user
    const adminPassword = await hashPassword("password123");
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@salon.com",
        password: adminPassword,
        fullName: "Salon Admin",
        phone: "+1234567891",
        role: UserRole.SALON_ADMIN,
      },
    });

    console.log("✅ Salon admin user created");

    // Create client users
    const clientPassword = await hashPassword("password123");
    const client1 = await prisma.user.create({
      data: {
        email: "client@salon.com",
        password: clientPassword,
        fullName: "John Client",
        phone: "+1234567892",
        role: UserRole.CLIENT,
      },
    });

    await prisma.client.create({ data: { userId: client1.id } });

    const client2 = await prisma.user.create({
      data: {
        email: "jane@example.com",
        password: clientPassword,
        fullName: "Jane Doe",
        phone: "+1234567893",
        role: UserRole.CLIENT,
      },
    });

    await prisma.client.create({ data: { userId: client2.id } });

    console.log("✅ Client users created");

    // Create salon with slug
    const salon1 = await prisma.salon.create({
      data: {
        name: "Beauty Haven",
        slug: "beauty-haven",
        description: "Premium beauty salon with experienced stylists",
        address: "123 Beauty Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        phone: "+1987654321",
        email: "info@beautyhaven.com",
        website: "https://beautyhaven.com",
        latitude: 40.7128,
        longitude: -74.006,
        rating: 4.8,
        reviewCount: 45,
      },
    });

    const salon2 = await prisma.salon.create({
      data: {
        name: "Hair Masters",
        slug: "hair-masters",
        description: "Expert hair styling and treatments",
        address: "456 Hair Avenue",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90001",
        country: "USA",
        phone: "+1987654322",
        email: "info@hairmasters.com",
        website: "https://hairmasters.com",
        latitude: 34.0522,
        longitude: -118.2437,
        rating: 4.6,
        reviewCount: 32,
      },
    });

    console.log("✅ Salons created");

    // Add salon admin to first salon
    await prisma.salonAdmin.create({
      data: {
        userId: adminUser.id,
        salonId: salon1.id,
      },
    });

    console.log("✅ Salon admin assigned");

    // Create services
    const service1 = await prisma.service.create({
      data: {
        salonId: salon1.id,
        name: "Hair Cut",
        description: "Professional hair cutting service",
        price: 35.0,
        duration: 30,
        category: "haircut",
      },
    });

    const service2 = await prisma.service.create({
      data: {
        salonId: salon1.id,
        name: "Hair Color",
        description: "Full hair coloring service",
        price: 75.0,
        duration: 90,
        category: "coloring",
      },
    });

    const service3 = await prisma.service.create({
      data: {
        salonId: salon2.id,
        name: "Styling",
        description: "Professional styling service",
        price: 45.0,
        duration: 60,
        category: "styling",
      },
    });

    console.log("✅ Services created");

    // Create staff members
    const staff1User = await prisma.user.create({
      data: {
        email: "sarah@beautyhaven.com",
        password: await hashPassword("staffpass123"),
        fullName: "Sarah Manager",
        phone: "+1987654330",
        role: UserRole.SALON_STAFF,
      },
    });

    await prisma.salonStaff.create({
      data: {
        userId: staff1User.id,
        salonId: salon1.id,
        specialties: ["haircut", "coloring"],
        hourlyRate: 25,
      },
    });

    const staff2User = await prisma.user.create({
      data: {
        email: "mike@hairmasters.com",
        password: await hashPassword("staffpass123"),
        fullName: "Mike Stylist",
        phone: "+1987654331",
        role: UserRole.SALON_STAFF,
      },
    });

    await prisma.salonStaff.create({
      data: {
        userId: staff2User.id,
        salonId: salon2.id,
        specialties: ["styling", "cutting"],
        hourlyRate: 20,
      },
    });

    console.log("✅ Staff members created");

    // Create staff availability
    for (let day = 0; day < 7; day++) {
      await prisma.staffAvailability.create({
        data: {
          staffId: (await prisma.salonStaff.findFirst({
            where: { salonId: salon1.id },
          }))!.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "18:00",
        },
      });
    }

    console.log("✅ Staff availability created");

    // Create time slots
    for (let day = 0; day < 7; day++) {
      await prisma.timeSlot.create({
        data: {
          salonId: salon1.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "18:00",
        },
      });

      await prisma.timeSlot.create({
        data: {
          salonId: salon2.id,
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "19:00",
        },
      });
    }

    console.log("✅ Time slots created");

    // Create bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const booking1 = await prisma.booking.create({
      data: {
        clientId: client1.id,
        salonId: salon1.id,
        serviceId: service1.id,
        bookingDate: tomorrow,
        startTime: "10:00",
        endTime: "10:30",
        totalPrice: 35.0,
        status: "CONFIRMED",
        paymentStatus: "COMPLETED",
      },
    });

    const booking2 = await prisma.booking.create({
      data: {
        clientId: client2.id,
        salonId: salon1.id,
        serviceId: service2.id,
        bookingDate: tomorrow,
        startTime: "11:00",
        endTime: "12:30",
        totalPrice: 75.0,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    console.log("✅ Bookings created");

    // Create revenue record
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    await prisma.revenue.create({
      data: {
        salonId: salon1.id,
        amount: 110.0,
        currency: "USD",
        month: currentMonth,
        year: currentYear,
        totalBookings: 2,
        totalClients: 2,
      },
    });

    console.log("✅ Revenue record created");

    // Create reviews
    await prisma.review.create({
      data: {
        salonId: salon1.id,
        clientId: client1.id,
        bookingId: booking1.id,
        rating: 5,
        comment: "Excellent service! Very professional and friendly staff.",
      },
    });

    console.log("✅ Reviews created");

    // Create subscription
    await prisma.subscription.create({
      data: {
        salonId: salon1.id,
        plan: "STARTER",
        status: "ACTIVE",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.subscription.create({
      data: {
        salonId: salon2.id,
        plan: "TRIAL",
        status: "TRIAL",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("✅ Subscriptions created");

    console.log("✨ Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
