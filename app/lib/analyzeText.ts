import axios from 'axios';
import { BookMetadata, AnalysisResult } from '../common/types';

const SAMBANOVA_API_URL = 'https://api.sambanova.ai/v1/chat/completions';
const API_KEY = process.env.SAMBANOVA_API_KEY || '';
const MODEL = 'Llama-4-Maverick-17B-128E-Instruct';

export async function analyzeText(text: string, metadata: BookMetadata): Promise<AnalysisResult> {
  try {
    const prompt = getPrompt(metadata, text);

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
    console.log(resultText.toString());

    try {
      // Extract JSON from the response (in case there's any text around it)
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : resultText;
      const parsedData = JSON.parse(jsonString) as AnalysisResult;

      // Add raw output for debugging
      parsedData.rawOutput = resultText;

      // Ensure all characters have IDs
      parsedData.characters = parsedData.characters.map(character => ({
        ...character,
        id: character.id || character.name.replace(/\s+/g, '')
      }));

      // Ensure relationships use proper IDs
      const characterIdMap = new Map<string, string>();
      parsedData.characters.forEach(character => {
        characterIdMap.set(character.name, character.id);
      });

      parsedData.relationships = parsedData.relationships.map(relationship => {
        // Check if source/target are names rather than IDs
        const sourceId = characterIdMap.get(relationship.source) || relationship.source;
        const targetId = characterIdMap.get(relationship.target) || relationship.target;

        return {
          ...relationship,
          id: relationship.id || `rel_${sourceId}_${targetId}`,
          source: sourceId,
          target: targetId
        };
      });

      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      throw new Error("Failed to parse LLM response as JSON");
    }
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw new Error('Failed to analyze book text');
  }
}

function getPrompt(metadata: BookMetadata, text: string): string {
  return `Analyze the following book and respond with a JSON object structured EXACTLY as follows. Do not include any explanatory text outside the JSON structure:

{
  "summary": "A concise 3-5 paragraph summary of the book's plot, main events, and resolution",
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
Book text: ${text.substring(0, 50000)}...`;
}