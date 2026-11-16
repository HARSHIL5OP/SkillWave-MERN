import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constants.js";

const PISTON_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_PISTON_API_URL) || "https://emkc.org/api/v2/piston";
const API = axios.create({
  baseURL: PISTON_URL,
});

export const executeCode = async (language, sourceCode) => {
  // Client-side execution for JavaScript with console output capturing
  if (language === "javascript" || language === "js") {
    const logs = [];
    const customConsole = {
      log: (...args) =>
        logs.push(
          args
            .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
            .join(" ")
        ),
      error: (...args) => logs.push("[Error]: " + args.join(" ")),
      warn: (...args) => logs.push("[Warning]: " + args.join(" ")),
      info: (...args) => logs.push(args.join(" ")),
    };

    try {
      const runFn = new Function("console", sourceCode);
      const result = runFn(customConsole);
      if (result !== undefined && logs.length === 0) {
        logs.push(String(result));
      }
      return {
        run: {
          output: logs.length > 0 ? logs.join("\n") : "Program executed successfully with no output.",
          stderr: "",
        },
      };
    } catch (evalErr) {
      return {
        run: {
          output: evalErr.name + ": " + evalErr.message,
          stderr: evalErr.message,
        },
      };
    }
  }

  // Piston API for multi-language execution (Python, C++, Java, etc.)
  try {
    const response = await API.post("/execute", {
      language: language,
      version: LANGUAGE_VERSIONS[language] || "*",
      files: [
        {
          content: sourceCode,
        },
      ],
    });

    if (response.data?.run) {
      return response.data;
    }

    if (response.data?.message) {
      return {
        run: {
          output: `[Piston Engine Notice]: ${response.data.message}`,
          stderr: response.data.message,
        },
      };
    }

    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || "Execution service unavailable";
    return {
      run: {
        output: `[Execution Notice]: ${errMsg}`,
        stderr: errMsg,
      },
    };
  }
};
