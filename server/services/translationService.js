const OpenAI = require('openai');
const { createBatches, formatBatchForAPI, parseAPIResponse } = require('../utils/vttParser');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language mapping for system prompts
const languageNames = {
  'de': 'German',
  'es': 'Spanish', 
  'fr': 'French',
  'ja': 'Japanese',
  'zh': 'Chinese',
  'ko': 'Korean',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'it': 'Italian'
};

/**
 * Generate system prompt for OpenAI translation
 */
function generateSystemPrompt(targetLanguage, referenceLanguage = 'Korean') {
  const targetLangName = languageNames[targetLanguage] || targetLanguage;
  
  return `You are a professional subtitle translator and localization expert, fluent in English and ${targetLangName}, and proficient in ${referenceLanguage}. Your task is to accurately translate subtitles from English into ${targetLangName}, using the ${referenceLanguage} version for context and clarification.

This translation is intended for professional use in educational or cinematic content, and must be accurate, idiomatic, and contextually faithful to both the meaning and tone of the original.

🧠 Your Objective:
Translate each subtitle line from English into ${targetLangName}, using ${referenceLanguage} only as a secondary reference to clarify nuance, tone, or intention when needed.

📜 Input Format:
You will receive subtitles in WebVTT (.vtt) format, like this:

WEBVTT

1
00:00:05.885 --> 00:00:06.965
You could say that
이렇게 말할 수 있겠네요

2
00:00:07.485 --> 00:00:10.885
I grew up in a working-class family
저는 노동자 계층에서 자랐어요

Each block contains:
- The word WEBVTT (on top, once)
- A line number
- A timestamp in the format 00:00:00.000 --> 00:00:00.000 (with dots, not commas)
- An English subtitle line
- A corresponding ${referenceLanguage} subtitle line directly below it (same timing)

🛠️ Translation Instructions:
For each subtitle block:
- Read the English line to understand its primary meaning.
- Consult the ${referenceLanguage} line only to resolve any ambiguity or better understand tone, context, emotion, or cultural reference.
- Translate the English subtitle into ${targetLangName}, naturally and professionally.
- Keep everything else exactly the same — timestamps, numbering, spacing, and formatting.

✅ Output Requirements:
- Return only the translated ${targetLangName} subtitles in the original WebVTT format.
- Preserve:
  - Line numbers
  - Timestamps
  - The WEBVTT header
  - Line spacing and structure
- Replace only the subtitle text line with your ${targetLangName} translation.
- Do not merge or split subtitle lines, even if it feels more natural — match the original 1:1.

🧾 Example Output (${targetLangName}):

WEBVTT

1
00:00:05.885 --> 00:00:06.965
[Your ${targetLangName} translation here]

2
00:00:07.485 --> 00:00:10.885
[Your ${targetLangName} translation here]

🧩 Final Notes:
- Do not translate the WEBVTT header.
- Do not remove or alter timecodes.
- Return the output as a single, clean .vtt-structured block.
- No extra explanations, just the translated .vtt subtitles.`;
}

/**
 * Translate a single batch of subtitles
 */
async function translateBatch(batch, targetLanguage, retries = 2) {
  const systemPrompt = generateSystemPrompt(targetLanguage);
  const batchContent = formatBatchForAPI(batch);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user', 
            content: batchContent
          }
        ],
        temperature: 0.4,
        max_tokens: 4000
      });

      const translatedContent = response.choices[0].message.content;
      const translatedBlocks = parseAPIResponse(translatedContent, batch);
      
      // Validate translation
      if (translatedBlocks.length !== batch.length) {
        throw new Error(`Translation mismatch: expected ${batch.length} blocks, got ${translatedBlocks.length}`);
      }
      
      return translatedBlocks;
      
    } catch (error) {
      console.error(`Translation attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Failed to translate batch after ${retries + 1} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

/**
 * Translate all subtitle blocks with progress callback
 */
async function translateSubtitles(subtitleBlocks, targetLanguage, progressCallback) {
  const batches = createBatches(subtitleBlocks, 20);
  const translatedBlocks = [];
  
  console.log(`Starting translation: ${subtitleBlocks.length} subtitles in ${batches.length} batches`);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    console.log(`Translating batch ${i + 1}/${batches.length} (${batch.length} subtitles)`);
    
    try {
      const translatedBatch = await translateBatch(batch, targetLanguage);
      translatedBlocks.push(...translatedBatch);
      
      // Report progress
      const progress = Math.round(((i + 1) / batches.length) * 100);
      progressCallback?.(progress);
      
      console.log(`Batch ${i + 1} completed. Progress: ${progress}%`);
      
      // Rate limiting delay
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`Failed to translate batch ${i + 1}:`, error.message);
      throw error;
    }
  }
  
  console.log(`Translation completed: ${translatedBlocks.length} subtitles translated`);
  return translatedBlocks;
}

module.exports = {
  translateSubtitles,
  translateBatch,
  generateSystemPrompt
};