import { Suspense } from "react";
import { connection } from "next/server";
import { getSnapshot } from "@/lib/prints";
import { QueueClient } from "./QueueClient";

async function QueueData() {
  // The wall changes with every visitor, so never prerender it.
  await connection();
  let snapshot;
  try {
    snapshot = await getSnapshot();
  } catch (error) {
    // Without a reachable database the rest of the page should still render.
    console.error("Print queue unavailable:", error);
    return (
      <p role="status" className="max-w-[46ch] text-lg text-ink-soft">
        The press is offline right now. The wall will be back soon.
      </p>
    );
  }
  return <QueueClient initial={snapshot} />;
}

function QueueSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-6" aria-busy>
      <div className="col-span-12 h-80 animate-pulse bg-paper-shade lg:col-span-4" />
      <div className="col-span-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-8 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse bg-paper-shade" />
        ))}
      </div>
    </div>
  );
}

export function PrintQueue() {
  return (
    <section id="queue" aria-labelledby="queue-title" className="relative px-4 py-[14vh] sm:px-8">
      <div className="mb-14 grid grid-cols-12 gap-x-6">
        <h2
          id="queue-title"
          className="col-span-12 font-display text-display font-extrabold font-width-[58] lg:col-span-7"
        >
          The print queue
        </h2>
        <p className="col-span-12 mt-5 max-w-[46ch] self-end text-lg lg:col-span-5 lg:mt-0">
          Write one line and pick an ink. It goes on the wall below for everyone who visits, and anyone
          can pull another copy of something they like. The wall updates on its own every few seconds.
        </p>
      </div>
      <Suspense fallback={<QueueSkeleton />}>
        <QueueData />
      </Suspense>
    </section>
  );
}
