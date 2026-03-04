/**
 * Barrel re-export for admission email templates.
 * Split into applicant lifecycle and decision/outcome templates.
 */

export {
  applicantOtpEmail,
  applicantVerifiedEmail,
  testAccessLinkEmail,
  testSubmittedEmail,
  resultPublishedEmail,
} from './admission-applicant-templates';

export {
  decisionAcceptedEmail,
  decisionRejectedEmail,
  decisionWaitlistedEmail,
  scholarshipOfferedEmail,
  waitlistPromotedEmail,
  enrollmentWelcomeEmail,
  ADMISSION_EMAIL_SUBJECTS,
  type AdmissionEmailTemplate,
} from './admission-decision-templates';

