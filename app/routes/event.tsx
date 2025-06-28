import { useEffect } from 'react';
import { useLoaderData } from 'react-router';

import JudgeTrack from '~/components/app/judgeTrack';
import { Button } from '~/components/ui/button';
import { getEvent, getEventSchedule, getEventTeams } from '~/lib/api';
import { useAppStore } from '~/lib/store';

import type { Route } from '.react-router/types/app/routes/+types/event';

export async function loader({ params }: Route.LoaderArgs) {
  const { eventKey } = params;
  const teams = await getEventTeams(eventKey);
  const event = await getEvent(eventKey);
  const schedule = await getEventSchedule(eventKey);

  return { eventKey, teams, event: event.Events[0], schedule };
}

export default function Event() {
  const { eventKey, teams, event, schedule } = useLoaderData<typeof loader>();
  const store = useAppStore();

  useEffect(() => {
    store.setTeamKeys(teams.teams.map((team) => team.teamNumber.toString()));
  }, [teams]);

  useEffect(() => {
    store.setMatches(schedule);
  }, [schedule]);

  console.log(
    schedule.map((m) =>
      new Date(m.startTime ?? '').toLocaleTimeString('en-US', {
        timeStyle: 'short',
      }),
    ),
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Event: {eventKey}</h1>
      <p>This is the event page for event key: {eventKey}</p>

      <Button
        variant="outline"
        className="mt-4"
        onClick={() => {
          store.createJudgeTrack(event);
        }}
      >
        Add Judge Track
      </Button>

      <div className="divide-x-3 flex flex-row">
        {store.judgeTracks.map((track, index) => (
          <JudgeTrack key={index} track={track} />
        ))}
      </div>

      <pre>{JSON.stringify(store.conflicts, null, 2)}</pre>
    </div>
  );
}
