"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.setAuthCookie = setAuthCookie;
exports.getAuthToken = getAuthToken;
exports.clearAuthCookie = clearAuthCookie;
exports.getCurrentUser = getCurrentUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const headers_1 = require("next/headers");
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
// Hash password
async function hashPassword(password) {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
}
// Verify password
async function verifyPassword(password, hashedPassword) {
    return bcryptjs_1.default.compare(password, hashedPassword);
}
// Generate JWT token
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: "30d",
    });
}
// Verify JWT token
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
}
// Set auth cookie
async function setAuthCookie(token) {
    const cookieStore = await (0, headers_1.cookies)();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });
}
// Get auth token from cookie
async function getAuthToken() {
    const cookieStore = await (0, headers_1.cookies)();
    const token = cookieStore.get(COOKIE_NAME);
    return token?.value ?? null;
}
// Clear auth cookie
async function clearAuthCookie() {
    const cookieStore = await (0, headers_1.cookies)();
    cookieStore.delete(COOKIE_NAME);
}
// Get current user from token
async function getCurrentUser() {
    const token = await getAuthToken();
    if (!token)
        return null;
    return verifyToken(token);
}
