import React, { useState } from 'react';
import {
  Sun,
  CloudRain,
  CloudSun,
  Wind,
  Droplets,
  Eye,
  ShieldCheck,
  ChevronRight,
  Compass,
  Thermometer,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface DiscreetModeProps {
  onSwitchToSafety: () => void;
}

export const DiscreetMode: React.FC<DiscreetModeProps> = ({ onSwitchToSafety }) => {
  const [selectedCity, setSelectedCity] = useState<'Mumbai' | 'Delhi' | 'Bengaluru'>('Mumbai');
  const [clickCount, setClickCount] = useState(0);

  const cityData = {
    Mumbai: {
      temp: '28°',
      condition: 'Partly Cloudy',
      highLow: 'H: 31° · L: 24°',
      wind: '14 km/h SW',
      humidity: '74%',
      uv: '4 Moderate',
      aqi: '68 Good',
      hourly: [
        { time: 'Now', temp: '28°', icon: CloudSun },
        { time: '12 PM', temp: '30°', icon: Sun },
        { time: '1 PM', temp: '31°', icon: Sun },
        { time: '2 PM', temp: '31°', icon: Sun },
        { time: '3 PM', temp: '29°', icon: CloudSun },
        { time: '4 PM', temp: '28°', icon: CloudRain },
        { time: '5 PM', temp: '27°', icon: CloudRain },
      ],
      forecast: [
        { day: 'Today', condition: 'Partly Cloudy', high: '31°', low: '24°' },
        { day: 'Thu', condition: 'Afternoon Showers', high: '29°', low: '23°' },
        { day: 'Fri', condition: 'Scattered Clouds', high: '30°', low: '24°' },
        { day: 'Sat', condition: 'Mostly Sunny', high: '32°', low: '25°' },
        { day: 'Sun', condition: 'Sunny & Clear', high: '33°', low: '25°' },
      ],
    },
    Delhi: {
      temp: '32°',
      condition: 'Sunny & Hazy',
      highLow: 'H: 35° · L: 26°',
      wind: '9 km/h WNW',
      humidity: '48%',
      uv: '7 High',
      aqi: '142 Moderate',
      hourly: [
        { time: 'Now', temp: '32°', icon: Sun },
        { time: '12 PM', temp: '34°', icon: Sun },
        { time: '1 PM', temp: '35°', icon: Sun },
        { time: '2 PM', temp: '35°', icon: Sun },
        { time: '3 PM', temp: '34°', icon: Sun },
        { time: '4 PM', temp: '32°', icon: CloudSun },
        { time: '5 PM', temp: '30°', icon: CloudSun },
      ],
      forecast: [
        { day: 'Today', condition: 'Hazy Sun', high: '35°', low: '26°' },
        { day: 'Thu', condition: 'Sunny', high: '36°', low: '27°' },
        { day: 'Fri', condition: 'Clear Sky', high: '36°', low: '27°' },
        { day: 'Sat', condition: 'Sunny', high: '37°', low: '28°' },
        { day: 'Sun', condition: 'Hazy', high: '35°', low: '26°' },
      ],
    },
    Bengaluru: {
      temp: '23°',
      condition: 'Pleasant Breeze',
      highLow: 'H: 26° · L: 19°',
      wind: '18 km/h E',
      humidity: '62%',
      uv: '5 Moderate',
      aqi: '42 Very Good',
      hourly: [
        { time: 'Now', temp: '23°', icon: CloudSun },
        { time: '12 PM', temp: '25°', icon: CloudSun },
        { time: '1 PM', temp: '26°', icon: Sun },
        { time: '2 PM', temp: '26°', icon: CloudSun },
        { time: '3 PM', temp: '24°', icon: CloudRain },
        { time: '4 PM', temp: '23°', icon: CloudRain },
        { time: '5 PM', temp: '22°', icon: CloudSun },
      ],
      forecast: [
        { day: 'Today', condition: 'Pleasant & Cool', high: '26°', low: '19°' },
        { day: 'Thu', condition: 'Light Drizzle', high: '25°', low: '18°' },
        { day: 'Fri', condition: 'Overcast', high: '24°', low: '18°' },
        { day: 'Sat', condition: 'Scattered Showers', high: '25°', low: '19°' },
        { day: 'Sun', condition: 'Partly Cloudy', high: '26°', low: '19°' },
      ],
    },
  };

  const current = cityData[selectedCity];

  const handleDiscreetTap = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 3) {
      onSwitchToSafety();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-500 to-indigo-600 text-white flex flex-col font-sans">
      {/* Top Demo Context Banner */}
      <div className="bg-stone-900/95 text-stone-200 border-b border-stone-800 px-4 py-2.5 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              ✓
            </span>
            <div>
              <span className="font-semibold text-white">DISCREET IDENTITY MODE ACTIVE</span>
              <span className="text-stone-400 ml-2">
                Disguised as ordinary weather utility to prevent detection during phone checks.
              </span>
            </div>
          </div>
          <button
            onClick={onSwitchToSafety}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium rounded-lg shadow transition-all cursor-pointer text-xs"
          >
            <span>Exit Disguise ➔ Return to ABHAYAA Safety Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weather App Main Content */}
      <div className="max-w-lg mx-auto w-full px-5 py-6 flex-1 flex flex-col justify-between">
        {/* Header with City Switcher */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-200" />
              <div className="flex gap-1.5 bg-white/20 p-0.5 rounded-lg backdrop-blur-md">
                {(['Mumbai', 'Delhi', 'Bengaluru'] as const).map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      selectedCity === city ? 'bg-white text-sky-800 shadow-sm' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Discreet Activation Icon (Tapping 3 times opens ABHAYAA) */}
            <button
              onClick={handleDiscreetTap}
              title="Discreet Safety Activation (tap 3x)"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white/70"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Temperature Display */}
          <div className="text-center my-8">
            <h1 className="text-2xl font-semibold tracking-tight">{selectedCity}</h1>
            <div className="text-7xl font-extralight tracking-tighter my-1 tabular-nums">{current.temp}</div>
            <p className="text-base text-sky-100 font-medium">{current.condition}</p>
            <p className="text-xs text-sky-200 mt-1">{current.highLow}</p>
          </div>

          {/* Weather Metric Chips */}
          <div className="grid grid-cols-4 gap-2 bg-white/15 backdrop-blur-md rounded-2xl p-3.5 text-center text-xs">
            <div>
              <Wind className="w-4 h-4 mx-auto mb-1 text-sky-200" />
              <div className="text-[10px] text-sky-200">Wind</div>
              <div className="font-semibold text-[11px] truncate">{current.wind}</div>
            </div>
            <div>
              <Droplets className="w-4 h-4 mx-auto mb-1 text-sky-200" />
              <div className="text-[10px] text-sky-200">Humidity</div>
              <div className="font-semibold text-[11px]">{current.humidity}</div>
            </div>
            <div>
              <Sun className="w-4 h-4 mx-auto mb-1 text-sky-200" />
              <div className="text-[10px] text-sky-200">UV Index</div>
              <div className="font-semibold text-[11px]">{current.uv}</div>
            </div>
            <div>
              <Eye className="w-4 h-4 mx-auto mb-1 text-sky-200" />
              <div className="text-[10px] text-sky-200">Air Quality</div>
              <div className="font-semibold text-[11px]">{current.aqi}</div>
            </div>
          </div>

          {/* Hourly Forecast */}
          <div className="mt-5 bg-white/10 backdrop-blur-md rounded-2xl p-4">
            <div className="text-xs font-semibold text-sky-200 mb-3 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5" />
              <span>HOURLY FORECAST</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1 text-center no-scrollbar">
              {current.hourly.map((h, i) => {
                const Icon = h.icon;
                return (
                  <div key={i} className="flex flex-col items-center min-w-[50px]">
                    <span className="text-xs text-sky-100">{h.time}</span>
                    <Icon className="w-5 h-5 my-2 text-amber-300" />
                    <span className="text-sm font-semibold tabular-nums">{h.temp}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5-Day Outlook */}
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-4">
            <div className="text-xs font-semibold text-sky-200 mb-3">5-DAY OUTLOOK</div>
            <div className="space-y-2 text-xs">
              {current.forecast.map((f, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-white/10 last:border-none">
                  <span className="w-16 font-medium">{f.day}</span>
                  <span className="text-sky-100 flex-1 text-center">{f.condition}</span>
                  <div className="flex gap-2 tabular-nums">
                    <span className="font-semibold">{f.high}</span>
                    <span className="text-sky-200">{f.low}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info explaining discreet protection */}
        <div className="mt-6 pt-4 border-t border-white/20 text-center">
          <button
            onClick={onSwitchToSafety}
            className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-medium text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Switch to ABHAYAA Safety & Protection Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/70" />
          </button>
          <p className="text-[11px] text-white/70 mt-2">
            Discreet Mode prevents domestic abusers or unauthorized parties from discovering your safety reports or evidence vault.
          </p>
        </div>
      </div>
    </div>
  );
};
