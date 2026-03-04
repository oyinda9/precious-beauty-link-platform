-- SalonBook Demo Data Seed

-- Clear existing data (in reverse order of dependencies)
DELETE FROM "Message";
DELETE FROM "Review";
DELETE FROM "Booking";
DELETE FROM "TimeSlot";
DELETE FROM "Service";
DELETE FROM "Salon";
DELETE FROM "SalonOwner";
DELETE FROM "Admin";
DELETE FROM "User";

-- Insert Users
INSERT INTO "User" (id, email, password, fullName, phone, role, isActive) VALUES
('admin-user-1', 'admin@salon.com', '$2b$10$YOu8wVmIZvmHrX7qjU3p1OfVKNqy0YNgKvAKrK5B4Z0X0K1YfQnDa', 'Admin User', '555-0001', 'ADMIN', true),
('owner-user-1', 'owner@salon.com', '$2b$10$YOu8wVmIZvmHrX7qjU3p1OfVKNqy0YNgKvAKrK5B4Z0X0K1YfQnDa', 'John Owner', '555-0002', 'SALON_OWNER', true),
('owner-user-2', 'owner2@salon.com', '$2b$10$YOu8wVmIZvmHrX7qjU3p1OfVKNqy0YNgKvAKrK5B4Z0X0K1YfQnDa', 'Jane Owner', '555-0003', 'SALON_OWNER', true),
('client-user-1', 'client@salon.com', '$2b$10$YOu8wVmIZvmHrX7qjU3p1OfVKNqy0YNgKvAKrK5B4Z0X0K1YfQnDa', 'Sarah Client', '555-0010', 'CLIENT', true),
('client-user-2', 'client2@salon.com', '$2b$10$YOu8wVmIZvmHrX7qjU3p1OfVKNqy0YNgKvAKrK5B4Z0X0K1YfQnDa', 'Mike Johnson', '555-0011', 'CLIENT', true),
('client-user-3', 'client3@salon.com', '$2b$10$YOu8wVmIZvmHrX7qjU3p1OfVKNqy0YNgKvAKrK5B4Z0X0K1YfQnDa', 'Emily Davis', '555-0012', 'CLIENT', true);

-- Insert Admin
INSERT INTO "Admin" (id, userId) VALUES
('admin-1', 'admin-user-1');

-- Insert SalonOwners
INSERT INTO "SalonOwner" (id, userId, licenseNumber) VALUES
('owner-1', 'owner-user-1', 'LIC-001-ABC'),
('owner-2', 'owner-user-2', 'LIC-002-DEF');

-- Insert Salons
INSERT INTO "Salon" (id, name, description, address, city, phone, email, latitude, longitude, rating, reviewCount, isActive, ownerId) VALUES
('salon-1', 'Premier Hair Studio', 'Professional hair salon with experienced stylists', '123 Main St', 'New York', '555-1001', 'premier@salon.com', 40.7128, -74.0060, 4.5, 12, true, 'owner-1'),
('salon-2', 'Elegant Beauty Spa', 'Full service beauty and wellness salon', '456 Oak Ave', 'Los Angeles', '555-1002', 'elegant@salon.com', 34.0522, -118.2437, 4.8, 8, true, 'owner-2'),
('salon-3', 'Classic Barber Shop', 'Traditional barbershop for men', '789 Elm St', 'Chicago', '555-1003', 'classic@salon.com', 41.8781, -87.6298, 4.3, 5, true, 'owner-1');

-- Insert Services
INSERT INTO "Service" (id, salonId, name, description, price, duration, isActive) VALUES
-- Premier Hair Studio services
('service-1', 'salon-1', 'Haircut', 'Professional haircut with styling', 45.00, 30, true),
('service-2', 'salon-1', 'Hair Color', 'Full hair coloring service', 75.00, 60, true),
('service-3', 'salon-1', 'Hair Treatment', 'Deep conditioning hair treatment', 60.00, 45, true),
('service-4', 'salon-1', 'Blow Dry', 'Professional blow dry styling', 35.00, 20, true),

-- Elegant Beauty Spa services
('service-5', 'salon-2', 'Facial', 'Rejuvenating facial treatment', 85.00, 50, true),
('service-6', 'salon-2', 'Massage', 'Full body relaxation massage', 100.00, 60, true),
('service-7', 'salon-2', 'Manicure', 'Professional manicure service', 25.00, 30, true),
('service-8', 'salon-2', 'Pedicure', 'Professional pedicure service', 35.00, 45, true),

