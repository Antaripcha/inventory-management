import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { User } from "../models/index.js";
import {
  signAccessToken,
  issueRefreshToken,
  findValidRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../services/token.service.js";
import { recordAudit } from "../services/audit.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const isProd = process.env.NODE_ENV === "production";

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  // First registered user becomes admin; subsequent ones are regular users.
  const userCount = await User.countDocuments();
  const role = userCount === 0 ? "admin" : "user";

  const user = await User.create({ name, email, password, role });

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user, {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });
  setRefreshCookie(res, refreshToken);

  await recordAudit({
    user: user._id,
    action: "CREATE",
    entity: "User",
    entityId: user._id,
    description: `User ${user.email} registered`,
    ip: req.ip,
  });

  sendSuccess(res, {
    statusCode: 201,
    message: "Registration successful",
    data: { user: user.toSafeObject(), accessToken, refreshToken },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (!user.isActive) throw ApiError.forbidden("Your account has been deactivated");

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user, {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });
  setRefreshCookie(res, refreshToken);

  await recordAudit({
    user: user._id,
    action: "LOGIN",
    entity: "User",
    entityId: user._id,
    description: `User ${user.email} logged in`,
    ip: req.ip,
  });

  sendSuccess(res, {
    message: "Login successful",
    data: { user: user.toSafeObject(), accessToken, refreshToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw ApiError.unauthorized("Refresh token missing");

  const tokenDoc = await findValidRefreshToken(token);
  if (!tokenDoc) throw ApiError.unauthorized("Refresh token is invalid or expired");

  const user = tokenDoc.user;
  const newRefreshToken = await rotateRefreshToken(tokenDoc, user, {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });
  const accessToken = signAccessToken(user);
  setRefreshCookie(res, newRefreshToken);

  sendSuccess(res, {
    message: "Token refreshed",
    data: { accessToken, refreshToken: newRefreshToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) await revokeRefreshToken(token);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });

  if (req.user) {
    await recordAudit({
      user: req.user.id,
      action: "LOGOUT",
      entity: "User",
      entityId: req.user.id,
      description: `User ${req.user.email} logged out`,
      ip: req.ip,
    });
  }

  sendSuccess(res, { message: "Logged out successfully" });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, { data: { user: user.toSafeObject() } });
});
