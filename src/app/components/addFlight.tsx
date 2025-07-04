'use client';

import { useState } from 'react';
import { flightOperations, airports } from '../data';

interface AddFlightProps {
  onClose: () => void;
  onFlightAdded: () => void;
}

export default function AddFlight({ onClose, onFlightAdded }: AddFlightProps) {
  const [formData, setFormData] = useState({
    departureAirport: '',
    arrivalAirport: '',
    aircraftId: '',
    departureTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    flightOperations.addFlight({
      departureAirport: formData.departureAirport,
      arrivalAirport: formData.arrivalAirport,
      aircraftId: formData.aircraftId,
      departureTime: new Date(formData.departureTime),
    });
    setFormData({
      departureAirport: '',
      arrivalAirport: '',
      aircraftId: '',
      departureTime: '',
    });
    onFlightAdded();
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mt-1">
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <select
              name="departureAirport"
              value={formData.departureAirport}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select airport</option>
              {airports.map(airport => (
                <option key={airport.code} value={airport.code}>
                  {airport.code} - {airport.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <select
              name="arrivalAirport"
              value={formData.arrivalAirport}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select airport</option>
              {airports
                .filter(airport => airport.code !== formData.departureAirport)
                .map(airport => (
                  <option key={airport.code} value={airport.code}>
                    {airport.code} - {airport.city}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft</label>
          <select
            name="aircraftId"
            value={formData.aircraftId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select aircraft</option>
            {flightOperations.getAircraft().map(aircraft => (
              <option key={aircraft.id} value={aircraft.id}>
                {aircraft.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
          <input
            type="datetime-local"
            name="departureTime"
            value={formData.departureTime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Add Flight
          </button>
        </div>
      </form>
    </div>
  );
}
