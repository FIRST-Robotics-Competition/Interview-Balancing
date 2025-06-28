import { add } from 'date-fns';
import { AlertCircleIcon } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import type { Match } from '~/lib/apiTypes';
import { type JudgeTrack as JudgeTrackType, useAppStore } from '~/lib/store';

export default function JudgeTrack({ track }: { track: JudgeTrackType }) {
  const store = useAppStore();
  const conflicts = useAppStore((state) => state.conflicts);
  const conflictIndexMap = useMemo(() => {
    return conflicts.reduce(
      (acc, c) => {
        acc[c.interviewSlotIndex] = c.match;
        return acc;
      },
      {} as Record<number, Match>,
    );
  }, [conflicts]);

  return (
    <div className="px-4">
      <div className="flex flex-col">
        {track.interviewSlotTimes.map((time, index) => (
          <div key={index}>
            <div className="flex flex-row items-center gap-2">
              <div className="w-24">
                {time.toLocaleTimeString('en-US', {
                  timeStyle: 'short',
                })}
              </div>
              <div>
                <Input
                  value={track.interviewSlotTeamKeys[index]}
                  onChange={(e) => {
                    store.setTeamKeyForInterviewSlot(
                      store.judgeTracks.indexOf(track),
                      index,
                      e.target.value,
                    );
                  }}
                  className="w-[5em]"
                />
              </div>
              {conflicts.some(
                (c) =>
                  c.judgeTrackIndex === store.judgeTracks.indexOf(track) &&
                  c.interviewSlotIndex === index,
              ) && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="destructive">
                      <AlertCircleIcon className="h-4 w-4" />
                      Conflict
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      This interview slot conflicts with{' '}
                      {conflictIndexMap[index]?.tournamentLevel}{' '}
                      {conflictIndexMap[index]?.matchNumber} (
                      {new Date(
                        conflictIndexMap[index]?.startTime ?? '',
                      ).toLocaleTimeString('en-US', {
                        timeStyle: 'short',
                      })}
                      -
                      {add(new Date(conflictIndexMap[index]?.startTime ?? ''), {
                        minutes: 8,
                      }).toLocaleTimeString('en-US', {
                        timeStyle: 'short',
                      })}
                      )
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
