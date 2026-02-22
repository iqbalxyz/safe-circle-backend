import 'dotenv/config';
import jsonwebtoken from 'jsonwebtoken';
import { HttpErrors } from './error.util';
import { AccessTokenPayload } from '../interface/auth.interface';

const generateAccessToken = (payload: AccessTokenPayload) => {
  const secret = process.env.JWT_SECRET_KEY;

  if (!secret) {
    throw new Error('JWT_SECRET_KEY is missing');
  }

  return jsonwebtoken.sign(payload, secret, {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10)
  });
};

const generateRefreshToken = (payload: AccessTokenPayload) => {
  const secret = process.env.JWT_REFRESH_SECRET_KEY;

  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET_KEY is missing');
  }

  const expiresInSeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10);

  const token = jsonwebtoken.sign(payload, secret, {
    expiresIn: expiresInSeconds
  });

  return {
    token,
    expiresInSeconds
  };
};

const verifyRefreshToken = (token: string) => {
  try {
    return jsonwebtoken.verify(token, String(process.env.JWT_REFRESH_SECRET_KEY));
  } catch (error) {
    throw HttpErrors.unauthorized(`Verify Refresh Token Error: ${error}`);
  }
};

const parseJwt = (token: string) => {
  try {
    const decoded = jsonwebtoken.decode(token, { complete: true });
    return decoded?.payload;
  } catch (error) {
    throw HttpErrors.unauthorized(`Parse JWT Error: ${error}`);
  }
};

const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY!) as AccessTokenPayload;

    return decoded;
  } catch (error) {
    throw HttpErrors.unauthorized(`Parse JWT Error: ${error}`);
  }
};

const getRefreshConfig = () => {
  const seconds = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10);
  return {
    seconds,
    milliseconds: seconds * 1000
  };
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseJwt,
  verifyAccessToken,
  getRefreshConfig
};
