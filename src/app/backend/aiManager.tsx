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

      let systemMessage = '';
      let result = '';

      switch (name) {
        case 'delete_flight':
          const deleted = flightOperations.deleteFlight(parsedArgs.flightId);
          if (deleted) {
            systemMessage = `Flight ${parsedArgs.flightId} has been deleted from the schedule.`;
            result = `Flight ${parsedArgs.flightId} has been successfully deleted from the schedule.`;
          } else {
            result = `Could not find flight with ID ${parsedArgs.flightId}.`;
          }
          onDataChanged?.();
          break;

        case 'add_flight':
          const newFlight = flightOperations.addFlight({
            departureAirport: parsedArgs.departureAirport,
            arrivalAirport: parsedArgs.arrivalAirport,
            aircraftId: parsedArgs.aircraftId,
            departureTime: new Date(parsedArgs.departureTime)
          });
          systemMessage = `A new flight has been added: ${newFlight.id} from ${newFlight.departureAirport} to ${newFlight.arrivalAirport}, departing at ${new Date(newFlight.departureTime).toLocaleString()}.`;
          result = `Flight added: ${newFlight.departureAirport} to ${newFlight.arrivalAirport} with aircraft ${newFlight.aircraftId} departing at ${new Date(newFlight.departureTime).toLocaleString()}`;
          onDataChanged?.();
          break;

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
          if (updated) {
            const changes = [];
            if (updates.departureAirport) changes.push(`departure airport to ${updates.departureAirport}`);
            if (updates.arrivalAirport) changes.push(`arrival airport to ${updates.arrivalAirport}`);
            if (updates.aircraftId) changes.push(`aircraft to ${updates.aircraftId}`);
            if (updates.departureTime) changes.push(`departure time to ${updates.departureTime.toLocaleString()}`);
            systemMessage = `Flight ${parsedArgs.flightId} has been updated: ${changes.join(', ')}.`;
            result = `Flight ${parsedArgs.flightId} has been updated.`;
          } else {
            result = `Could not find flight with ID ${parsedArgs.flightId}.`;
          }
          onDataChanged?.();
          break;

        case 'check_warnings':
          const warnings = getAircraftWarnings();
          result = warnings.length === 0
            ? 'There are no double-booked aircraft or flight conflicts.'
            : 'Here are the current warnings about double-booked aircraft:\n' +
              warnings.map(w => w.message).join('\n');
          break;

        case 'check_weather':
          const flight = flightOperations.getFlight(parsedArgs.flightId);
          if (!flight) {
            result = `Could not find flight with ID ${parsedArgs.flightId}.`;
            break;
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
            result = `Could not fetch weather for flight ${parsedArgs.flightId}.`;
            break;
          }

          const weather = await weatherResponse.json();
          result = `Weather for Flight ${parsedArgs.flightId} (${flight.departureAirport}):\nTemperature: ${Math.round(weather.temperature)}°C\nConditions: ${weather.description}`;
          break;

        default:
          result = 'Unknown function call received.';
      }

      // If we have a system message, add it to the chat history
      if (systemMessage) {
        chatHistory.push({ role: 'system', content: systemMessage });
      }

      return result;
    }

    return data.content;
  } catch (error) {
    console.error('Error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}