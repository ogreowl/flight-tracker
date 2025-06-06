import { flightOperations } from '../data';

export interface AircraftWarning {
  aircraftId: string;
  flightId1: string;
  flightId2: string;
  message: string;
}

export interface SameAirportWarning {
  flightId: string;
  message: string;
}

export function getAircraftWarnings(): (AircraftWarning | SameAirportWarning)[] {
  const flights = flightOperations.getFlights();
  const warnings: (AircraftWarning | SameAirportWarning)[] = [];

  // Check for double-booked aircraft
  for (let i = 0; i < flights.length; i++) {
    for (let j = i + 1; j < flights.length; j++) {
      const flight1 = flights[i];
      const flight2 = flights[j];
      if (flight1.aircraftId === flight2.aircraftId) {
        const overlap = (
          (flight1.departureTime <= flight2.arrivalTime && flight1.arrivalTime >= flight2.departureTime) ||
          (flight2.departureTime <= flight1.arrivalTime && flight2.arrivalTime >= flight1.departureTime)
        );
        if (overlap) {
          warnings.push({
            aircraftId: flight1.aircraftId,
            flightId1: flight1.id,
            flightId2: flight2.id,
            message: `Aircraft ${flight1.aircraftId} is double-booked for flights ${flight1.id} and ${flight2.id}`
          });
        }
      }
    }
  }

  // Check for flights that depart and arrive at the same airport
  for (const flight of flights) {
    if (flight.departureAirport === flight.arrivalAirport) {
      warnings.push({
        flightId: flight.id,
        message: `Flight ${flight.id} departs and arrives at the same airport (${flight.departureAirport})`
      });
    }
  }

  return warnings;
}
