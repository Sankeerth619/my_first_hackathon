import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult, PoliceStation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const violationInstanceSchema = {
    type: Type.OBJECT,
    properties: {
        violationType: {
            type: Type.STRING,
            enum: ["Red Light Violation", "No Helmet", "Wrong Way", "Stop Sign Violation", "Illegal Parking", "Phone Usage While Driving", "None"],
            description: "The type of violation identified for this specific instance."
        },
        vehicleDetails: {
            type: Type.OBJECT,
            description: "Details of the vehicle involved in this specific violation. Can be estimations.",
            properties: {
                type: { type: Type.STRING, description: "e.g., Car, Motorcycle, Truck" },
                licensePlate: { type: Type.STRING, description: "The license plate number. Generate a plausible one if not clearly visible." },
                color: { type: Type.STRING, description: "The primary color of the vehicle." },
                make: { type: Type.STRING, description: "The make or brand of the vehicle (e.g., Honda, Toyota). Optional." },
                model: { type: Type.STRING, description: "The model of the vehicle (e.g., Civic, Camry). Optional." },
            },
            required: ["type", "licensePlate", "color"],
        },
        severity: {
            type: Type.STRING,
            enum: ["Low", "Medium", "High"],
            description: "An assessment of this specific violation's severity based on potential danger."
        },
        reasoning: { 
            type: Type.STRING, 
            description: "A brief, clear explanation for this specific violation detection." 
        },
        confidenceScore: { 
            type: Type.NUMBER, 
            description: "A score from 0.0 to 1.0 indicating confidence in this specific violation detection." 
        },
    },
    required: ["violationType", "vehicleDetails", "severity", "reasoning", "confidenceScore"],
};


const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    isViolation: { type: Type.BOOLEAN, description: "Whether any traffic violations are detected in the image." },
    violations: {
        type: Type.ARRAY,
        description: "A list of all traffic violations found in the image. This can be empty if no violations are detected.",
        items: violationInstanceSchema
    },
    summaryReasoning: { type: Type.STRING, description: "A brief, overall summary of the findings in the image." },
    environment: {
        type: Type.OBJECT,
        description: "Details about the environment in the image.",
        properties: {
            timeOfDay: { type: Type.STRING, enum: ["Day", "Night", "Dusk/Dawn"], description: "The estimated time of day." },
            weather: { type: Type.STRING, enum: ["Clear", "Rainy", "Foggy", "Overcast", "Unknown"], description: "The apparent weather conditions." },
            roadType: { type: Type.STRING, enum: ["Highway", "City Street", "Intersection", "Residential", "Parking Lot"], description: "The type of road where the event is occurring." },
        },
        required: ["timeOfDay", "weather", "roadType"],
    }
  },
  required: ["isViolation", "violations", "summaryReasoning", "environment"],
};

export const analyzeViolationImage = async (base64Image: string, mimeType: string): Promise<GeminiAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this image for any and all occurrences of the following traffic violations:

1. RED LIGHT VIOLATION (also called "Jumping Red Signal"): A vehicle proceeding through an intersection when the traffic light is red. Look for:
   - Red traffic signal visible in the image
   - Vehicle crossing the stop line or intersection when light is red
   - Vehicle moving through intersection against red signal
   - This is a HIGH severity violation

2. WRONG WAY (also called "One Way Violation" or "One-Way Violation"): A vehicle traveling in the wrong direction on a one-way street or against traffic flow. This is EXTREMELY IMPORTANT to detect. Look for:
   - One-way street signs (rectangular blue/red signs with white arrows pointing in one direction, circular signs with arrows, or diamond-shaped signs)
   - Directional arrows painted on the road surface pointing in one direction
   - Vehicles traveling opposite to the indicated direction or against the flow of other vehicles
   - Vehicles facing oncoming traffic on a one-way road
   - Multiple vehicles going in one direction while one vehicle goes the opposite way
   - Road markings, lane dividers, or traffic patterns indicating one-way flow
   - If ALL or MOST vehicles are facing one direction and a vehicle is facing the opposite direction, this is almost certainly a Wrong Way violation
   - This is a HIGH severity violation
   - CRITICAL: Even if you don't see a one-way sign clearly, if a vehicle is clearly going against the flow of all other traffic in the image, flag it as Wrong Way. Trust the traffic flow pattern.

3. NO HELMET: A motorcycle/scooter rider without a helmet.

4. STOP SIGN VIOLATION: A vehicle failing to come to a complete stop at a stop sign.

