import MindMap from '../models/MindMap.js';
import Document from '../models/Document.js';
import * as geminiService from '../utils/geminiService.js';

// @desc    Generate mind map data from document
// @route   POST /api/mind-maps/generate
// @access  Private
export const generateMindMap = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId'
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready'
            });
        }

        // Generate hierarchical data using Gemini
        const hierarchy = await geminiService.generateMindMapData(document.extractedText);

        // Convert hierarchy to ReactFlow nodes and edges
        const nodes = [];
        const edges = [];
        
        const processNode = (node, parentId = null, depth = 0, index = 0) => {
            const id = node.id || `node_${Math.random().toString(36).substr(2, 9)}`;
            
            // Simple layout calculation (can be improved on frontend)
            const x = index * 250;
            const y = depth * 150;

            nodes.push({
                id,
                data: { label: node.label },
                position: { x, y },
                type: depth === 0 ? 'input' : (node.children?.length > 0 ? 'default' : 'output')
            });

            if (parentId) {
                edges.push({
                    id: `e_${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    animated: true
                });
            }

            if (node.children) {
                node.children.forEach((child, i) => {
                    processNode(child, id, depth + 1, i + index);
                });
            }
        };

        processNode(hierarchy);

        // Save to database
        const mindMap = await MindMap.create({
            user: req.user._id,
            document: document._id,
            title: `${document.title} - Mind Map`,
            graphData: { nodes, edges }
        });

        res.status(201).json({
            success: true,
            data: mindMap
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all mind maps for a user
// @route   GET /api/mind-maps
// @access  Private
export const getMindMaps = async (req, res, next) => {
    try {
        const mindMaps = await MindMap.find({ user: req.user._id }).populate('document', 'title');
        
        res.status(200).json({
            success: true,
            count: mindMaps.length,
            data: mindMaps
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single mind map
// @route   GET /api/mind-maps/:id
// @access  Private
export const getMindMapById = async (req, res, next) => {
    try {
        const mindMap = await MindMap.findOne({ 
            _id: req.params.id, 
            user: req.user._id 
        }).populate('document', 'title');

        if (!mindMap) {
            return res.status(404).json({
                success: false,
                error: 'Mind map not found'
            });
        }

        res.status(200).json({
            success: true,
            data: mindMap
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a mind map
// @route   DELETE /api/mind-maps/:id
// @access  Private
export const deleteMindMap = async (req, res, next) => {
    try {
        const mindMap = await MindMap.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!mindMap) {
            return res.status(404).json({
                success: false,
                error: 'Mind map not found'
            });
        }

        await mindMap.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Mind map deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
