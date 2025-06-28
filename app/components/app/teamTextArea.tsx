import { useEffect, useState } from 'react';

import { Textarea } from '~/components/ui/textarea';
import { useAppStore } from '~/lib/store';

export default function TeamTextArea() {
  const store = useAppStore();
  const [input, setInput] = useState(store.teamKeys.join('\n'));

  useEffect(() => {
    if (input === '') {
      setInput(store.teamKeys.join('\n'));
    }
  }, [store.teamKeys]);

  useEffect(() => {
    const newKeys = input.split('\n').filter((key) => key.length > 0);
    store.setTeamKeys(newKeys);
  }, [input]);

  return (
    <Textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      className="h-[200px] w-[6rem]"
    />
  );
}
