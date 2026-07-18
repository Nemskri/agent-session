//? I want to demonstrate LLM usage, so use the ai sdk i installed , I have the api key in .env as OPENAI_API_KEY. This iis just a demonstratoion, give any prompt and give code to start explaining

import 'dotenv/config';
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

async function main() {
  const prompt = 'I need to report that the login button does nothing. Please create a ticket for me.';
  console.log('Sending prompt to LLM...');
  
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt,
    tools: {
      create_ticket: tool({
        description: 'Create a support ticket for an issue',
        parameters: z.object({
          issue: z.string().describe('The description of the issue'),
        }),
        execute: async ({ issue }) => {
          console.log(`\n>> [Mock] Creating ticket in database for: "${issue}"`);

          //API Call to third party
x
          return { ticketId: '#482', status: 'open' };
        },
      }),
    },
    maxSteps: 5, // Allows the model to call the tool, get the result, and then respond
    maxOutputTokens: 1000,
    temperature: 0.1,
  });

  console.log('\nFinal Response:\n' + text);
}

main().catch(console.error);
