import { POLAR_API_BASE } from "../constants";
import type { PolarExercise } from "@/types/polar";

interface PolarCredentials {
  access_token: string;
  polar_user_id: string;
}

export async function getPolarExercise(
  credentials: PolarCredentials,
  exerciseUrl: string
): Promise<PolarExercise> {
  const response = await fetch(exerciseUrl, {
    headers: {
      Authorization: `Bearer ${credentials.access_token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Polar exercise: ${response.statusText}`);
  }

  return response.json();
}

export async function getPolarExercises(
  credentials: PolarCredentials
): Promise<PolarExercise[]> {
  // First, create a transaction to pull new exercises
  const txResponse = await fetch(
    `${POLAR_API_BASE}/users/${credentials.polar_user_id}/exercise-transactions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.access_token}`,
        Accept: "application/json",
      },
    }
  );

  // 204 = no new data
  if (txResponse.status === 204) return [];
  if (!txResponse.ok) {
    throw new Error(`Failed to create Polar transaction: ${txResponse.statusText}`);
  }

  const transaction = await txResponse.json();
  const transactionId = transaction["transaction-id"];

  // List exercises in this transaction
  const listResponse = await fetch(
    `${POLAR_API_BASE}/users/${credentials.polar_user_id}/exercise-transactions/${transactionId}`,
    {
      headers: {
        Authorization: `Bearer ${credentials.access_token}`,
        Accept: "application/json",
      },
    }
  );

  if (!listResponse.ok) return [];
  const listData = await listResponse.json();
  const exerciseUrls: string[] = listData.exercises || [];

  // Fetch each exercise
  const exercises: PolarExercise[] = [];
  for (const url of exerciseUrls) {
    const exercise = await getPolarExercise(credentials, url);
    exercises.push(exercise);
  }

  // Commit the transaction
  await fetch(
    `${POLAR_API_BASE}/users/${credentials.polar_user_id}/exercise-transactions/${transactionId}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${credentials.access_token}` },
    }
  );

  return exercises;
}

// Parse ISO 8601 duration to seconds: "PT1H30M15S" → 5415
export function parsePolarDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}
