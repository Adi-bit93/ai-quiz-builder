import sanitizeHtml from 'sanitize-html';

// Mock generator for local dev and unit tests
export const generateMockQuestions = ({topic, difficulty, questionCount }) => {
    const questions = [];
    for(let i = 0; i < questionCount; i++){
        const text = `${topic} - sample question ${i + 1}(${difficulty})`;
        const options = [
            `${text} - option A`,
            `${text} - option B`,
            `${text} - option C`,
            `${text} - option D`,
        ];
        const correctIndex = i % options.length;
        questions.push({
            text: sanitizeHtml(text),
            options: options.map((o) => sanitizeHtml(o)),
            correctIndex,
        });
    }
    return questions;
}