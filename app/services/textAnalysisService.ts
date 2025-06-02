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
    let rawParsedData: RawAnalysisData;

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

// Define interfaces for the expected raw structure from the LLM
interface RawCharacter {
  id?: string;
  name?: string;
  description?: string;
  role?: string;
  traits?: string[];
  // Add other fields if expected from LLM, even if optional
}

interface RawRelationship {
  id?: string;
  source?: string; // Initially, this might be a name
  target?: string; // Initially, this might be a name
  type?: string;
  description?: string;
  significance?: number;
  // Add other fields if expected from LLM, even if optional
}

interface RawAnalysisData {
  summary?: string;
  analysis?: {
    themes?: string[];
    setting?: string;
    timeframe?: string;
  };
  characters?: RawCharacter[];
  relationships?: RawRelationship[];
}

// Internal helper to sanitize and structure the LLM response
function sanitizeAnalysisResult(parsedData: RawAnalysisData): AnalysisResult {
  // Ensure characters array exists and elements have IDs
  const characters: Character[] = (parsedData.characters || []).map((character: RawCharacter): Character => ({
    id: character.id || (character.name ? character.name.replace(/\s+/g, '') : `char_${Math.random().toString(36).substr(2, 9)}`),
    name: character.name || "Unknown Character",
    description: character.description || "",
    role: character.role || "Unknown",
    traits: character.traits || [],
  }));

  const characterIdMap = new Map<string, string>();
  characters.forEach(character => {
    if (character.name) characterIdMap.set(character.name, character.id);
  });

  // Ensure relationships array exists and uses proper IDs
  const relationships: Relationship[] = (parsedData.relationships || []).map((relationship: RawRelationship): Relationship => {
    // Attempt to map names to IDs if raw source/target are names
    // If already an ID (or mapping fails), use the original value
    const rawSource = relationship.source || "";
    const rawTarget = relationship.target || "";

    const sourceId = characterIdMap.get(rawSource) || rawSource;
    const targetId = characterIdMap.get(rawTarget) || rawTarget;

    // Ensure the relationship type is one of the allowed values
    let finalType: Relationship['type'] = "ally"; // Default to 'ally'
    const allowedTypes: Relationship['type'][] = ["family", "friend", "romance", "rival", "ally"];
    if (relationship.type && allowedTypes.includes(relationship.type as Relationship['type'])) {
      finalType = relationship.type as Relationship['type'];
    }

    return {
      id: relationship.id || `rel_${sourceId}_${targetId}_${Math.random().toString(36).substr(2, 5)}`,
      source: sourceId,
      target: targetId,
      type: finalType, // Use the sanitized type
      description: relationship.description || "",
      significance: typeof relationship.significance === 'number' ? Math.max(0, Math.min(10, relationship.significance)) : 0,
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