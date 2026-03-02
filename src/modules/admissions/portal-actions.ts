/**
 * Public portal server actions  barrel re-export.
 * Split into domain-specific files under ./portal/ for maintainability.
 */

export {
  registerApplicantAction,
  verifyOtpAction,
  resendOtpAction,
} from './portal/portal-registration-actions';

export {
  startTestSessionAction,
  submitAnswerAction,
  submitTestAction,
  recordProctoringEventAction,
  heartbeatAction,
} from './portal/portal-test-actions';

export {
  checkResultAction,
  respondToScholarshipAction,
  trackApplicationAction,
} from './portal/portal-result-actions';
