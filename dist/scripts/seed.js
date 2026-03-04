"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const auth_1 = require("../lib/auth");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting database seed...");
    try {
        // Create admin user
        const adminPassword = await (0, auth_1.hashPassword)("password123");
        const admin = await prisma.user.create({
            data: {
                email: "admin@salon.com",
                password: adminPassword,
                fullName: "Admin User",
                phone: "+1234567890",
                role: "ADMIN",
            },
        });
        await prisma.admin.create({
            data: {
                userId: admin.id,
            },
        });
        console.log("✅ Admin user created");
        // Create salon owner
        const ownerPassword = await (0, auth_1.hashPassword)("password123");
        const ownerUser = await prisma.user.create({
            data: {
                email: "owner@salon.com",
                password: ownerPassword,
                fullName: "Salon Owner",
                phone: "+1234567891",
                role: "SALON_OWNER",
            },
        });
        const salonOwner = await prisma.salonOwner.create({
            data: {
                userId: ownerUser.id,
                licenseNumber: "SL-2024-001",
            },
        });
        console.log("✅ Salon owner created");
        // Create client users
        const clientPassword = await (0, auth_1.hashPassword)("password123");
        const client1 = await prisma.user.create({
            data: {
                email: "client@salon.com",
                password: clientPassword,
                fullName: "John Client",
                phone: "+1234567892",
                role: "CLIENT",
            },
        });
        await prisma.client.create({ data: { userId: client1.id } });
        const client2 = await prisma.user.create({
            data: {
                email: "jane@example.com",
                password: clientPassword,
                fullName: "Jane Doe",
                phone: "+1234567893",
                role: "CLIENT",
            },
        });
        await prisma.client.create({ data: { userId: client2.id } });
        console.log("✅ Client users created");
        // Create salons (assign ownerId instead of adminId)
        const salon1 = await prisma.salon.create({
            data: {
                name: "Beauty Haven",
                description: "Premium beauty salon with experienced stylists",
                address: "123 Beauty Street",
                city: "New York",
                phone: "+1987654321",
                email: "info@beautyhaven.com",
                latitude: 40.7128,
                longitude: -74.006,
                rating: 4.8,
                reviewCount: 45,
                ownerId: salonOwner.id, // <-- fixed here
            },
        });
        const salon2 = await prisma.salon.create({
            data: {
                name: "Hair Masters",
                description: "Expert hair styling and treatments",
                address: "456 Hair Avenue",
                city: "Los Angeles",
                phone: "+1987654322",
                email: "info@hairmasters.com",
                latitude: 34.0522,
                longitude: -118.2437,
                rating: 4.6,
                reviewCount: 32,
                ownerId: salonOwner.id, // <-- fixed here
            },
        });
        console.log("✅ Salons created");
        // Create services
        const service1 = await prisma.service.create({
            data: {
                salonId: salon1.id,
                name: "Hair Cut",
                description: "Professional hair cutting service",
                price: 35.0,
                duration: 30,
            },
        });
        const service2 = await prisma.service.create({
            data: {
                salonId: salon1.id,
                name: "Hair Color",
                description: "Full hair coloring service",
                price: 75.0,
                duration: 90,
            },
        });
        const service3 = await prisma.service.create({
            data: {
                salonId: salon2.id,
                name: "Styling",
                description: "Professional styling service",
                price: 45.0,
                duration: 60,
            },
        });
        console.log("✅ Services created");
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
            },
        });
        console.log("✅ Bookings created");
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
        console.log("✨ Database seed completed successfully!");
    }
    catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
