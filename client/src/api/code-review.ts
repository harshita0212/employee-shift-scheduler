import api from './axios';

export const codeReviewApi = {
    runReview: () => api.get('/code-review/run'),
};
