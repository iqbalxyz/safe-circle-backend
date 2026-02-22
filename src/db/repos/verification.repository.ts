import { db } from '../database';
import { HttpErrors } from '../../utils/error.util';
import { VerificationsUpdate } from '../types/verifications.type';

export const VerificationsRepository = {
  verifyIncident: async (
    incidentId: number,
    userId: number,
    isVerified: boolean
  ): Promise<VerificationsUpdate> => {
    const result = await db
      .insertInto('verifications')
      .values({
        incident_id: incidentId,
        user_id: userId,
        is_verified: isVerified
      })
      .onDuplicateKeyUpdate({
        is_verified: isVerified
      })
      .execute();

    if (!result) {
      throw HttpErrors.internal('Failed to upsert verification');
    }

    return {
      incident_id: incidentId,
      user_id: userId,
      is_verified: isVerified
    };
  }
};
