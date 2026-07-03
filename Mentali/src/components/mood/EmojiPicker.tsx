import React from 'react';

import { MoodFacePicker } from '@/components/mood/MoodFacePicker';
import type { MoodOption } from '@/logic/checkin';

interface Props {
  selectedId?: string | null;
  onSelect: (mood: MoodOption) => void;
  disabled?: boolean;
}

export function EmojiPicker({ selectedId, onSelect, disabled }: Props) {
  return (
    <MoodFacePicker
      selectedId={selectedId}
      onSelect={onSelect}
      disabled={disabled}
      variant="dark"
    />
  );
}
