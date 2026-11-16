import { summarizeContent, generateRoadmapAI, chatWithAI } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    AI Topic Summarization & Explanation
// @route   POST /api/ai/summarize
// @access  Private
export const summarize = async (req, res, next) => {
  try {
    const { topic, mode, language, focus } = req.body;
    if (!topic || topic.trim() === '') {
      return sendError(res, 400, 'Topic is required');
    }

    const content = await summarizeContent({ topic, mode, language, focus });
    return sendSuccess(res, 200, 'Summarization generated', { content });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Structured Roadmap Generation
// @route   POST /api/ai/roadmap
// @access  Private
export const generateRoadmap = async (req, res, next) => {
  try {
    const topic = req.body.topic || req.body.targetRole || req.body.role || req.body.target || req.body.skill;
    const duration = req.body.duration || '3 months';
    if (!topic || topic.trim() === '') {
      return sendError(res, 400, 'Topic is required');
    }

    const roadmapData = await generateRoadmapAI(topic, duration);
    return sendSuccess(res, 200, 'Roadmap generated successfully', roadmapData);
  } catch (error) {
    next(error);
  }
};

// @desc    AI Chatbot Interaction
// @route   POST /api/ai/chat
// @access  Private / Public
export const chat = async (req, res, next) => {
  try {
    let messages = req.body.messages;
    if (!messages && req.body.message) {
      messages = [{ role: 'user', content: req.body.message }];
    }

    if (!messages || !Array.isArray(messages)) {
      return sendError(res, 400, 'Messages array or message string is required');
    }

    const reply = await chatWithAI(messages);
    return sendSuccess(res, 200, 'Response received', { reply });
  } catch (error) {
    next(error);
  }
};