-- Classic Barber Shop services
('service-9', 'salon-3', 'Haircut', 'Classic men''s haircut', 25.00, 20, true),
('service-10', 'salon-3', 'Beard Trim', 'Beard trimming and styling', 20.00, 15, true),
('service-11', 'salon-3', 'Hot Shave', 'Traditional hot shave service', 30.00, 25, true);

-- Insert TimeSlots
INSERT INTO "TimeSlot" (id, salonId, dayOfWeek, startTime, endTime, isActive) VALUES
-- Premier Hair Studio - Monday to Friday, 9 AM to 6 PM
('slot-1', 'salon-1', 0, '09:00', '18:00', true),
('slot-2', 'salon-1', 1, '09:00', '18:00', true),
('slot-3', 'salon-1', 2, '09:00', '18:00', true),
('slot-4', 'salon-1', 3, '09:00', '18:00', true),
('slot-5', 'salon-1', 4, '09:00', '18:00', true),
('slot-6', 'salon-1', 5, '10:00', '16:00', true),

-- Elegant Beauty Spa - 10 AM to 8 PM
('slot-7', 'salon-2', 0, '10:00', '20:00', true),
('slot-8', 'salon-2', 1, '10:00', '20:00', true),
('slot-9', 'salon-2', 2, '10:00', '20:00', true),
('slot-10', 'salon-2', 3, '10:00', '20:00', true),
('slot-11', 'salon-2', 4, '10:00', '20:00', true),
('slot-12', 'salon-2', 5, '11:00', '19:00', true),

-- Classic Barber Shop - 8 AM to 6 PM
('slot-13', 'salon-3', 0, '08:00', '18:00', true),
('slot-14', 'salon-3', 1, '08:00', '18:00', true),
('slot-15', 'salon-3', 2, '08:00', '18:00', true),
('slot-16', 'salon-3', 3, '08:00', '18:00', true),
('slot-17', 'salon-3', 4, '08:00', '18:00', true),
('slot-18', 'salon-3', 5, '09:00', '17:00', true);

-- Insert Bookings
INSERT INTO "Booking" (id, clientId, salonId, serviceId, bookingDate, startTime, endTime, status, notes) VALUES
('booking-1', 'client-user-1', 'salon-1', 'service-1', NOW() + INTERVAL '1 day', '10:00', '10:30', 'CONFIRMED', 'Regular maintenance haircut'),
('booking-2', 'client-user-2', 'salon-1', 'service-2', NOW() + INTERVAL '2 days', '14:00', '15:00', 'CONFIRMED', 'Full head color'),
('booking-3', 'client-user-3', 'salon-2', 'service-5', NOW() + INTERVAL '3 days', '11:00', '11:50', 'PENDING', 'Monthly facial'),
('booking-4', 'client-user-1', 'salon-2', 'service-6', NOW() + INTERVAL '5 days', '15:00', '16:00', 'CONFIRMED', 'Relaxation massage'),
('booking-5', 'client-user-2', 'salon-3', 'service-9', NOW() + INTERVAL '1 day', '09:00', '09:20', 'CONFIRMED', '');

-- Insert Reviews
INSERT INTO "Review" (id, clientId, salonId, rating, comment) VALUES
('review-1', 'client-user-1', 'salon-1', 5, 'Excellent service! The stylists are very professional and friendly.'),
('review-2', 'client-user-2', 'salon-1', 4, 'Great haircut, would recommend!'),
('review-3', 'client-user-3', 'salon-2', 5, 'Amazing spa experience, very relaxing and calming.'),
('review-4', 'client-user-1', 'salon-2', 5, 'Best massage I''ve had in years!'),
('review-5', 'client-user-2', 'salon-3', 4, 'Classic barber shop with great attention to detail.');

-- Insert Messages
INSERT INTO "Message" (id, senderId, receiverId, salonId, message, isRead) VALUES
('msg-1', 'client-user-1', 'owner-user-1', 'salon-1', 'Can I reschedule my appointment?', false),
('msg-2', 'owner-user-1', 'client-user-1', 'salon-1', 'Of course! Let me check the available slots.', true),
('msg-3', 'client-user-2', 'owner-user-2', 'salon-2', 'Do you offer group rates for spa parties?', false),
('msg-4', 'owner-user-2', 'client-user-2', 'salon-2', 'Yes, we do! Please contact us for details.', true);
