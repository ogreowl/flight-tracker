import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { flightOperations } from '../data';
import { getAircraftWarnings } from '../backend/collectWarnings';
import { airports } from '../data';
import https from 'https';

// Log the API key to verify it's loaded
console.log('Weather API Key from env:', process.env.WEATHER_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store the weather API key
const weatherApiKey = process.env.WEATHER_API_KEY;
if (!weatherApiKey) {
  console.error('WEATHER_API_KEY is not set in environment variables');
}

// Helper functions for weather
function codeToCity(codeOrCity: string): string {
  const found = airports.find(a => a.code.toLowerCase() === codeOrCity.toLowerCase());
  return found ? found.city : codeOrCity;
}

function findClosestForecast(list: any[], targetDate: Date) {
  let minDiff = Infinity;
  let closest = null;
  for (const entry of list) {
    const entryDate = new Date(entry.dt * 1000);
    const diff = Math.abs(entryDate.getTime() - targetDate.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closest = entry;
    }
  }
  return closest;
}

function makeWeatherRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function getWeatherForCity(cityOrCode: string, date?: Date) {
  const city = codeToCity(cityOrCode);
  try {
    if (date) {
      // Use forecast endpoint
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${weatherApiKey}&units=metric`;
      console.log('Making request to:', url);
      const data = await makeWeatherRequest(url);
      console.log('Received data:', data);
      if (!data.list) {
        console.error('No list in response:', data);
        return null;
      }
      const closest = findClosestForecast(data.list, date);
      if (!closest) return null;
      return {
        city: data.city.name,
        temperature: closest.main.temp,
        description: closest.weather[0].description,
        icon: closest.weather[0].icon,
        forecastTime: new Date(closest.dt * 1000).toISOString(),
      };
    } else {
      // Use current weather endpoint
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${weatherApiKey}&units=metric`;
      const data = await makeWeatherRequest(url);
      return {
        city: data.name,
        temperature: data.main.temp,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      };
    }
  } catch (e) {
    console.error('Weather API Error:', e);
    return null;
  }
}

const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'check_warnings',
      description: 'Check for double-booked aircraft (same plane, overlapping times) in the current flight schedule.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_flight',
      description: 'Add a new flight to the schedule.',
      parameters: {
        type: 'object',
        properties: {
          departureAirport: { type: 'string', description: 'Departure airport code (e.g., JFK)' },
          arrivalAirport: { type: 'string', description: 'Arrival airport code (e.g., SFO)' },
          aircraftId: { type: 'string', description: 'Aircraft ID (e.g., A1, A2, A3)' },
          departureTime: { type: 'string', description: 'Departure time as ISO string' }
        },
        required: ['departureAirport', 'arrivalAirport', 'aircraftId', 'departureTime']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'edit_flight',
      description: 'Edit an existing flight. Provide the flightId and any fields to update.',
      parameters: {
        type: 'object',
        properties: {
          flightId: { type: 'string', description: 'ID of the flight to edit' },
          departureAirport: { type: 'string', description: 'New departure airport code (optional)' },
          arrivalAirport: { type: 'string', description: 'New arrival airport code (optional)' },
          aircraftId: { type: 'string', description: 'New aircraft ID (optional)' },
          departureTime: { type: 'string', description: 'New departure time as ISO string (optional)' }
        },
        required: ['flightId']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'delete_flight',
      description: 'Delete a flight from the schedule. Provide the flightId.',
      parameters: {
        type: 'object',
        properties: {
          flightId: { type: 'string', description: 'ID of the flight to delete' }
        },
        required: ['flightId']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'check_weather',
      description: 'Check the weather forecast for a flight. Provide the flightId.',
      parameters: {
        type: 'object',
        properties: {
          flightId: { type: 'string', description: 'ID of the flight to check weather for' }
        },
        required: ['flightId']
      }
    }
  }
];

export async function POST(request: Request) {
  try {
    const { message, chatHistory, type, city, date } = await request.json();

    // Handle weather requests
    if (type === 'weather') {
      const weather = await getWeatherForCity(city, date ? new Date(date) : undefined);
      if (!weather) {
        return NextResponse.json(
          { error: 'Failed to fetch weather data' },
          { status: 404 }
        );
      }
      return NextResponse.json(weather);
    }

    // Handle chat requests
    const flights = flightOperations.getFlights();
    const flightSummary = flights.length === 0
      ? 'There are currently no scheduled flights.'
      : flights.map(f => `Flight ${f.id}: ${f.departureAirport} to ${f.arrivalAirport}, Aircraft ${f.aircraftId}, Departs ${new Date(f.departureTime).toLocaleString()}, Arrives ${new Date(f.arrivalTime).toLocaleString()}`).join('\n');

    const now = new Date();
    const systemPrompt = `Today is ${now.toLocaleString()}\nYou are an AI assistant for a flight management app. Here is the current flight schedule:\n${flightSummary}\nYou can answer user questions about the schedule. You can also use the available tools to check for warnings, add a flight, edit a flight, delete a flight, or check the weather forecast for a flight. Be VERY concise. Don't use any fancy formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...(chatHistory || []),
        { role: 'user', content: message }
      ],
      tools
    });

    const choice = completion.choices[0];
    const toolCalls = choice.message.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      // Only handle one tool call at a time for simplicity
      const tool = toolCalls[0];
      console.log('API Route - Tool call:', tool);
      console.log('API Route - Function arguments:', tool.function.arguments);
      
      // Return the function call details for the client to execute
      return NextResponse.json({ 
        type: 'function_call',
        function: {
          name: tool.function.name,
          arguments: tool.function.arguments
        }
      });
    }

    return NextResponse.json({ 
      type: 'message',
      content: choice.message.content || 'No response from AI.' 
    });
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
