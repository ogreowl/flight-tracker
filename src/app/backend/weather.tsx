import { airports } from '../data';

export interface WeatherResult {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  forecastTime?: string; // ISO string of the forecasted time
}

function codeToCity(codeOrCity: string): string {
  // If it's a known airport code, return the city, else return the input as-is
  const found = airports.find(a => a.code.toLowerCase() === codeOrCity.toLowerCase());
  return found ? found.city : codeOrCity;
}

export async function getWeatherForCity(cityOrCode: string, date?: Date): Promise<WeatherResult | null> {
  const city = codeToCity(cityOrCode);
  console.log('Getting weather for:', { city, date });
  try {
    console.log('Making weather API request:', { cityOrCode, date });
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'weather',
        city: cityOrCode,
        date: date?.toISOString()
      }),
    });
    console.log('Weather API response status:', response.status);
    if (!response.ok) return null;
    const data = await response.json();
    console.log('Weather data received:', data);
    return data;
  } catch (e) {
    console.error('Weather API error:', e);
    return null;
  }
}
