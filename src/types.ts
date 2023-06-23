// TODO use ZOD

export type Coords = {
  lat: number;
  lng: number;
};

export type WeatherResponse = {
  id: string;
  description: string;
  temperature: number;
};

type RouteStep = {
  direction: string | null;
  location: Coords | null;
};

export type RouteStepWithWeather = RouteStep & { weather?: WeatherResponse };

export type RouteResponse = {
  duration: number;
  distance: number;
  steps: RouteStepWithWeather[] | null | undefined;
};
