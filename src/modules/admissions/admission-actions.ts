/**
 * Admission admin server actions — barrel re-export.
 * Split into domain-specific files under ./actions/ for maintainability.
 */

export {
  createCampaignAction,
  updateCampaignAction,
  deleteCampaignAction,
} from './actions/campaign-crud-actions';

export {
  openRegistrationAction,
  closeRegistrationAction,
  activateTestAction,
  closeTestAction,
  triggerGradingAction,
  publishResultsAction,
  completeCampaignAction,
  archiveCampaignAction,
} from './actions/campaign-lifecycle-actions';

export {
  createCampaignQuestionAction,
  importCsvQuestionsAction,
  removeQuestionsFromCampaignAction,
  configureScholarshipTiersAction,
} from './actions/campaign-question-actions';

export {
  makeDecisionAction,
  bulkDecisionAction,
  promoteFromWaitlistAction,
} from './actions/applicant-decision-actions';

export {
  autoAssignScholarshipsAction,
  enrollApplicantAction,
  bulkEnrollAction,
  generateMeritListAction,
} from './actions/applicant-enrollment-actions';

export {
  addCandidateAction,
  bulkAddCandidatesAction,
  regenerateTestPinAction,
  updateCandidateAction,
} from './actions/candidate-management-actions';
