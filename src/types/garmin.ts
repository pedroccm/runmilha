export interface GarminUser {
  userId: string;
  displayName: string;
  profileImageUrl?: string;
}

export interface GarminActivity {
  activityId: number;
  activityName: string;
  activityType: string; // "running", "cycling", "walking", "hiking", etc.
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  durationInSeconds: number;
  distanceInMeters: number;
  activeTimeInSeconds: number;
  averageSpeedInMetersPerSecond?: number;
  maxSpeedInMetersPerSecond?: number;
  averageHeartRateInBeatsPerMinute?: number;
  maxHeartRateInBeatsPerMinute?: number;
  elevationGainInMeters?: number;
}

export interface GarminTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GarminWebhookPayload {
  activities?: GarminActivity[];
  activityDetails?: GarminActivity[];
}

// Map Garmin activity types to our standard types
export const GARMIN_ACTIVITY_MAP: Record<string, string> = {
  running: "Run",
  cycling: "Ride",
  walking: "Walk",
  hiking: "Hike",
  indoor_running: "VirtualRun",
  indoor_cycling: "VirtualRide",
  treadmill_running: "VirtualRun",
  virtual_ride: "VirtualRide",
  trail_running: "Run",
  mountain_biking: "Ride",
  road_biking: "Ride",
  gravel_cycling: "Ride",
};
