import axios from 'axios';
import { BookMetadata, AnalysisResult, Character, Relationship } from '../common/types';

const SAMBANOVA_API_URL = 'https://api.sambanova.ai/v1/chat/completions';
const API_KEY = process.env.SAMBANOVA_API_KEY || '';
const MODEL = 'Llama-4-Maverick-17B-128E-Instruct';
const MAX_TEXT_LENGTH = 25000;

export async function analyzeText(text: string, metadata: BookMetadata): Promise<AnalysisResult> {
  try {
    const prompt = getPrompt(text, metadata);

    const response = await axios.post(
      SAMBANOVA_API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a literary analysis expert who provides responses in well-structured JSON format.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const resultText = response.data.choices[0].message.content;
    let rawParsedData: any;

    //Make sure the response is valid JSON
    try {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : resultText;
      rawParsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse LLM JSON response:", parseError, "Raw response:", resultText);
      throw new Error("Failed to interpret the analysis from the AI. The response was not valid JSON.");
    }

    return sanitizeAnalysisResult(rawParsedData);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error calling Sambanova API:', error.response?.data || error.message);
      throw new Error(`Failed to analyze book text due to an API error: ${error.message}`);
    }
    console.error('Unexpected error analyzing text:', error);
    throw new Error('An unexpected error occurred while analyzing the book text.');
  }
}

//#region Prompt
function getPrompt(text: string, metadata: BookMetadata): string {
  return `Analyze the following book and respond with a JSON object structured EXACTLY as follows. Do not include any explanatory text outside the JSON structure:

{
  "summary": "A concise 2-5 paragraph summary of the book's plot, main events, and resolution",
  "analysis": {
    "themes": ["Theme 1", "Theme 2", "Theme 3"],
    "setting": "Brief description of the primary setting",
    "timeframe": "Historical period or timeframe of the story"
  },
  "characters": [
    {
      "id": "unique_id_based_on_name",
      "name": "Character Full Name",
      "description": "A brief 1-2 sentence description of the character",
      "role": "Protagonist/Antagonist/Supporting",
      "traits": ["trait1", "trait2", "trait3"]
    }
  ],
  "relationships": [
    {
      "id": "rel_source_target",
      "source": "character1_id",
      "target": "character2_id",
      "type": "family|friend|romance|rival|ally",
      "description": "Brief description of their relationship dynamic",
      "significance": 8
    }
  ]
}

Important requirements:
1. Consider the book's metadata (author, publication date, subjects) when analyzing themes and context
2. Provide a comprehensive but concise summary that captures the main plot arc
3. Include ONLY the main and important supporting characters (5-15 characters total)
4. For each character, create at least 1-3 relationships with other characters
5. Ensure all character IDs used in relationships exist in the characters array
6. Use ONLY the relationship types specified: "family", "friend", "romance", "rival", or "ally"
7. Assign significance values (0-10) based on how important the relationship is to the plot
8. Ensure the JSON is valid and properly formatted

Book metadata: ${JSON.stringify(metadata)}
Book text: ${text.substring(0, MAX_TEXT_LENGTH)}...`;
}
//#endregion

//#region Helpers
// Internal helper to sanitize and structure the LLM response
function sanitizeAnalysisResult(parsedData: any): AnalysisResult {
  // Ensure characters array exists and elements have IDs
  const characters: Character[] = (parsedData.characters || []).map((character: any) => ({
    ...character,
    id: character.id || (character.name ? character.name.replace(/\s+/g, '') : `char_${Math.random().toString(36).substr(2, 9)}`),
    traits: character.traits || [], // Ensure traits is always an array
    description: character.description || "",
    role: character.role || "Unknown"
  }));

  const characterIdMap = new Map<string, string>();
  characters.forEach(character => {
    if (character.name) characterIdMap.set(character.name, character.id);
  });

  // Ensure relationships array exists and uses proper IDs
  const relationships: Relationship[] = (parsedData.relationships || []).map((relationship: any) => {
    const sourceId = characterIdMap.get(relationship.source) || relationship.source;
    const targetId = characterIdMap.get(relationship.target) || relationship.target;
    return {
      ...relationship,
      id: relationship.id || `rel_${sourceId}_${targetId}`,
      source: sourceId,
      target: targetId,
      type: relationship.type || "ally", // Provide a default type if missing
      description: relationship.description || "",
      significance: relationship.significance || 0
    };
  });

  return {
    summary: parsedData.summary || "",
    analysis: {
      themes: parsedData.analysis?.themes || [],
      setting: parsedData.analysis?.setting || "",
      timeframe: parsedData.analysis?.timeframe || ""
    },
    characters,
    relationships
  };
}
//#endregion