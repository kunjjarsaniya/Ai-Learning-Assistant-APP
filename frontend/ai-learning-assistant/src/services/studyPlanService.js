import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const generatePlan = async (documentId, examDate, dailyHours) => {
    try {
        const response = await axiosInstance.post(API_PATHS.STUDY_PLANS.GENERATE, { documentId, examDate, dailyHours });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to generate study plan' };
    }
};

const getStudyPlans = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.STUDY_PLANS.GET_ALL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch study plans' };
    }
};

const getStudyPlanById = async (id) => {
    try {
        const response = await axiosInstance.get(API_PATHS.STUDY_PLANS.GET_BY_ID(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch study plan details' };
    }
};

const deleteStudyPlan = async (id) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.STUDY_PLANS.DELETE(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete study plan' };
    }
};

const updateTopicStatus = async (planId, topicId, isCompleted) => {
    try {
        const response = await axiosInstance.put(API_PATHS.STUDY_PLANS.UPDATE_TOPIC(planId, topicId), { isCompleted });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update topic status' };
    }
};

const studyPlanService = {
    generatePlan,
    getStudyPlans,
    getStudyPlanById,
    deleteStudyPlan,
    updateTopicStatus
};

export default studyPlanService;
