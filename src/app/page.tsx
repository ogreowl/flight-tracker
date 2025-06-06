'use client';

import { useState, useEffect } from 'react';
import ListView from './displays/ListView';
import AddFlight from './components/addFlight';
import EditFlight from './components/editFlight';
import { ShowWarnings } from './components/showWarnings';
import WeatherForecast from './components/weatherForecast';
import ChatInterface from './components/chatInterface';
import { getAircraftWarnings } from './backend/collectWarnings';
import { flightOperations } from './data';
import type { Flight } from './data';

export default function Home() {
  const [showAddFlight, setShowAddFlight] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showWarnings, setShowWarnings] = useState(false);
  const [weatherPanel, setWeatherPanel] = useState<{
    departure: string;
    arrival: string;
    departureTime: Date;
    arrivalTime: Date;
  } | null>(null);
  const [flights, setFlights] = useState<Flight[]>(flightOperations.getFlights());

  // Callback to refresh flights after adding
  const handleFlightAdded = () => {
    setFlights(flightOperations.getFlights());
    setShowAddFlight(false);
  };

  // Callback to refresh flights after deleting
  const handleFlightDeleted = () => {
    setFlights(flightOperations.getFlights());
  };

  // Callback to refresh flights after editing
  const handleFlightUpdated = () => {
    setFlights(flightOperations.getFlights());
    setSelectedFlight(null);
  };

  // Show warnings handler
  const handleShowWarnings = () => {
    setShowAddFlight(false);
    setSelectedFlight(null);
    setWeatherPanel(null);
    setShowWarnings(true);
  };

  // Hide warnings handler
  const handleCloseWarnings = () => {
    setShowWarnings(false);
  };

  // Show weather panel handler
  const handleCheckWeather = (departure: string, arrival: string, departureTime: Date, arrivalTime: Date) => {
    setShowAddFlight(false);
    setSelectedFlight(null);
    setShowWarnings(false);
    setWeatherPanel({ departure, arrival, departureTime, arrivalTime });
  };

  // Hide weather panel handler
  const handleCloseWeather = () => {
    setWeatherPanel(null);
  };

  // Add this callback for AI-triggered data changes
  const handleAIDataChanged = () => {
    setFlights(flightOperations.getFlights());
  };

  // Listen for flightDeleted event to refresh flights
  useEffect(() => {
    const handleFlightDeletedEvent = () => {
      handleFlightDeleted();
    };
    window.addEventListener('flightDeleted', handleFlightDeletedEvent);
    return () => {
      window.removeEventListener('flightDeleted', handleFlightDeletedEvent);
    };
  }, []);

  return (
    <main className="flex h-screen">
      {/* Left side - 66% width */}
      <div className="w-2/3 border-r border-gray-200">
        <ListView
          flights={flights}
          onAddFlightClick={() => {
            setShowAddFlight(true);
            setSelectedFlight(null);
            setShowWarnings(false);
            setWeatherPanel(null);
          }}
          onFlightDeleted={handleFlightDeleted}
          onEditFlight={(flight) => {
            setSelectedFlight(flight);
            setShowAddFlight(false);
            setShowWarnings(false);
            setWeatherPanel(null);
          }}
          onShowWarnings={handleShowWarnings}
          onCheckWeather={handleCheckWeather}
        />
      </div>
      
      {/* Right side - 33% width */}
      <div className="w-1/3">
        {/* Upper half - Interactive controls and forms */}
        <div className="h-11/20 border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold mb-4">Flight Controls</h2>
          {showAddFlight && !selectedFlight && !showWarnings && !weatherPanel && (
            <AddFlight
              onClose={() => setShowAddFlight(false)}
              onFlightAdded={handleFlightAdded}
            />
          )}
          {selectedFlight && !showAddFlight && !showWarnings && !weatherPanel && (
            <EditFlight
              flight={selectedFlight}
              onClose={() => setSelectedFlight(null)}
              onFlightUpdated={handleFlightUpdated}
            />
          )}
          {showWarnings && !showAddFlight && !selectedFlight && !weatherPanel && (
            <ShowWarnings
              warnings={getAircraftWarnings()}
              onClose={handleCloseWarnings}
            />
          )}
          {weatherPanel && !showAddFlight && !selectedFlight && !showWarnings && (
            <WeatherForecast
              departureCity={weatherPanel.departure}
              arrivalCity={weatherPanel.arrival}
              departureTime={weatherPanel.departureTime}
              arrivalTime={weatherPanel.arrivalTime}
              onClose={handleCloseWeather}
            />
          )}
        </div>
        
        {/* Lower half - AI chatbot interface */}
        <div className="h-9/20 p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
          <div className="flex-1 min-h-0">
            <ChatInterface onDataChanged={handleAIDataChanged} />
          </div>
        </div>
      </div>
    </main>
  );
}
