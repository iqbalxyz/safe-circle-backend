import { db } from '../database';
import { HttpErrors } from '../../utils/error.util';
import { VerificationsUpdate } from '../entities/verifications.entity';

export const VerificationsRepository = {
  verifyIncident: async (
    incidentId: number,
    userId: number,
    isVerified: boolean
  ): Promise<VerificationsUpdate> => {
    const result = await db
      .insertInto('verifications')
      .values({
        incidentId: incidentId,
        userId: userId,
        isVerified: isVerified
      })
      .onDuplicateKeyUpdate({
        isVerified: isVerified
      })
      .execute();

    if (!result) {
      throw HttpErrors.internal('Failed to upsert verification');
    }

    return {
      incidentId: incidentId,
      userId: userId,
      isVerified: isVerified
    };
  }
};
