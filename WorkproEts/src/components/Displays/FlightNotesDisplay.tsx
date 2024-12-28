import React, { useEffect, useState } from "react";
import axios from "axios";

interface FlightNotesDisplayProps {
  managerTaskId: string;
}

export const FlightNotesDisplay = ({ managerTaskId }: FlightNotesDisplayProps) => {
  const [latestData, setLatestData] = useState<{
    _id: string;
    type: string;
    currentStep: number;
    managerTaskId: string;
    images: string[];
    date: string;
    crew: string[];
    flights: {
      flightNo: string;
      takeoffTime: string;
      landingTime?: string;
      _id: string;
    }[];
    method: string;
    sightName: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/submissions", {
          params: { type: "combinedFlightForm", managerTaskId },
        });
        const submissions = response.data.data;
        if (submissions.length > 0) {
          const latestSubmission = submissions.reduce((latest, current) => {
            return new Date(current.date) > new Date(latest.date) ? current : latest;
          }, submissions[0]);
          setLatestData(latestSubmission);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [managerTaskId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (!latestData) return <p>No data available</p>;

  return (
    <div className="space-y-6">
      <div key={latestData._id} className="border rounded-md p-4 bg-gray-50 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Flight Notes Overview</h2>

        <div className="space-y-2">
          <p>
            <strong>Crew:</strong> {latestData.crew.join(", ")}
          </p>
          <p>
            <strong>Method of Survey:</strong> {latestData.method}
          </p>
          <p>
            <strong>Site Name:</strong> {latestData.sightName}
          </p>
          <p>
            <strong>Date:</strong> {new Date(latestData.date).toLocaleDateString()}
          </p>
        </div>

        {latestData.flights.length > 0 && (
          <div className="space-y-4 mt-4">
            <h3 className="text-md font-medium">Flight Details:</h3>

            {latestData.flights.map((flight) => (
              <div key={flight._id} className="border rounded-md p-2 bg-white shadow-sm">
                <p>
                  <strong>Flight Number:</strong> {flight.flightNo}
                </p>
                <p>
                  <strong>Take-off Time:</strong> {flight.takeoffTime}
                </p>
                {flight.landingTime && (
                  <p>
                    <strong>Landing Time:</strong> {flight.landingTime}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {latestData.images.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium">Images:</h3>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {latestData.images.map((image, idx) => (
                <img
                  key={idx}
                  src={image}
                  alt={`Image ${idx}`}
                  className="w-full h-24 object-cover rounded-md"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
