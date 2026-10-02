import { useState } from "react";
import { Avatar } from "./Avatar";
export type Supporter = {
  id: string;
  supporterName: string;
  supporterAvatarUrl: string | null;
  amount: number;
  specialMessage: string | null;
  createdAt: Date;
};

export function RecentSupporters({
  supporters,
  creatorName,
}: {
  supporters: Supporter[];
  creatorName: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleSupporters = showAll ? supporters : supporters.slice(0, 3);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-black font-medium mb-3">Recent Supporters</p>
      {supporters.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-gray-400">
          <span className="text-3xl">♥</span>
          <p className="text-sm">Be the first one to support {creatorName}</p>
        </div>
      ) : (
        <>
          {visibleSupporters.map((s) => (
            <div key={s.id} className="flex gap-3 py-2">
              <Avatar
                name={s.supporterName}
                url={s.supporterAvatarUrl}
                size={36}
              />
              <div>
                <p className="text-sm font-medium">
                  {s.supporterName} sent {s.amount} virtual coffees
                </p>
                {s.specialMessage && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.specialMessage}
                  </p>
                )}
              </div>
            </div>
          ))}
          {supporters.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 w-full text-sm text-gray-500 border border-gray-200 rounded-lg py-2 hover:bg-gray-50"
            >
              {showAll ? "Show less ↑" : "See more ↓"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
