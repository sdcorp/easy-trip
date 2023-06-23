import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import {
  GithubIcon,
  LoaderIcon,
  ArrowBigLeftIcon,
  ArrowBigRightIcon,
  ChevronsLeftRightIcon,
  CloudIcon,
  CloudCogIcon,
  AlertCircleIcon,
  CarIcon,
  Clock3Icon,
  MoveRightIcon,
  LogOutIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  type RouteStepWithWeather,
  type RouteResponse,
  type WeatherResponse,
} from "~/types";

function getIconByDirection(direction: string) {
  switch (direction) {
    case "turn-left":
      return ArrowBigLeftIcon;
    case "turn-right":
      return ArrowBigRightIcon;
    default:
      return ChevronsLeftRightIcon;
  }
}

function getIconByWeather(weather: WeatherResponse) {
  switch (weather.description) {
    case "clear sky":
      return CloudIcon;
    case "smoke":
      return CloudCogIcon;
    default:
      return CloudIcon;
  }
}

function Weather({ weather }: { weather?: WeatherResponse }) {
  if (!weather) return null;

  const Icon = getIconByWeather(weather);

  return (
    <div>
      <Icon size={48} className="text-blue-500" />
      <div className="text-2xl font-bold">{weather.temperature} &deg;C</div>
    </div>
  );
}

function RouteInfo({
  from,
  to,
  distance,
  duration,
}: {
  from: string;
  to: string;
  distance?: number;
  duration?: number;
}) {
  return (
    <section className=" text-white">
      <div className="inline-flex items-center gap-6">
        <span className="text-4xl text-green-500 first-letter:uppercase">
          {from}
        </span>
        <MoveRightIcon size={48} />
        <span className="text-4xl text-blue-500 first-letter:uppercase">
          {to}
        </span>
      </div>
      <div className="mt-8 flex justify-evenly gap-4">
        <div className="grid justify-items-center gap-2">
          <CarIcon size={48} />
          <span className="text-center text-2xl">
            {((distance ?? 0) / 1000).toFixed(2)} km
          </span>
        </div>
        <div className="grid justify-items-center gap-2">
          <Clock3Icon size={48} />
          <span className="text-center text-2xl">
            {((duration ?? 0) / 60).toFixed(1)} min
          </span>
        </div>
      </div>
    </section>
  );
}

function RouteSteps({ steps }: { steps?: RouteStepWithWeather[] | null }) {
  return (
    <div className="grid w-2/3 gap-4">
      {steps?.map((s, idx) => {
        const Icon = getIconByDirection(s.direction ?? "");
        return (
          <div
            key={idx}
            className="flex items-center justify-between rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5"
          >
            <Icon size={48} />
            {!!s.location && (
              <iframe
                width="350"
                height="150"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&zoom=10&center=${
                  s.location?.lat ?? 0
                },${s.location?.lng ?? 0}`}
                data-message="This Google Map API key is not mine 🤨"
              ></iframe>
            )}
            <Weather weather={s.weather} />
          </div>
        );
      })}
    </div>
  );
}

function BuildRouteForm({
  from,
  to,
  disabled,
}: {
  from: string;
  to: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  return (
    <form
      className="grid w-2/3 gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const from = formData.get("from");
        const to = formData.get("to");
        if (!!from && !!to) {
          router
            .push({
              pathname: "/",
              query: { from: from.toString(), to: to.toString() },
              slashes: false,
            })
            .catch(console.error);
        } else {
          alert("Fill all fields!");
        }
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-transparent bg-green-500 text-lg font-semibold text-white">
          A
        </div>
        <Input
          required
          className="h-16 text-lg"
          name="from"
          placeholder="From"
          defaultValue={from}
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-transparent bg-blue-500 text-lg font-semibold text-white">
          B
        </div>
        <Input
          required
          className="h-16 text-lg"
          name="to"
          placeholder="To"
          defaultValue={to}
        />
      </div>
      <Button
        variant="outline"
        className="h-24 w-24 justify-self-center rounded-full text-base"
        type="submit"
        disabled={disabled}
      >
        Let&apos;s go
      </Button>
    </form>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const fromQ = router.query.from as string;
  const toQ = router.query.to as string;

  const qr = useQuery({
    queryKey: ["route", fromQ, toQ],
    queryFn: () =>
      fetch(`/api/route?from=${fromQ}&to=${toQ}`).then(
        (r) => r.json() as Promise<RouteResponse>
      ),
    enabled: status === "authenticated" && !!fromQ && !!toQ && Boolean(1),
  });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-blue-500">Easy</span>
            <span> &mdash; </span>
            <span className="text-yellow-500">Trip</span>
          </h1>
          {status === "unauthenticated" && (
            <Button variant="secondary" onClick={() => void signIn("github")}>
              <GithubIcon size={18} className="mr-2" />
              <span>Login with Github</span>
            </Button>
          )}
          {status === "authenticated" && (
            <>
              <p className="text-white">
                Signed as{" "}
                <span className="text-purple-500">{session.user.name}</span>{" "}
                with email:{" "}
                <span className="text-green-500">{session.user.email}</span>
              </p>
              <Button variant="secondary" onClick={() => void signOut()}>
                <LogOutIcon size={18} className="mr-2" />
                <span>Log out</span>
              </Button>
              <BuildRouteForm from={fromQ} to={toQ} disabled={qr.isFetching} />
              {qr.isFetching ? (
                <LoaderIcon className="h-24 w-24 animate-spin justify-self-center text-purple-500 duration-2000" />
              ) : (
                <>
                  {!!qr.data && (
                    <RouteInfo
                      from={fromQ}
                      to={toQ}
                      distance={qr.data.distance}
                      duration={qr.data.duration}
                    />
                  )}
                  {qr.data?.steps === null && (
                    <Alert variant="destructive">
                      <AlertCircleIcon className="h-4 w-4" />
                      <AlertTitle>Couldn&apos;t build a route</AlertTitle>
                      <AlertDescription>
                        Please make sure you enter the correct origin and
                        destination cities
                      </AlertDescription>
                    </Alert>
                  )}
                  <RouteSteps steps={qr.data?.steps} />
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
