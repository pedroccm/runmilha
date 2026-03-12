export interface PolarUser {
  "polar-user-id": number;
  "member-id": string;
  "registration-date": string;
  "first-name": string;
  "last-name": string;
}

export interface PolarExercise {
  id: number;
  "upload-time": string;
  "polar-user": string;
  device: string;
  "start-time": string;
  duration: string; // "PT1H30M" ISO 8601 duration
  calories: number;
  distance: number; // meters
  "heart-rate"?: {
    average: number;
    maximum: number;
  };
  "sport": string; // "RUNNING", "CYCLING", "WALKING", etc.
  "detailed-sport-info"?: string;
  "has-route": boolean;
}

export interface PolarTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  x_user_id: number;
}

export interface PolarWebhookEvent {
  event: "EXERCISE";
  user_id: number;
  entity_id: string; // exercise URL
  timestamp: string;
  url: string; // full URL to fetch exercise
}

// Map Polar sport names to our standard types
export const POLAR_ACTIVITY_MAP: Record<string, string> = {
  RUNNING: "Run",
  CYCLING: "Ride",
  WALKING: "Walk",
  HIKING: "Hike",
  ROAD_RUNNING: "Run",
  TRAIL_RUNNING: "Run",
  TREADMILL_RUNNING: "VirtualRun",
  ROAD_BIKING: "Ride",
  MOUNTAIN_BIKING: "Ride",
  INDOOR_CYCLING: "VirtualRide",
  JOGGING: "Run",
  NORDIC_WALKING: "Walk",
};
