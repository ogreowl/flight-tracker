import { useEffect, useState } from 'react';
import { getWeatherForCity, WeatherResult } from '../backend/weather';

interface WeatherForecastProps {
  departureCity: string;
  arrivalCity: string;
  departureTime: Date;
  arrivalTime: Date;
  onClose: () => void;
}

export default function WeatherForecast({ departureCity, arrivalCity, departureTime, arrivalTime, onClose }: WeatherForecastProps) {
  const [departureWeather, setDepartureWeather] = useState<WeatherResult | null>(null);
  const [arrivalWeather, setArrivalWeather] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getWeatherForCity(departureCity, departureTime),
      getWeatherForCity(arrivalCity, arrivalTime)
    ]).then(([dep, arr]) => {
      setDepartureWeather(dep);
      setArrivalWeather(arr);
      setLoading(false);
    }).catch(() => {
      setError('Failed to fetch weather data.');
      setLoading(false);
    });
  }, [departureCity, arrivalCity, departureTime, arrivalTime]);

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mt-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Weather Forecast</h3>
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
      {loading ? (
        <div>Loading weather...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Departure: {departureCity}</h4>
            {departureWeather ? (
              <div className="flex items-center space-x-2">
                <img src={`https://openweathermap.org/img/wn/${departureWeather.icon}@2x.png`} alt="" className="w-10 h-10" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(departureWeather.temperature)}°C</div>
                  <div className="capitalize text-gray-600">{departureWeather.description}</div>
                  {departureWeather.forecastTime && (
                    <div className="text-xs text-gray-400 mt-1">Forecast for {new Date(departureWeather.forecastTime).toLocaleString()}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No data</div>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Arrival: {arrivalCity}</h4>
            {arrivalWeather ? (
              <div className="flex items-center space-x-2">
                <img src={`https://openweathermap.org/img/wn/${arrivalWeather.icon}@2x.png`} alt="" className="w-10 h-10" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(arrivalWeather.temperature)}°C</div>
                  <div className="capitalize text-gray-600">{arrivalWeather.description}</div>
                  {arrivalWeather.forecastTime && (
                    <div className="text-xs text-gray-400 mt-1">Forecast for {new Date(arrivalWeather.forecastTime).toLocaleString()}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No data</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
