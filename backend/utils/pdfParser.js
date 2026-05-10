import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Extracts text from a PDF file buffer using pdf-parse
 * Works on standard Node.js environments (Render, Railway, etc.)
 * @param {Buffer} source - PDF file buffer
 * @returns {Promise<{text: string, numPages: number}>}
 */
export const extractTextFromPDF = async (source) => {
    try {
        // console.log('[PDF PARSER] Starting PDF text extraction');

        if (!source || source.length === 0) {
            throw new Error('PDF buffer is empty');
        }

        // Load pdf-parse using require (CommonJS module)
        const pdfParse = require('pdf-parse');

        // console.log('[PDF PARSER] pdf-parse loaded, type:', typeof pdfParse);

        // Parse PDF directly (pdf-parse v1.x exports a function directly)
        const data = await pdfParse(source);

        // console.log('[PDF PARSER] Text extracted successfully:', {
        //     pages: data.numpages,
        //     textLength: data.text?.length
        // });

        return {
            text: data.text,
            numPages: data.numpages
        };
    } catch (error) {
        // console.error('[PDF PARSER] Error:', error.message);
        throw new Error('Failed to extract text from PDF: ' + error.message);
    }
};