import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: [true, 'Please provide a document title'],
            trim: true
        },
        fileName: {
            type: String,
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        fileSize: {
            type: Number,
            required: true
        },
        gridFsId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false // Optional for backward compatibility
        },
        extractedText: {
            type: String,
            default: ''
        },
        chunks: [{
            content: {
                type: String,
                required: true
            },
            pageNumber: {
                type: Number,
                default: 0
            },
            chunkIndex: {
                type: Number,
                required: true
            }
        }],
        uploadData: {
            type: Date,
            default: Date.now
        },
        lastAccessed: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['processing', 'ready', 'failed'],
            default: 'processing'
        },
        processingError: {
            type: String,
            default: null
        }
    }, {
    timestamps: true
});

documentSchema.index({ userId: 1, uploadData: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;