import { VerificationsRepository } from '../../db/repos/verification.repository';
import { VerificationsUpdate } from '../../db/types/verifications.type';
import { VerifyIncidentBodyRequest } from '../../schemas/verifications.schema';

export const verifyIncidentService = async (
  incidentId: number,
  userId: number,
  data: VerifyIncidentBodyRequest
): Promise<VerificationsUpdate> => {
  const isVerified = data.isVerified;
  return await VerificationsRepository.verifyIncident(incidentId, userId, isVerified);
};
