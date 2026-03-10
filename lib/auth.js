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
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.setAuthCookie = setAuthCookie;
exports.getAuthToken = getAuthToken;
exports.clearAuthCookie = clearAuthCookie;
exports.getCurrentUser = getCurrentUser;
exports.isSuperAdmin = isSuperAdmin;
exports.isSalonAdmin = isSalonAdmin;
exports.isSalonStaff = isSalonStaff;
exports.isClient = isClient;
exports.extractToken = extractToken;
var jsonwebtoken_1 = require("jsonwebtoken");
var bcryptjs_1 = require("bcryptjs");
var headers_1 = require("next/headers");
var client_1 = require("@prisma/client");
var JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
var COOKIE_NAME = "auth_token";
var COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
// Hash password
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
                case 1:
                    salt = _a.sent();
                    return [2 /*return*/, bcryptjs_1.default.hash(password, salt)];
            }
        });
    });
}
// Verify password
function verifyPassword(password, hashedPassword) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcryptjs_1.default.compare(password, hashedPassword)];
        });
    });
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
        var decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (_a) {
        return null;
    }
}
// Set auth cookie
function setAuthCookie(token) {
    return __awaiter(this, void 0, void 0, function () {
        var cookieStore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, headers_1.cookies)()];
                case 1:
                    cookieStore = _a.sent();
                    cookieStore.set(COOKIE_NAME, token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        maxAge: COOKIE_MAX_AGE,
                        path: "/",
                    });
                    return [2 /*return*/];
            }
        });
    });
}
// Get auth token from cookie
function getAuthToken() {
    return __awaiter(this, void 0, void 0, function () {
        var cookieStore, token;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, headers_1.cookies)()];
                case 1:
                    cookieStore = _b.sent();
                    token = cookieStore.get(COOKIE_NAME);
                    return [2 /*return*/, (_a = token === null || token === void 0 ? void 0 : token.value) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
// Clear auth cookie
function clearAuthCookie() {
    return __awaiter(this, void 0, void 0, function () {
        var cookieStore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, headers_1.cookies)()];
                case 1:
                    cookieStore = _a.sent();
                    cookieStore.delete(COOKIE_NAME);
                    return [2 /*return*/];
            }
        });
    });
}
// Get current user from token
function getCurrentUser() {
    return __awaiter(this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAuthToken()];
                case 1:
                    token = _a.sent();
                    if (!token)
                        return [2 /*return*/, null];
                    return [2 /*return*/, verifyToken(token)];
            }
        });
    });
}
// Role checking helpers
function isSuperAdmin(role) {
    return role === client_1.UserRole.SUPER_ADMIN;
}
function isSalonAdmin(role) {
    return role === client_1.UserRole.SALON_ADMIN;
}
function isSalonStaff(role) {
    return role === client_1.UserRole.SALON_STAFF;
}
function isClient(role) {
    return role === client_1.UserRole.CLIENT;
}
// Token extraction from Authorization header
function extractToken(authHeader) {
    if (!authHeader)
        return null;
    var parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
        return null;
    return parts[1];
}
