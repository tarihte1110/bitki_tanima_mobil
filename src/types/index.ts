// TypeScript type definitions for the plant recognition app

export interface PredictionResult {
  classIndex: number;
  className: string;
  confidence: number;
}

export interface PlantDetails {
  id: number;
  turkishName: string;
  scientificName: string;
  toxicity: string;
  edible: string;
  geography: string;
  description: string;
}

export interface TopKPrediction {
  rank: number;
  className: string;
  confidence: number;
}

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Result: {
    imageUri: string;
    predictions: PredictionResult[];
  };
};

export interface ModelState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}
