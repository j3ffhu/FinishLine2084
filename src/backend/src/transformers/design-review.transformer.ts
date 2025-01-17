import { Prisma } from '@prisma/client';
import { DesignReview, DesignReviewStatus } from 'shared';
import userTransformer from './user.transformer';
import designReviewQueryArgs from '../prisma-query-args/design-review.query-args';
import { wbsNumOf } from '../utils/utils';

export const designReviewTransformer = (
  designReview: Prisma.Design_ReviewGetPayload<typeof designReviewQueryArgs>
): DesignReview => {
  return {
    designReviewId: designReview.designReviewId,
    dateScheduled: designReview.dateScheduled,
    meetingTimes: designReview.meetingTimes,
    dateCreated: designReview.dateCreated,
    userCreated: userTransformer(designReview.userCreated),
    requiredMembers: designReview.requiredMembers.map(userTransformer),
    optionalMembers: designReview.optionalMembers.map(userTransformer),
    confirmedMembers: designReview.confirmedMembers.map(userTransformer),
    deniedMembers: designReview.deniedMembers.map(userTransformer),
    location: designReview.location ?? undefined,
    isOnline: designReview.isOnline,
    isInPerson: designReview.isInPerson,
    zoomLink: designReview.zoomLink ?? undefined,
    attendees: designReview.attendees.map(userTransformer),
    dateDeleted: designReview.dateDeleted ?? undefined,
    userDeleted: designReview.userDeleted ? userTransformer(designReview.userDeleted) : undefined,
    docTemplateLink: designReview.docTemplateLink ?? undefined,
    status: designReview.status as DesignReviewStatus,
    teamType: designReview.teamType,
    wbsName: designReview.wbsElement.name,
    wbsNum: wbsNumOf(designReview.wbsElement)
  };
};
