import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { RefreshToken } from "../models/index.js";

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

function msFromDuration(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
}

export async function issueRefreshToken(user, { userAgent = "", ip = "" } = {}) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + msFromDuration(env.JWT_REFRESH_EXPIRES_IN));

  await RefreshToken.create({
    user: user._id,
    token,
    userAgent,
    ip,
    expiresAt,
  });

  return token;
}

export async function rotateRefreshToken(oldTokenDoc, user, meta) {
  oldTokenDoc.revoked = true;
  const newToken = await issueRefreshToken(user, meta);
  oldTokenDoc.replacedByToken = newToken;
  await oldTokenDoc.save();
  return newToken;
}

export async function findValidRefreshToken(token) {
  const doc = await RefreshToken.findOne({ token }).populate("user");
  if (!doc) return null;
  if (doc.revoked || doc.expiresAt < new Date()) return null;
  return doc;
}

export async function revokeRefreshToken(token) {
  await RefreshToken.updateOne({ token }, { revoked: true });
}

export async function revokeAllUserTokens(userId) {
  await RefreshToken.updateMany({ user: userId, revoked: false }, { revoked: true });
}
