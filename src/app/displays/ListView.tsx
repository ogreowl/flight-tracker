'use client';

import { useState } from 'react';
import { flightOperations } from '../data';
import type { Flight, Aircraft } from '../data';

interface ListViewProps {
  flights: Flight[];
  onAddFlightClick: () => void;
  onFlightDeleted: () => void;
  onEditFlight: (flight: Flight) => void;
  onShowWarnings: () => void;
  onCheckWeather: (departure: string, arrival: string, departureTime: Date, arrivalTime: Date) => void;
}

export default function ListView({ flights, onAddFlightClick, onFlightDeleted, onEditFlight, onShowWarnings, onCheckWeather }: ListViewProps) {
  const [aircraft] = useState<Aircraft[]>(flightOperations.getAircraft());

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAircraftName = (aircraftId: string) => {
    return aircraft.find(a => a.id === aircraftId)?.name || 'Unknown';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Flight Schedule</h2>
        <div className="flex gap-2">
          <button
            onClick={onAddFlightClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Flight
          </button>
          <button
            onClick={onShowWarnings}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Check for Warnings
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Flight ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aircraft
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Arrival
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flights.map((flight) => (
              <tr key={flight.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {flight.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {flight.departureAirport}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {flight.arrivalAirport}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getAircraftName(flight.aircraftId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(flight.departureTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(flight.arrivalTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditFlight(flight)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        flightOperations.deleteFlight(flight.id);
                        onFlightDeleted();
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onCheckWeather(flight.departureAirport, flight.arrivalAirport, new Date(flight.departureTime), new Date(flight.arrivalTime))}
                      className="text-green-600 hover:text-green-900"
                    >
                      Forecast
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}