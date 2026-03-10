"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var auth_1 = require("../lib/auth");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var usersBefore, superAdminPassword, superAdminUser, superAdmin2Password, superAdminUser2, adminPassword, adminUser, clientPassword, client1, client2, salon1, salon2, service1, service2, service3, staff1User, _a, _b, staff2User, _c, _d, day, _e, _f, day, tomorrow, booking1, booking2, currentMonth, currentYear, usersAfter, error_1;
        var _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    console.log("🌱 Starting database seed...");
                    console.log("DATABASE_URL:", process.env.DATABASE_URL);
                    return [4 /*yield*/, prisma.user.findMany()];
                case 1:
                    usersBefore = _o.sent();
                    console.log("Users in DB before seeding:", usersBefore);
                    _o.label = 2;
                case 2:
                    _o.trys.push([2, 45, 46, 48]);
                    return [4 /*yield*/, (0, auth_1.hashPassword)("password123")];
                case 3:
                    superAdminPassword = _o.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "superadmin@salon.com",
                                password: superAdminPassword,
                                fullName: "Super Admin",
                                phone: "+1234567890",
                                role: client_1.UserRole.SUPER_ADMIN,
                            },
                        })];
                case 4:
                    superAdminUser = _o.sent();
                    return [4 /*yield*/, prisma.superAdmin.create({
                            data: {
                                userId: superAdminUser.id,
                            },
                        })];
                case 5:
                    _o.sent();
                    return [4 /*yield*/, (0, auth_1.hashPassword)("admin456!")];
                case 6:
                    superAdmin2Password = _o.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "super2@salon.com",
                                password: superAdmin2Password,
                                fullName: "Backup Super Admin",
                                phone: "+1234567899",
                                role: client_1.UserRole.SUPER_ADMIN,
                            },
                        })];
                case 7:
                    superAdminUser2 = _o.sent();
                    return [4 /*yield*/, prisma.superAdmin.create({
                            data: {
                                userId: superAdminUser2.id,
                            },
                        })];
                case 8:
                    _o.sent();
                    console.log("✅ Super admin users created");
                    return [4 /*yield*/, (0, auth_1.hashPassword)("password123")];
                case 9:
                    adminPassword = _o.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "admin@salon.com",
                                password: adminPassword,
                                fullName: "Salon Admin",
                                phone: "+1234567891",
                                role: client_1.UserRole.SALON_ADMIN,
                            },
                        })];
                case 10:
                    adminUser = _o.sent();
                    console.log("✅ Salon admin user created");
                    return [4 /*yield*/, (0, auth_1.hashPassword)("password123")];
                case 11:
                    clientPassword = _o.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "client@salon.com",
                                password: clientPassword,
                                fullName: "John Client",
                                phone: "+1234567892",
                                role: client_1.UserRole.CLIENT,
                            },
                        })];
                case 12:
                    client1 = _o.sent();
                    return [4 /*yield*/, prisma.client.create({ data: { userId: client1.id } })];
                case 13:
                    _o.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: "jane@example.com",
                                password: clientPassword,
                                fullName: "Jane Doe",
                                phone: "+1234567893",
                                role: client_1.UserRole.CLIENT,
                            },
                        })];
                case 14:
                    client2 = _o.sent();
                    return [4 /*yield*/, prisma.client.create({ data: { userId: client2.id } })];
                case 15:
                    _o.sent();
                    console.log("✅ Client users created");
                    return [4 /*yield*/, prisma.salon.create({
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
                        })];
                case 16:
                    salon1 = _o.sent();
                    return [4 /*yield*/, prisma.salon.create({
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
                        })];
                case 17:
                    salon2 = _o.sent();
                    console.log("✅ Salons created");
                    // Add salon admin to first salon
                    return [4 /*yield*/, prisma.salonAdmin.create({
                            data: {
                                userId: adminUser.id,
                                salonId: salon1.id,
                            },
                        })];
                case 18:
                    // Add salon admin to first salon
                    _o.sent();
                    console.log("✅ Salon admin assigned");
                    return [4 /*yield*/, prisma.service.create({
                            data: {
                                salonId: salon1.id,
                                name: "Hair Cut",
                                description: "Professional hair cutting service",
                                price: 35.0,
                                duration: 30,
                                category: "haircut",
                            },
                        })];
                case 19:
                    service1 = _o.sent();
                    return [4 /*yield*/, prisma.service.create({
                            data: {
                                salonId: salon1.id,
                                name: "Hair Color",
                                description: "Full hair coloring service",
                                price: 75.0,
                                duration: 90,
                                category: "coloring",
                            },
                        })];
                case 20:
                    service2 = _o.sent();
                    return [4 /*yield*/, prisma.service.create({
                            data: {
                                salonId: salon2.id,
                                name: "Styling",
                                description: "Professional styling service",
                                price: 45.0,
                                duration: 60,
                                category: "styling",
                            },
                        })];
                case 21:
                    service3 = _o.sent();
                    console.log("✅ Services created");
                    _b = (_a = prisma.user).create;
                    _g = {};
                    _h = {
                        email: "sarah@beautyhaven.com"
                    };
                    return [4 /*yield*/, (0, auth_1.hashPassword)("staffpass123")];
                case 22: return [4 /*yield*/, _b.apply(_a, [(_g.data = (_h.password = _o.sent(),
                            _h.fullName = "Sarah Manager",
                            _h.phone = "+1987654330",
                            _h.role = client_1.UserRole.SALON_STAFF,
                            _h),
                            _g)])];
                case 23:
                    staff1User = _o.sent();
                    return [4 /*yield*/, prisma.salonStaff.create({
                            data: {
                                userId: staff1User.id,
                                salonId: salon1.id,
                                specialties: ["haircut", "coloring"],
                                hourlyRate: 25,
                            },
                        })];
                case 24:
                    _o.sent();
                    _d = (_c = prisma.user).create;
                    _j = {};
                    _k = {
                        email: "mike@hairmasters.com"
                    };
                    return [4 /*yield*/, (0, auth_1.hashPassword)("staffpass123")];
                case 25: return [4 /*yield*/, _d.apply(_c, [(_j.data = (_k.password = _o.sent(),
                            _k.fullName = "Mike Stylist",
                            _k.phone = "+1987654331",
                            _k.role = client_1.UserRole.SALON_STAFF,
                            _k),
                            _j)])];
                case 26:
                    staff2User = _o.sent();
                    return [4 /*yield*/, prisma.salonStaff.create({
                            data: {
                                userId: staff2User.id,
                                salonId: salon2.id,
                                specialties: ["styling", "cutting"],
                                hourlyRate: 20,
                            },
                        })];
                case 27:
                    _o.sent();
                    console.log("✅ Staff members created");
                    day = 0;
                    _o.label = 28;
                case 28:
                    if (!(day < 7)) return [3 /*break*/, 32];
                    _f = (_e = prisma.staffAvailability).create;
                    _l = {};
                    _m = {};
                    return [4 /*yield*/, prisma.salonStaff.findFirst({
                            where: { salonId: salon1.id },
                        })];
                case 29: return [4 /*yield*/, _f.apply(_e, [(_l.data = (_m.staffId = (_o.sent()).id,
                            _m.dayOfWeek = day,
                            _m.startTime = "09:00",
                            _m.endTime = "18:00",
                            _m),
                            _l)])];
                case 30:
                    _o.sent();
                    _o.label = 31;
                case 31:
                    day++;
                    return [3 /*break*/, 28];
                case 32:
                    console.log("✅ Staff availability created");
                    day = 0;
                    _o.label = 33;
                case 33:
                    if (!(day < 7)) return [3 /*break*/, 37];
                    return [4 /*yield*/, prisma.timeSlot.create({
                            data: {
                                salonId: salon1.id,
                                dayOfWeek: day,
                                startTime: "09:00",
                                endTime: "18:00",
                            },
                        })];
                case 34:
                    _o.sent();
                    return [4 /*yield*/, prisma.timeSlot.create({
                            data: {
                                salonId: salon2.id,
                                dayOfWeek: day,
                                startTime: "10:00",
                                endTime: "19:00",
                            },
                        })];
                case 35:
                    _o.sent();
                    _o.label = 36;
                case 36:
                    day++;
                    return [3 /*break*/, 33];
                case 37:
                    console.log("✅ Time slots created");
                    tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return [4 /*yield*/, prisma.booking.create({
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
                        })];
                case 38:
                    booking1 = _o.sent();
                    return [4 /*yield*/, prisma.booking.create({
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
                        })];
                case 39:
                    booking2 = _o.sent();
                    console.log("✅ Bookings created");
                    currentMonth = new Date().getMonth() + 1;
                    currentYear = new Date().getFullYear();
                    return [4 /*yield*/, prisma.revenue.create({
                            data: {
                                salonId: salon1.id,
                                amount: 110.0,
                                currency: "USD",
                                month: currentMonth,
                                year: currentYear,
                                totalBookings: 2,
                                totalClients: 2,
                            },
                        })];
                case 40:
                    _o.sent();
                    console.log("✅ Revenue record created");
                    // Create reviews
                    return [4 /*yield*/, prisma.review.create({
                            data: {
                                salonId: salon1.id,
                                clientId: client1.id,
                                bookingId: booking1.id,
                                rating: 5,
                                comment: "Excellent service! Very professional and friendly staff.",
                            },
                        })];
                case 41:
                    // Create reviews
                    _o.sent();
                    console.log("✅ Reviews created");
                    // Create subscription
                    return [4 /*yield*/, prisma.subscription.create({
                            data: {
                                salonId: salon1.id,
                                plan: "STARTER",
                                status: "ACTIVE",
                                trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            },
                        })];
                case 42:
                    // Create subscription
                    _o.sent();
                    return [4 /*yield*/, prisma.subscription.create({
                            data: {
                                salonId: salon2.id,
                                plan: "TRIAL",
                                status: "TRIAL",
                                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                            },
                        })];
                case 43:
                    _o.sent();
                    console.log("✅ Subscriptions created");
                    return [4 /*yield*/, prisma.user.findMany()];
                case 44:
                    usersAfter = _o.sent();
                    console.log("Users in DB after seeding:", usersAfter);
                    console.log("✨ Database seed completed successfully!");
                    return [3 /*break*/, 48];
                case 45:
                    error_1 = _o.sent();
                    console.error("❌ Error seeding database:", error_1);
                    process.exit(1);
                    return [3 /*break*/, 48];
                case 46: return [4 /*yield*/, prisma.$disconnect()];
                case 47:
                    _o.sent();
                    return [7 /*endfinally*/];
                case 48: return [2 /*return*/];
            }
        });
    });
}
main();