5. ILLEGAL PARKING: Vehicles parked in no-parking zones, blocking traffic, or in restricted areas.

6. PHONE USAGE WHILE DRIVING: Driver using a mobile phone while operating a vehicle.

IMPORTANT DETECTION GUIDELINES:
- For RED LIGHT VIOLATION: Carefully examine traffic signals. If you see a red light AND a vehicle crossing/entering the intersection, this is a red light violation. Be very attentive to traffic light colors and vehicle positions.
- For WRONG WAY: This is CRITICAL - Look carefully for:
  * One-way street signs (blue/red rectangular signs with white arrows, or circular signs)
  * Directional arrows painted on the road
  * The direction ALL other vehicles are traveling - if one vehicle is going the opposite direction, it's likely Wrong Way
  * Road markings, lane dividers, or traffic patterns
  * If most/all vehicles are facing one direction and a vehicle is facing the opposite direction, flag it as Wrong Way even without a visible sign
  * Pay special attention to the overall traffic flow pattern in the image
- Pay close attention to traffic signals, road signs, and vehicle directions.
- There may be multiple vehicles or people, and multiple violations in the image. Identify each distinct violation.

Your analysis must include:
- A determination if any violation occurred.
- A list of all violations found. For EACH violation, provide:
    - The specific violation type (use exact names: "Red Light Violation" or "Wrong Way").
    - Details about the vehicle/person involved (type, color, plausible license plate if applicable).
    - The severity of that violation (Low, Medium, High).
    - A confidence score (0.0 to 1.0) for that detection.
    - A brief reasoning explaining WHY you detected this violation (e.g., "Red light visible, vehicle crossing intersection").
- An overall summary of your findings.
- Environmental context (Time of Day, Weather, Road Type).

Your response must be in JSON format according to the provided schema. If no violations are found, set isViolation to false and the violations list to an empty array.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });
    
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result as GeminiAnalysisResult;

  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

const policeStationSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The official name of the police station." },
        lat: { type: Type.NUMBER, description: "The latitude of the police station." },
        lng: { type: Type.NUMBER, description: "The longitude of the police station." },
    },
    required: ["name", "lat", "lng"],
};

const policeStationsListSchema = {
    type: Type.OBJECT,
    properties: {
        stations: {
            type: Type.ARRAY,
            description: "A list of police stations found near the provided coordinates.",
            items: policeStationSchema
        }
    },
    required: ["stations"],
};

/**
 * Analyzes multiple frames from a video for traffic violations
 * @param frames Array of base64 encoded frame images
 * @returns Promise resolving to combined analysis result
 */
