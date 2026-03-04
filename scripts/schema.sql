-- SalonBook Database Schema
-- PostgreSQL 14+

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  fullName TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('ADMIN', 'SALON_OWNER', 'CLIENT')),
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);

-- Admin table
CREATE TABLE IF NOT EXISTS "Admin" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_userId ON "Admin"(userId);

-- SalonOwner table
CREATE TABLE IF NOT EXISTS "SalonOwner" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  licenseNumber TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX idx_salonowner_userId ON "SalonOwner"(userId);

-- Salon table
CREATE TABLE IF NOT EXISTS "Salon" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  rating FLOAT NOT NULL DEFAULT 0,
  reviewCount INT NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT true,
  ownerId TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES "SalonOwner"(id)
);

CREATE INDEX idx_salon_city ON "Salon"(city);
CREATE INDEX idx_salon_isActive ON "Salon"(isActive);
CREATE INDEX idx_salon_ownerId ON "Salon"(ownerId);

-- Service table
CREATE TABLE IF NOT EXISTS "Service" (
  id TEXT PRIMARY KEY,
  salonId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  duration INT NOT NULL,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salonId) REFERENCES "Salon"(id) ON DELETE CASCADE
);

CREATE INDEX idx_service_salonId ON "Service"(salonId);

-- TimeSlot table
CREATE TABLE IF NOT EXISTS "TimeSlot" (
  id TEXT PRIMARY KEY,
  salonId TEXT NOT NULL,
  dayOfWeek INT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salonId) REFERENCES "Salon"(id) ON DELETE CASCADE
);

CREATE INDEX idx_timeslot_salonId ON "TimeSlot"(salonId);

-- Booking table
CREATE TABLE IF NOT EXISTS "Booking" (
  id TEXT PRIMARY KEY,
  clientId TEXT NOT NULL,
  salonId TEXT NOT NULL,
  serviceId TEXT NOT NULL,
  bookingDate TIMESTAMP NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientId) REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (salonId) REFERENCES "Salon"(id) ON DELETE CASCADE,
  FOREIGN KEY (serviceId) REFERENCES "Service"(id) ON DELETE CASCADE
);

CREATE INDEX idx_booking_clientId ON "Booking"(clientId);
CREATE INDEX idx_booking_salonId ON "Booking"(salonId);
CREATE INDEX idx_booking_status ON "Booking"(status);
CREATE INDEX idx_booking_bookingDate ON "Booking"(bookingDate);

-- Review table
CREATE TABLE IF NOT EXISTS "Review" (
  id TEXT PRIMARY KEY,
  clientId TEXT NOT NULL,
  salonId TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientId) REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (salonId) REFERENCES "Salon"(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_clientId ON "Review"(clientId);
CREATE INDEX idx_review_salonId ON "Review"(salonId);

-- Message table
CREATE TABLE IF NOT EXISTS "Message" (
  id TEXT PRIMARY KEY,
  senderId TEXT NOT NULL,
  receiverId TEXT NOT NULL,
  salonId TEXT,
  message TEXT NOT NULL,
  isRead BOOLEAN NOT NULL DEFAULT false,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (senderId) REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (receiverId) REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (salonId) REFERENCES "Salon"(id) ON DELETE SET NULL
);

CREATE INDEX idx_message_senderId ON "Message"(senderId);
CREATE INDEX idx_message_receiverId ON "Message"(receiverId);
CREATE INDEX idx_message_isRead ON "Message"(isRead);
