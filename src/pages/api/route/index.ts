import type { NextApiRequest, NextApiResponse } from "next";
import { type WeatherResponse, type RouteResponse, type Coords } from "~/types";

async function getRoute(from: string, to: string) {
  const response = await fetch(
    `https://scrmobiletest.azurewebsites.net/api/route/${from}/${to}`
  );
  const route = (await response.json()) as RouteResponse;
  return route;
}
const makeCompositeKey = (a?: string | number, b?: string | number) =>
  `${a ?? ""}:${b ?? ""}`;

async function getWeatherByCoords(coords: Coords) {
  const response = await fetch(
    `https://scrmobiletest.azurewebsites.net/api/Weather/${coords.lat}/${coords.lng}`
  );
  const weather = (await response.json()) as WeatherResponse;
  return { ...weather, id: makeCompositeKey(coords.lat, coords.lng) };
}

type Weather = Awaited<ReturnType<typeof getWeatherByCoords>>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RouteResponse | null>
) {
  const { from, to } = req.query;
  try {
    const routeResponse = await getRoute(from as string, to as string);

    let response = routeResponse;

    if (!!routeResponse.steps && routeResponse.steps.length > 0) {
      const weatherPromises = routeResponse.steps
        .filter((s) => !!s?.location?.lat && !!s?.location?.lng)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map((s) => getWeatherByCoords(s.location!));

      const weatherResponse = await Promise.allSettled(weatherPromises);
      const weatherMap = weatherResponse
        .filter((w) => w.status === "fulfilled")
        .reduce((acc, s) => {
          if (s.status === "fulfilled") {
            return { ...acc, [s.value.id]: s.value };
          } else {
            return acc;
          }
        }, {} as Record<string, Weather>);

      response = {
        ...routeResponse,
        steps: routeResponse?.steps?.map((s) => ({
          ...s,
          weather:
            weatherMap[makeCompositeKey(s.location?.lat, s.location?.lng)],
        })),
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(null);
  }
}
