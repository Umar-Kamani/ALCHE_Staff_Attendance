import { useState } from 'react';
import { ParkingConfig } from '../App';
import { ParkingSquare, Settings } from 'lucide-react';

interface ParkingMonitorProps {
  parkingConfig: ParkingConfig;
  onUpdateParkingConfig: (config: ParkingConfig) => void;
}

export function ParkingMonitor({ parkingConfig, onUpdateParkingConfig }: ParkingMonitorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [totalSpaces, setTotalSpaces] = useState(parkingConfig.totalSpaces.toString());

  const availableSpaces = parkingConfig.totalSpaces - parkingConfig.occupiedSpaces;
  const occupancyPercentage = (parkingConfig.occupiedSpaces / parkingConfig.totalSpaces) * 100;

  const handleSave = () => {
    const newTotal = parseInt(totalSpaces);
    if (isNaN(newTotal) || newTotal < 1) {
      alert('Please enter a valid number of parking spaces');
      return;
    }

    if (newTotal < parkingConfig.occupiedSpaces) {
      alert('Total spaces cannot be less than currently occupied spaces');
      return;
    }

    onUpdateParkingConfig({
      ...parkingConfig,
      totalSpaces: newTotal,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ParkingSquare className="w-6 h-6 text-[#BF2C34]" />
          <h2 className="text-gray-900">Parking Monitor</h2>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="totalSpaces" className="block text-gray-700 mb-2">
              Total Parking Spaces
            </label>
            <input
              type="number"
              id="totalSpaces"
              value={totalSpaces}
              onChange={(e) => setTotalSpaces(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E6D]"
              min="1"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#002E6D] text-white py-2 rounded-lg hover:bg-[#001d45] transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTotalSpaces(parkingConfig.totalSpaces.toString());
                setIsEditing(false);
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Occupancy</span>
              <span className="text-gray-900">{occupancyPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  occupancyPercentage > 90
                    ? 'bg-[#BF2C34]'
                    : occupancyPercentage > 70
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
                }`}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700">Available</span>
              <span className="text-green-700">{availableSpaces}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Occupied</span>
              <span className="text-blue-700">{parkingConfig.occupiedSpaces}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Spaces</span>
              <span className="text-gray-900">{parkingConfig.totalSpaces}</span>
            </div>
          </div>

          {/* Alert */}
          {availableSpaces <= 5 && availableSpaces > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">Warning: Only {availableSpaces} spaces left!</p>
            </div>
          )}

          {availableSpaces === 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Parking is full!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}