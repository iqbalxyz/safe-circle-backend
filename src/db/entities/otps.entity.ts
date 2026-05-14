import { Generated, Insertable, Selectable } from 'kysely';

export interface UserOtpsTable {
  id: Generated<number>;
  email: string;
  otpCode: string;
  expiresAt: Date;
  isUsed: Generated<boolean>;
  createdAt: Generated<Date>;
  fullName?: string | undefined;
  passwordHash?: string | undefined;
}

export type UserOtp = Selectable<UserOtpsTable>;
export type UserOtpInsert = Insertable<UserOtpsTable>;
