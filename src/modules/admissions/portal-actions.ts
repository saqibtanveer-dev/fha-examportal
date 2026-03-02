/**
 * Portal server actions  barrel re-export.
 * Only test-taking actions remain (no self-registration/public results).
 */

export { startTestSessionAction } from './portal/portal-test-start-actions';
export {
  submitAnswerAction,
  submitTestAction,
  recordProctoringEventAction,
  heartbeatAction,
} from './portal/portal-test-actions';
