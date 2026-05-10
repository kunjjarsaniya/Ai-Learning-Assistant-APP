import mongoose from 'mongoose';

const MindMapSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    graphData: {
        nodes: {
            type: Array,
            default: []
        },
        edges: {
            type: Array,
            default: []
        }
    }
}, {
    timestamps: true
});

const MindMap = mongoose.model('MindMap', MindMapSchema);

export default MindMap;
