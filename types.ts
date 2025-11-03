export type Status = 'idle' | 'recording' | 'recorded' | 'transcribing' | 'transcribed' | 'summarizing' | 'summarized' | 'error';

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  status: Status;
  audioDataUrl: string | null;
  transcription: string;
  summaryPoints: string[];
  error: string | null;
}
