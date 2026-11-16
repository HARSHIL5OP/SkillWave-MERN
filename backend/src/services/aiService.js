import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1:free';
const API_KEY = process.env.OPENROUTER_API_KEY || '';

export const callOpenRouter = async (messages, model = DEFAULT_MODEL, temperature = 0.7) => {
  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://skillwave.edu',
        'X-Title': 'SkillWave LMS',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    console.error('[AIService] OpenRouter call failed:', err.message);
    throw err;
  }
};

export const summarizeContent = async ({ topic, mode = 'explanation', language = 'English', focus = 'both' }) => {
  let promptInstruction = '';
  if (mode === 'summary') {
    promptInstruction = `Provide a concise, high-level summary of "${topic}". Highlight core concepts and architecture in a clean, easily digestible overview.`;
  } else if (mode === 'keypoints') {
    promptInstruction = `Provide the essential key points and takeaways for "${topic}". Use structured bullet points and emphasize critical best practices.`;
  } else {
    promptInstruction = `Provide a comprehensive, in-depth explanation of "${topic}". Cover fundamental principles, real-world examples, component workflows, and common pitfalls.`;
  }

  if (focus === 'code') {
    promptInstruction += ` Focus heavily on practical code examples, syntax, implementation patterns, and code structure.`;
  } else if (focus === 'theory') {
    promptInstruction += ` Focus on core theory, algorithms, concepts, and conceptual definitions without heavy code snippets.`;
  }

  promptInstruction += ` Respond exclusively in ${language}. Ensure proper Markdown formatting with headings and lists.`;

  try {
    const content = await callOpenRouter([
      {
        role: 'system',
        content: 'You are an expert computer science educator and tech mentor on the SkillWave learning platform.',
      },
      { role: 'user', content: promptInstruction },
    ]);
    return content;
  } catch (err) {
    // Intelligent fallback in case API limit reached
    return `### ${topic} (${mode.toUpperCase()})\n\n**Overview**:\n${topic} is a vital concept in modern software engineering. This section outlines key principles, best practices, and practical implementation patterns.\n\n- **Core Foundation**: Understand the architectural fundamentals of ${topic}.\n- **Implementation**: Follow modular design and clean coding principles.\n- **Scalability**: Design for maintainability, security, and performance.`;
  }
};

export const generateRoadmapAI = async (topic, duration = '4 weeks') => {
  const prompt = `Create a structured learning roadmap for "${topic}" spanning ${duration}.
Return a VALID JSON object (and nothing else) matching this exact schema:
{
  "title": "${topic} Roadmap",
  "topic": "${topic}",
  "duration": "${duration}",
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase 1: Foundations",
      "duration": "Week 1",
      "description": "Core concepts and environment setup",
      "steps": [
        {
          "id": "p1-s1",
          "title": "Introduction & Setup",
          "description": "Learn the basics and set up your workspace",
          "resources": ["Official Documentation", "SkillWave Video Guide"],
          "estimatedHours": 6
        }
      ]
    }
  ]
}
Include between 3 to 5 realistic phases with 2 to 4 detailed steps each. Output ONLY valid raw JSON without markdown code fences.`;

  try {
    const raw = await callOpenRouter([
      {
        role: 'system',
        content: 'You are an expert curriculum designer. You output only strict JSON format without markdown wraps.',
      },
      { role: 'user', content: prompt },
    ]);

    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('[AIService] Roadmap generation parsing fallback triggered');
    return {
      title: `${topic} Complete Mastery Roadmap`,
      topic,
      duration,
      phases: [
        {
          id: 'phase-1',
          title: 'Phase 1: Fundamentals & Environment',
          duration: 'Week 1',
          description: `Master core terminology, environment setup, and fundamental concepts of ${topic}.`,
          steps: [
            {
              id: 'p1-s1',
              title: 'Getting Started & Environment Setup',
              description: 'Install required tooling, configure local workspace and runtime dependencies.',
              resources: ['Official Documentation', 'SkillWave Starter Tutorial'],
              estimatedHours: 5,
            },
            {
              id: 'p1-s2',
              title: 'Core Principles & Syntax',
              description: 'Learn foundational syntax, data models, and core execution flow.',
              resources: ['Interactive Coding Labs', 'SkillWave Cheatsheet'],
              estimatedHours: 8,
            },
          ],
        },
        {
          id: 'phase-2',
          title: 'Phase 2: Intermediate Implementation & Projects',
          duration: 'Week 2-3',
          description: `Build real-world components, master design patterns, and integrate APIs for ${topic}.`,
          steps: [
            {
              id: 'p2-s1',
              title: 'Building Real-World Modules',
              description: 'Implement reusable modules, state management, and edge-case handling.',
              resources: ['SkillWave Challenges', 'GitHub Example Repos'],
              estimatedHours: 10,
            },
            {
              id: 'p2-s2',
              title: 'API Integration & Data Flow',
              description: 'Connect to external endpoints, handle async operations, and validate inputs.',
              resources: ['REST API Guides', 'Testing Walkthrough'],
              estimatedHours: 8,
            },
          ],
        },
        {
          id: 'phase-3',
          title: 'Phase 3: Production, Optimization & Capstone',
          duration: 'Week 4',
          description: `Performance optimization, security best practices, and capstone deployment for ${topic}.`,
          steps: [
            {
              id: 'p3-s1',
              title: 'Performance & Security Best Practices',
              description: 'Audit for vulnerabilities, memory efficiency, and response optimization.',
              resources: ['Security Standards Guide', 'Lighthouse Audit'],
              estimatedHours: 6,
            },
            {
              id: 'p3-s2',
              title: 'Capstone Project Delivery',
              description: 'Publish and present a complete, tested application portfolio piece.',
              resources: ['SkillWave Final Submission Checklist'],
              estimatedHours: 12,
            },
          ],
        },
      ],
    };
  }
};

export const chatWithAI = async (messages) => {
  const formatted = [
    {
      role: 'system',
      content:
        'You are WaveBot, the helpful and knowledgeable AI learning assistant for the SkillWave educational platform. You assist learners and teachers with web development, data science, coding challenges, and study strategies.',
    },
    ...messages.map((m) => ({
      role: m.sender === 'user' || m.role === 'user' ? 'user' : 'assistant',
      content: m.text || m.content || '',
    })),
  ];

  try {
    const reply = await callOpenRouter(formatted, DEFAULT_MODEL, 0.7);
    return reply;
  } catch (err) {
    return "I am currently experiencing higher than usual traffic, but I'm here to help! You can explore video courses, coding challenges, or use the AI Summarizer and Roadmap generator on SkillWave.";
  }
};
