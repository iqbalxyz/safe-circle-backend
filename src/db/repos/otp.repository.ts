import { db } from '../database';
import { UserOtp, UserOtpInsert } from '../entities/otps.entity';

export const OtpRepository = {
  /**
   * Save a newly generated OTP security token
   */
  createOtp: async (data: UserOtpInsert): Promise<void> => {
    await db
      .insertInto('user_otps')
      .values({
        email: data.email,
        otpCode: data.otpCode,
        expiresAt: data.expiresAt,
        fullName: data.fullName,
        passwordHash: data.passwordHash
      })
      .executeTakeFirstOrThrow();
  },

  /**
   * Look up an unexpired, unused verification token matching criteria
   */
  findValidOtp: async (email: string, otpCode: string): Promise<UserOtp | undefined> => {
    return await db
      .selectFrom('user_otps')
      .selectAll()
      .where('email', '=', email)
      .where('otpCode', '=', otpCode)
      .where('isUsed', '=', false)
      .where('expiresAt', '>', new Date())
      .executeTakeFirst();
  },

  /**
   * Mark a used token as consumed to block replay attacks
   */
  markOtpAsUsed: async (id: number): Promise<void> => {
    await db
      .updateTable('user_otps')
      .set({ isUsed: true })
      .where('id', '=', id)
      .executeTakeFirstOrThrow();
  }
};
