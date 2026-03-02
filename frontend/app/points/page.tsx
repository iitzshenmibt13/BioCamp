"use client";
import Link from "next/link";
import { CamperLayout } from "@/components/CamperLayout";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import { MOCK_GROUPS, MOCK_USER_CAMPER } from "@/lib/mock";

export default function PointsPage() {
    const user = MOCK_USER_CAMPER;
    const sorted = [...MOCK_GROUPS].sort((a, b) => b.totalPoints - a.totalPoints);
    const top3 = sorted.slice(0, 3);
    const myGroup = sorted.find(g => g.id === user.groupId);

    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
    const podiumHeights = [80, 108, 60];
    const podiumLabels = ["2nd", "1st", "3rd"];

    return (
        <CamperLayout title="Points" user={user} showBell noPad>
            <div className="pb-24 pt-4 space-y-4">

                {/* ── PODIUM ── */}
                <div className="px-4">
                    <div className="card p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 text-center">Leaderboard</p>
                        <div className="flex items-end justify-center gap-3">
                            {podiumOrder.map((group, i) => {
                                if (!group) return <div key={i} className="w-24" />;
                                const style = group.color;
                                return (
                                    <div key={group.id} className="flex flex-col items-center gap-1 w-24">
                                        <span className="text-[10px] font-bold text-gray-500">{podiumLabels[i]}</span>
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold"
                                            style={{ background: style }}>
                                            {group.name.split(" ")[1]?.[0]}
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-800 text-center leading-tight">{group.name}</p>
                                        <div className="w-full rounded-t-xl flex items-center justify-center text-white text-xs font-bold"
                                            style={{ height: podiumHeights[i], background: style + "30", border: `2px solid ${style}40` }}>
                                            <span style={{ color: style }} className="font-bold text-[13px]">{group.totalPoints.toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── FULL RANKING ── */}
                <div className="px-4">
                    <div className="card overflow-hidden">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 pt-3 pb-2">Full Ranking</p>
                        {sorted.map((group, i) => (
                            <LeaderboardRow key={group.id} group={group} rank={i + 1} isMyGroup={group.id === user.groupId} />
                        ))}
                    </div>
                </div>

                {/* ── MY GROUP CARD ── */}
                {myGroup && (
                    <div className="px-4">
                        <div className="card p-4 border-2" style={{ borderColor: myGroup.color + "50", background: myGroup.color + "08" }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500">My Group</p>
                                    <p className="text-base font-bold mt-0.5" style={{ color: myGroup.color }}>{myGroup.name}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{myGroup.totalPoints.toLocaleString()} pts</p>
                                    <p className="text-xs text-success font-medium mt-0.5">+{myGroup.todayPoints} today</p>
                                </div>
                                <div className="text-4xl">{sorted.indexOf(myGroup) === 0 ? "🥇" : sorted.indexOf(myGroup) === 1 ? "🥈" : sorted.indexOf(myGroup) === 2 ? "🥉" : `#${sorted.indexOf(myGroup) + 1}`}</div>
                            </div>
                            <Link href="/points/log"
                                className="btn btn-ghost w-full mt-3 text-sm" style={{ color: myGroup.color, borderColor: myGroup.color + "40" }}>
                                View Points Log →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </CamperLayout>
    );
}
