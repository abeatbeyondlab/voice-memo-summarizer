interface ProcessEnv {
    readonly NEXT_PUBLIC_ELEVENLABS_API_KEY: string;
}

interface Process {
    readonly env: ProcessEnv;
}

declare var process: Process;
