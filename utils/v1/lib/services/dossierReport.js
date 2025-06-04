const groq = require("../config/groq");
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const caseId = `CASE-${uuidv4().split('-')[0].toUpperCase()}`;


const GROQ_MODEL = "llama3-70b-8192";  // Fastest available model with large context
// Investigation-optimized Groq configuration
const INVESTIGATION_PROFILE = {
  MODEL: "llama3-70b-8192", // Best balance of speed and depth
  TEMPERATURE: 0.1, // Near-deterministic for factual reporting
  MAX_TOKENS: 8192, // Full context window for comprehensive analysis
  TOP_P: 0.85, // Balanced creativity/focus
  FREQUENCY_PENALTY: 0.7, // Strong repetition prevention
  PRESENCE_PENALTY: 0.5, // Encourages concept diversity
  RESPONSE_FORMAT: { type: "text" } // Markdown by default
};

async function generateDossier(urlSub, outputFormat = "markdown") {
    try {
        // Read the EJS template file
        const templatePath = path.join(__dirname, '../../../../assets/templates/dossier.ejs');
        const template = fs.readFileSync(templatePath, 'utf-8');
        
        // Render the template with input data
        const prompt = ejs.render(template, { urlSub });
         const promptContext = {
            ...urlSub,
            outputFormat,
            currentDate: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            }),
            caseId,
            analysisDepth: "forensic", // Flags for the AI
            confidentiality: "LEVEL-3", 
            requiredSections: [
                "Executive Summary",
                "Chronology",
                "Entity Mapping",
                "Evidence Catalog",
                "Hypothesis Testing",
                "Actionable Intelligence"
            ]
        };
        const response = await groq.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
             model: INVESTIGATION_PROFILE.MODEL,
            temperature: INVESTIGATION_PROFILE.TEMPERATURE,
            max_tokens: INVESTIGATION_PROFILE.MAX_TOKENS,
            top_p: INVESTIGATION_PROFILE.TOP_P,
            frequency_penalty: INVESTIGATION_PROFILE.FREQUENCY_PENALTY,
            presence_penalty: INVESTIGATION_PROFILE.PRESENCE_PENALTY,
            response_format: outputFormat === "json" ? 
                { type: "json_object" } : 
        INVESTIGATION_PROFILE.RESPONSE_FORMAT
        });

        return response.choices[0]?.message?.content || "Failed to generate dossier.";
    } catch (error) {
        console.error("Error generating dossier:", error);
        throw error;
    }
}

module.exports = generateDossier;