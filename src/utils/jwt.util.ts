import 'dotenv/config';
import jsonwebtoken from 'jsonwebtoken';

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

export { generateAccessToken, generateRefreshToken };
