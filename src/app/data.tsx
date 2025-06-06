// Types
export interface Flight {
  id: string;
  departureAirport: string;
  arrivalAirport: string;
  aircraftId: string;
  departureTime: Date;
  arrivalTime: Date;
}

export interface Aircraft {
  id: string;
  name: string;
  currentLocation: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
}

// Airport Data
export const airports: Airport[] = [
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
  { code: 'ORD', name: 'O\'Hare International', city: 'Chicago' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco' },
];

// Flight time matrix (in hours)
export const airportTimes: Record<string, Record<string, number>> = {
  'JFK': {
    'JFK': 0,
    'LAX': 6,
    'ORD': 3,
    'DFW': 4,
    'SFO': 6
  },
  'LAX': {
    'JFK': 6,
    'LAX': 0,
    'ORD': 4,
    'DFW': 3,
    'SFO': 1
  },
  'ORD': {
    'JFK': 3,
    'LAX': 4,
    'ORD': 0,
    'DFW': 2,
    'SFO': 4
  },
  'DFW': {
    'JFK': 4,
    'LAX': 3,
    'ORD': 2,
    'DFW': 0,
    'SFO': 3
  },
  'SFO': {
    'JFK': 6,
    'LAX': 1,
    'ORD': 4,
    'DFW': 3,
    'SFO': 0
  }
};

// Helper function to get flight time between airports
export const getFlightTime = (from: string, to: string): number => {
  return airportTimes[from]?.[to] ?? 0;
};

// Helper function to calculate arrival time based on departure time and airports
export const calculateArrivalTime = (departureTime: Date, from: string, to: string): Date => {
  const flightHours = getFlightTime(from, to);
  const arrivalTime = new Date(departureTime);
  arrivalTime.setHours(arrivalTime.getHours() + flightHours);
  return arrivalTime;
};

// Initial Data
const initialAircraft: Aircraft[] = [
  { id: 'A1', name: 'Plane 1', currentLocation: 'JFK' },
  { id: 'A2', name: 'Plane 2', currentLocation: 'LAX' },
  { id: 'A3', name: 'Plane 3', currentLocation: 'ORD' },
];

// Initialize flights with five default flights
const initialFlights: Flight[] = [
  {
    id: 'F1',
    departureAirport: 'JFK',
    arrivalAirport: 'LAX',
    aircraftId: 'A1',
    departureTime: new Date('2024-06-13T10:00:00'),
    arrivalTime: new Date('2024-06-13T16:00:00')
  },
  {
    id: 'F2',
    departureAirport: 'LAX',
    arrivalAirport: 'SFO',
    aircraftId: 'A2',
    departureTime: new Date('2024-06-13T14:00:00'),
    arrivalTime: new Date('2024-06-13T15:00:00')
  },
  {
    id: 'F3',
    departureAirport: 'ORD',
    arrivalAirport: 'DFW',
    aircraftId: 'A3',
    departureTime: new Date('2024-06-13T12:00:00'),
    arrivalTime: new Date('2024-06-13T14:00:00')
  },
  {
    id: 'F4',
    departureAirport: 'DFW',
    arrivalAirport: 'JFK',
    aircraftId: 'A1',
    departureTime: new Date('2024-06-13T16:00:00'),
    arrivalTime: new Date('2024-06-13T20:00:00')
  },
  {
    id: 'F5',
    departureAirport: 'SFO',
    arrivalAirport: 'ORD',
    aircraftId: 'A2',
    departureTime: new Date('2024-06-13T18:00:00'),
    arrivalTime: new Date('2024-06-13T22:00:00')
  }
];

// State Management
let flights: Flight[] = [...initialFlights];
let aircraft = [...initialAircraft];
let nextFlightId = initialFlights.length + 1;  // Start after the initial flights

// CRUD Operations
export const flightOperations = {
  // Create
  addFlight: (flight: Omit<Flight, 'id' | 'arrivalTime'>) => {
    const arrivalTime = calculateArrivalTime(
      flight.departureTime,
      flight.departureAirport,
      flight.arrivalAirport
    );
    
    const newFlight: Flight = {
      ...flight,
      id: `F${nextFlightId++}`,
      arrivalTime
    };
    flights.push(newFlight);
    return newFlight;
  },

  // Read
  getFlights: () => [...flights],
  getFlight: (id: string) => flights.find(f => f.id === id),
  getAircraft: () => [...aircraft],
  getAirports: () => [...airports],

  // Update
  updateFlight: (id: string, updates: Partial<Flight>) => {
    const index = flights.findIndex(f => f.id === id);
    if (index !== -1) {
      const updatedFlight = { ...flights[index], ...updates };
      
      // Recalculate arrival time if departure time or airports changed
      if (updates.departureTime || updates.departureAirport || updates.arrivalAirport) {
        updatedFlight.arrivalTime = calculateArrivalTime(
          updatedFlight.departureTime,
          updatedFlight.departureAirport,
          updatedFlight.arrivalAirport
        );
      }
      
      flights[index] = updatedFlight;
      return flights[index];
    }
    return null;
  },

  // Delete
  deleteFlight: (id: string) => {
    const index = flights.findIndex(f => f.id === id);
    if (index !== -1) {
      flights.splice(index, 1);
      return true;
    }
    return false;
  },

  // Update aircraft location
  updateAircraftLocation: (id: string, location: string) => {
    const aircraft = initialAircraft.find(a => a.id === id);
    if (aircraft) {
      aircraft.currentLocation = location;
    }
  },
}; 