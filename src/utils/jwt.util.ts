import 'dotenv/config';
import jsonwebtoken from 'jsonwebtoken';
import { HttpErrors } from './error.util';

const generateAccessToken = (payload: object) => {
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET_KEY as string, {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600')
  });
};

const generateRefreshToken = (payload: object) => {
  return jsonwebtoken.sign(payload, process.env.JWT_REFRESH_SECRET_KEY as string, {
    expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800')
  });
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

const verifyAccessToken = (token: string) => {
  try {
    return jsonwebtoken.verify(token, String(process.env.JWT_SECRET_KEY));
  } catch (error) {
    throw HttpErrors.unauthorized(`Verify Refresh Token Error: ${error}`);
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseJwt,
  verifyAccessToken
};
