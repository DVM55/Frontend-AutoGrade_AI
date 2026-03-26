import api from "./api";

export const getQuestion = (params = {}) => {
  return api.get("/questions", {
    params: {
      content: params.content,
      categoryId: params.categoryId,
      groupId: params.groupId,
      questionType: params.questionType, //SINGLE_CHOICE, MULTIPLE_CHOICE, SHORT_ANSWER
      questionFilterMode: params.questionFilterMode ?? "ALL", //ALL,UNCLASSIFIED
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  });
};

// ───────────── DELETE 1 ─────────────
export const deleteQuestion = (questionId) => {
  return api.delete(`/questions/${questionId}`);
};

// ───────────── DELETE MANY ─────────────
export const deleteQuestionsByIds = (ids) => {
  return api.delete("/questions/delete-by-ids", {
    data: ids, // ⚠️ axios delete phải truyền body qua "data"
  });
};

// ───────────── DELETE ALL BY CREATOR ─────────────
export const deleteAllQuestions = () => {
  return api.delete("/questions");
};

export const updateQuestionsByIds = (data) => {
  return api.put("/questions/update-by-ids", data);
};

export const updateQuestion = (questionId, data) => {
  return api.put(`/questions/${questionId}`, data);
};

// ───────────── CREATE MANY QUESTIONS ─────────────
export const createQuestions = (data) => {
  return api.post("/questions", data);
};
