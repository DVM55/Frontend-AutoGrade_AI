import api from "./api";

export const createExam = (data) => {
  return api.post("/quizzes", data);
};

export const getQuizzes = (params = {}) => {
  return api.get("/quizzes", {
    params: {
      title: params.title,
      classId: params.classId,
      status: params.status, // DRAFT, PUBLISHED
      quizAccessType: params.quizAccessType, // PUBLIC, PRIVATE
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  });
};

export const deleteQuiz = (quizId) => {
  return api.delete(`/quizzes/${quizId}`);
};

export const getQuizById = (id) => {
  return api.get(`/quizzes/${id}`);
};

export const getQuizDetailById = (id) => {
  return api.get(`/quizzes/detail/${id}`);
};

export const getQuizByCode = (code) => {
  return api.get(`/quizzes/code/${code}`);
};

export const getQuizByClassId = (classId, page = 0, size = 10) => {
  return api.get(`/quizzes/class/${classId}`, {
    params: { page, size },
  });
};

export const updateQuiz = (id, data) => {
  return api.put(`/quizzes/${id}`, data);
};

// lấy lịch sử làm bài của 1 quiz theo student
export const getQuizHistoryResult = (quizId, page = 0, size = 10) => {
  return api.get(`/quiz-attempts/history/${quizId}`, {
    params: { page, size },
  });
};

export const getQuizAttemptResult = (attemptId) => {
  return api.get(`/quiz-attempts/${attemptId}/answers`);
};

export const getAllQuizResults = (
  quizId,
  { page = 0, size = 10, userName, email } = {},
) => {
  return api.get(`/quiz-attempts/${quizId}/results`, {
    params: {
      page,
      size,
      userName,
      email,
    },
  });
};

export const getQuizStatistics = (quizId) => {
  return api.get(`/quizzes/${quizId}/statistics`);
};

export const startQuizAttempt = (quizId) => {
  return api.post(`/quiz-attempts/start/${quizId}`);
};

export const submitQuizAttempt = (attemptId, answers) => {
  return api.post(`/quiz-attempts/${attemptId}/submit`, answers);
};

export const getAllHistory = (page = 0, size = 10) => {
  return api.get(`/quiz-attempts/history?page=${page}&size=${size}`);
};

export const exportQuizResults = (quizId) => {
  return api.get(`/quizzes/${quizId}/export`, {
    responseType: "blob",
  });
};

export const getQuestionStatistics = (quizId) => {
  return api.get(`/quizzes/${quizId}/question-statistics`);
};
