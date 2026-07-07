export default function Home() {
  return (
    <div className="max-w-xl text-center space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Quantum Living Solutions</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Our premium IoT and home automation platform is currently under engineering development.
      </p>
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-sm">
        <p className="font-medium text-amber-800 dark:text-amber-400">
          Cinematic Scroll Experience Coming Soon
        </p>
        <p className="text-zinc-500 mt-1">
          WebGL architectural views, day-to-night lighting transitions, and smart space controllers will be introduced in subsequent release phases.
        </p>
      </div>
    </div>
  );
}
export const dynamic = "force-static";
