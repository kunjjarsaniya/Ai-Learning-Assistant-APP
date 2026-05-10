import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const generateMindMap = async (documentId) => {
    try {
        const response = await axiosInstance.post(API_PATHS.MIND_MAPS.GENERATE, { documentId });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to generate mind map' };
    }
};

const getMindMaps = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.MIND_MAPS.GET_ALL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch mind maps' };
    }
};

const getMindMapById = async (id) => {
    try {
        const response = await axiosInstance.get(API_PATHS.MIND_MAPS.GET_BY_ID(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch mind map details' };
    }
};

const deleteMindMap = async (id) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.MIND_MAPS.DELETE(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete mind map' };
    }
};

const mindMapService = {
    generateMindMap,
    getMindMaps,
    getMindMapById,
    deleteMindMap
};

export default mindMapService;
