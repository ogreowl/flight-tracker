import { flightOperations } from '../data';
import { getAircraftWarnings } from './collectWarnings';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function askAI(message: string, chatHistory: ChatMessage[] = [], onDataChanged?: () => void) {
  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        chatHistory,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    console.log('AI Response:', data);
    
    // Handle function calls
    if (data.type === 'function_call') {
      console.log('Handling function call:', data.function);
      const { name, arguments: args } = data.function;
      const parsedArgs = JSON.parse(args);
      console.log('Parsed arguments:', parsedArgs);

      switch (name) {
        case 'delete_flight':
          const deleted = flightOperations.deleteFlight(parsedArgs.flightId);
          onDataChanged?.();
          return deleted 
            ? `Flight ${parsedArgs.flightId} has been successfully deleted from the schedule.`
            : `Could not find flight with ID ${parsedArgs.flightId}.`;

        case 'add_flight':
          const newFlight = flightOperations.addFlight({
            departureAirport: parsedArgs.departureAirport,
            arrivalAirport: parsedArgs.arrivalAirport,
            aircraftId: parsedArgs.aircraftId,
            departureTime: new Date(parsedArgs.departureTime)
          });
          onDataChanged?.();
          return `Flight added: ${newFlight.departureAirport} to ${newFlight.arrivalAirport} with aircraft ${newFlight.aircraftId} departing at ${new Date(newFlight.departureTime).toLocaleString()}`;

        case 'edit_flight':
          console.log('Edit Flight - Raw args:', parsedArgs);
          const updates: Partial<{
            departureTime: Date;
            departureAirport: string;
            arrivalAirport: string;
            aircraftId: string;
          }> = {};
          if (parsedArgs.departureTime) {
            updates.departureTime = new Date(parsedArgs.departureTime);
          }
          if (parsedArgs.departureAirport) {
            updates.departureAirport = parsedArgs.departureAirport;
          }
          if (parsedArgs.arrivalAirport) {
            updates.arrivalAirport = parsedArgs.arrivalAirport;
          }
          if (parsedArgs.aircraftId) {
            updates.aircraftId = parsedArgs.aircraftId;
          }
          
          console.log('Edit Flight - Updates:', updates);
          const updated = flightOperations.updateFlight(parsedArgs.flightId, updates);
          console.log('Edit Flight - Updated flight:', updated);
          onDataChanged?.();
          return updated 
            ? `Flight ${parsedArgs.flightId} has been updated.`
            : `Could not find flight with ID ${parsedArgs.flightId}.`;

        case 'check_warnings':
          const warnings = getAircraftWarnings();
          return warnings.length === 0
            ? 'There are no double-booked aircraft or flight conflicts.'
            : 'Here are the current warnings about double-booked aircraft:\n' +
              warnings.map(w => w.message).join('\n');

        case 'check_weather':
          const flight = flightOperations.getFlight(parsedArgs.flightId);
          if (!flight) {
            return `Could not find flight with ID ${parsedArgs.flightId}.`;
          }
          
          // Make a weather request for the departure city
          const weatherResponse = await fetch('/api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'weather',
              city: flight.departureAirport,
              date: flight.departureTime
            }),
          });

          if (!weatherResponse.ok) {
            return `Could not fetch weather for flight ${parsedArgs.flightId}.`;
          }

          const weather = await weatherResponse.json();
          return `Weather for Flight ${parsedArgs.flightId} (${flight.departureAirport}):\nTemperature: ${Math.round(weather.temperature)}°C\nConditions: ${weather.description}`;

        default:
          return 'Unknown function call received.';
      }
    }

    return data.content;
  } catch (error) {
    console.error('Error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}