export const analyzeViolationVideo = async (frames: string[]): Promise<GeminiAnalysisResult> => {
  try {
    if (frames.length === 0) {
      throw new Error("No frames provided for video analysis");
    }

    // Prepare parts array with all frames
    const parts: any[] = [];
    
    // Add all frames
    frames.forEach((frame, index) => {
      const base64Data = frame.split(',')[1];
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      });
    });

    // Add analysis prompt
    parts.push({
      text: `Analyze these ${frames.length} frames extracted from a video for any and all occurrences of the following traffic violations:

1. RED LIGHT VIOLATION (also called "Jumping Red Signal"): A vehicle proceeding through an intersection when the traffic light is red. Look for:
   - Red traffic signal visible in frames
   - Vehicle crossing the stop line or intersection when light is red
   - Vehicle moving through intersection against red signal across multiple frames
   - This is a HIGH severity violation

2. WRONG WAY (also called "One Way Violation" or "One-Way Violation"): A vehicle traveling in the wrong direction on a one-way street or against traffic flow. This is EXTREMELY IMPORTANT to detect. Look for:
   - One-way street signs (rectangular blue/red signs with white arrows, circular signs, or diamond-shaped signs)
   - Directional arrows painted on the road surface pointing in one direction
   - Vehicles traveling opposite to the indicated direction or against the flow of other vehicles across frames
   - Vehicles facing oncoming traffic on a one-way road
   - Multiple vehicles going in one direction while one vehicle goes the opposite way
   - Road markings, lane dividers, or traffic patterns indicating one-way flow
   - If ALL or MOST vehicles are facing one direction and a vehicle is facing the opposite direction, this is almost certainly a Wrong Way violation
   - This is a HIGH severity violation
   - CRITICAL: Even if you don't see a one-way sign clearly, if a vehicle is clearly going against the flow of all other traffic across frames, flag it as Wrong Way. Trust the traffic flow pattern.

3. NO HELMET: A motorcycle/scooter rider without a helmet.

4. STOP SIGN VIOLATION: A vehicle failing to come to a complete stop at a stop sign.

5. ILLEGAL PARKING: Vehicles parked in no-parking zones, blocking traffic, or in restricted areas.

6. PHONE USAGE WHILE DRIVING: Driver using a mobile phone while operating a vehicle.

IMPORTANT DETECTION GUIDELINES:
- For RED LIGHT VIOLATION: Carefully examine traffic signals across frames. If you see a red light AND a vehicle crossing/entering the intersection in subsequent frames, this is a red light violation. Track vehicle movement relative to traffic signals.
- For WRONG WAY: This is CRITICAL - Look carefully across frames for:
  * One-way street signs (blue/red rectangular signs with white arrows, or circular signs)
  * Directional arrows painted on the road
  * The direction ALL other vehicles are traveling - if one vehicle is going the opposite direction across frames, it's likely Wrong Way
  * Road markings, lane dividers, or traffic patterns
  * If most/all vehicles are facing one direction and a vehicle is facing the opposite direction, flag it as Wrong Way even without a visible sign
  * Pay special attention to the overall traffic flow pattern across all frames
- The frames are sequential from a video, so consider the temporal context - violations may occur across multiple frames. There may be multiple vehicles or people, and multiple violations across the frames. Identify each distinct violation.

Your analysis must include:
- A determination if any violation occurred across any of the frames.
- A list of all violations found. For EACH violation, provide:
    - The specific violation type (use exact names: "Red Light Violation" or "Wrong Way").
    - Details about the vehicle/person involved (type, color, plausible license plate if applicable).
    - The severity of that violation (Low, Medium, High).
    - A confidence score (0.0 to 1.0) for that detection.
    - A brief reasoning explaining WHY you detected this violation.
- An overall summary of your findings across all frames.
- Environmental context (Time of Day, Weather, Road Type) - use the most common or representative values across frames.

Your response must be in JSON format according to the provided schema. If no violations are found, set isViolation to false and the violations list to an empty array.`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });
    
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result as GeminiAnalysisResult;

  } catch (error) {
    console.error("Error analyzing video with Gemini:", error);
    throw new Error("Failed to analyze video. Please try again.");
  }
};

export const findNearbyPoliceStations = async (latitude: number, longitude: number): Promise<PoliceStation[]> => {
    try {
        // Enhanced prompt with better context for AI networking
        const prompt = `You are an AI assistant with access to real-world location data and police station networks. 
        
Given the coordinates: Latitude ${latitude}, Longitude ${longitude}

Your task is to find the 5 closest police stations to this location using your knowledge of:
1. Real-world police station locations and networks
2. Geographic proximity calculations
3. Official police station databases and directories
4. Local law enforcement infrastructure

IMPORTANT REQUIREMENTS:
- Use your knowledge of actual police station locations worldwide
- Calculate distances accurately using the Haversine formula or similar geographic distance calculations
- Prioritize stations that are:
  * Closest in actual distance (not just coordinate proximity)
  * Official police stations (not private security)
  * Active and operational
  * Accessible for traffic violation reporting
- Provide the EXACT official name of each police station
- Provide PRECISE coordinates (latitude and longitude) for each station
- Ensure coordinates are realistic and correspond to actual locations
- If you're uncertain about exact coordinates, use your best knowledge but ensure they are geographically plausible

For each police station, provide:
- Official name (e.g., "Downtown Police Station", "Central Police Station", "Traffic Police Station")
- Exact latitude (decimal degrees, typically between -90 and 90)
- Exact longitude (decimal degrees, typically between -180 and 180)

Return the 5 closest stations sorted by distance from the given coordinates, with the closest first.

Your response must be in JSON format according to the provided schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: policeStationsListSchema,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        // Validate and filter results
        const stations = (result.stations as PoliceStation[]).filter(station => {
            // Validate coordinates are within valid ranges
            return station.lat >= -90 && station.lat <= 90 && 
                   station.lng >= -180 && station.lng <= 180 &&
                   station.name && station.name.trim().length > 0;
        });

        // Sort by distance (Haversine formula)
        const sortedStations = stations.sort((a, b) => {
            const distanceA = calculateDistance(latitude, longitude, a.lat, a.lng);
            const distanceB = calculateDistance(latitude, longitude, b.lat, b.lng);
            return distanceA - distanceB;
        });

        return sortedStations.slice(0, 5);

    } catch (error) {
        console.error("Error finding police stations with Gemini:", error);
        throw new Error("Failed to find nearby police stations. Please try again.");
    }
};

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}