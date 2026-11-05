import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, UserRound, Heart, Coins, Sparkles } from "lucide-react";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { Artwork, Identity, InlineName } from "./entity-controls";
const art = {
  Growth:
    "M32 51V26 M32 33C16 33 12 24 13 13c13 0 19 8 19 20 M32 39c0-14 7-23 20-24 0 13-6 24-20 24 M17 49h30l-5 13H22z",
  Battle:
    "M15 13l11 4 23 29-6 6-26-28z M49 13l-11 4-23 29 6 6 26-28z M13 43l12 13 M39 56l12-13",
  Goals:
    "M21 14h22v12c0 12-5 16-11 16s-11-4-11-16z M21 18H12c0 11 3 14 11 16 M43 18h9c0 11-3 14-11 16 M32 42v12 M23 55h18",
  Skills:
    "M12 17c9-2 14-1 20 4 6-5 11-6 20-4v34c-8-2-14-1-20 3-6-4-12-5-20-3z M32 21v33 M18 28l8 2 M38 30l8-2",
  Market:
    "M13 25h38v30H13z M11 25l5-11h32l5 11 M17 25v6h10v-6 M37 25v6h10v-6 M26 55V40h12v15",
  Vault: "M12 18h40v35H12z M21 24h22v23H21z M32 29v13 M26 35h12",
  Energy: "M34 8 16 34h15l-2 21 19-28H34z",
  Diary:
    "M19 12h29v44H19z M15 20h7 M15 28h7 M15 36h7 M15 44h7 M29 25h11 M29 33h11 M29 41h8",
  openGym:
    "M10 27h6v16h-6z M17 22h8v26h-8z M25 32h14v6H25z M39 22h8v26h-8z M48 27h6v16h-6z",
};
const tiles = [
  ["Growth", "Growth", "habits", "sage"],
  ["Battle", "Battle", "habits", "coral"],
  ["Goals", "Goals", "Goals", "gold"],
  ["Skills", "Skills", "Skills", "blue"],
  ["Market", "Marketplace", "Market", "peach"],
  ["Vault", "Coin vault", "Vault", "gold"],
  ["Energy", "Focus", "Focus", "violet"],
  ["Diary", "Journal", "Diary", "peach"],
  ["openGym", "Fitness", "openGym", "teal"],
];
function Illustration({ name }) {
  return (
    <svg viewBox="0 0 64 67" aria-hidden="true">
      <ellipse
        cx="32"
        cy="61"
        rx="24"
        ry="4"
        fill="currentColor"
        opacity=".13"
      />
      <path
        d={art[name]}
        transform="translate(0 3)"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity=".38"
      />
      <path
        d={art[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
function Home({ data, act }) {
  const before = useRef({ xp: data.xp, coins: data.coins }),
    [gain, setGain] = useState(null);
  useEffect(() => {
    const old = before.current;
    before.current = { xp: data.xp, coins: data.coins };
    if (data.xp <= old.xp && data.coins <= old.coins) return;
    setGain({
      xp: Math.max(0, data.xp - old.xp),
      coins: Math.max(0, data.coins - old.coins),
      level: Math.floor(old.xp / data.limit) < Math.floor(data.xp / data.limit),
    });
    const timer = setTimeout(() => setGain(null), 1900);
    return () => clearTimeout(timer);
  }, [data.xp, data.coins, data.limit]);
  const level = 1 + Math.floor(data.xp / data.limit);
  return (
    <div className="rpg-home">
      <section className="rpg-character" aria-label="Character sheet">
        <div className="rpg-caption">
          <Sparkles size={13} /> CHARACTER SHEET
        </div>
        <div className="rpg-portrait">
          <Artwork
            entity={{ art: data.avatar }}
            change={act.avatar}
            read={act.read}
            fallback={UserRound}
          />
        </div>
        <InlineName
          value={data.name}
          change={act.name}
          label="Character name"
        />
        <div className="rpg-level">LEVEL {level}</div>
        <div className="rpg-meter">
          <span>Experience</span>
          <span>{data.xp} total XP</span>
        </div>
        <Progress
          className="xp-track"
          aria-label="Character progress"
          value={((data.xp % data.limit) / data.limit) * 100}
        />
        <small>
          {data.xp % data.limit} / {data.limit} XP to level {level + 1}
        </small>
        <div className="rpg-vitals">
          <Button variant="outline" size="sm" onClick={() => act.go("Vault")}>
            <Coins /> {data.coins} coins
          </Button>
          <span>
            <Heart size={14} /> {data.hp} HP
          </span>
        </div>
        {gain && (
          <div role="status" className="rpg-gain">
            {gain.level ? "Level up! " : ""}
            {gain.xp > 0 && "+ " + gain.xp + " XP "}
            {gain.coins > 0 && "+ " + gain.coins + " coins"}
          </div>
        )}
        {data.objective && <p className="rpg-objective">{data.objective}</p>}
        <div className="rpg-section-title">
          <h2>Skills</h2>
          <Button variant="ghost" size="sm" onClick={() => act.go("Skills")}>
            View all
          </Button>
        </div>
        {data.skills.slice(0, 5).map((skill) => (
          <button
            type="button"
            className="rpg-skill"
            key={skill.name}
            onClick={() => act.go("Skill / " + skill.name)}
          >
            <span className="rpg-skill-name">
              <Identity entity={skill} />
              {skill.name}
            </span>
            <small>Lv {1 + Math.floor(skill.xp / data.limit)}</small>
            <Progress
              aria-label={skill.name + " progress"}
              className="xp-track"
              value={((skill.xp % data.limit) / data.limit) * 100}
            />
          </button>
        ))}
      </section>
      <section className="rpg-main">
        <div className="rpg-section-title">
          <h2>Your world</h2>
          <Button variant="outline" size="sm" onClick={() => act.go("Today")}>
            Open Today <ArrowUpRight />
          </Button>
        </div>
        <div className="rpg-tiles">
          {tiles.map(([icon, title, target, tone]) => (
            <button
              key={icon}
              type="button"
              className={"rpg-tile tone-" + tone}
              onClick={() => act.go(target, icon)}
            >
              <Illustration name={icon} />
              <span>{title}</span>
              <ArrowUpRight size={13} className="rpg-tile-arrow" />
            </button>
          ))}
        </div>
        <section className="rpg-daily">
          <h2>Today’s check-ins</h2>
          <div className="rpg-checkins">
            <div>
              <h3>Growth</h3>
              {data.habits.length === 0 && <small>No Growth habits yet.</small>}
              {data.habits.slice(0, 4).map((h) => (
                <div className="rpg-check" key={h.id}>
                  <span>{h.title}</span>
                  <Button
                    variant={h.checked ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => act.check(h.id)}
                  >
                    {h.checked ? "Undo check-in" : "Check in"}
                  </Button>
                </div>
              ))}
            </div>
            <div>
              <h3>Battle</h3>
              {data.battles.length === 0 && (
                <small>No Battle habits yet.</small>
              )}
              {data.battles.slice(0, 4).map((h) => (
                <div className="rpg-check" key={h.id}>
                  <span>{h.name}</span>
                  <div>
                    <Button
                      variant={h.status === "avoided" ? "secondary" : "ghost"}
                      aria-pressed={h.status === "avoided"}
                      size="sm"
                      onClick={() => act.battle(h, "avoided")}
                    >
                      Avoided
                    </Button>
                    <Button
                      variant={h.status === "occurred" ? "secondary" : "ghost"}
                      aria-pressed={h.status === "occurred"}
                      size="sm"
                      onClick={() => act.battle(h, "occurred")}
                    >
                      Occurred
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
      <section className="rpg-activity" aria-label="Recent activity">
        <div className="rpg-caption">
          <Sparkles size={13} /> ACTIVITY JOURNAL
        </div>
        <h2>Recent activity</h2>
        {!data.events.length && (
          <p className="rpg-empty">
            Your completed tasks, check-ins and workouts will appear here.
          </p>
        )}
        <ol>
          {data.events.map((e) => (
            <li key={e.id}>
              <i aria-hidden />
              <div>
                <small>
                  {e.kind}
                  {e.at &&
                    " · " +
                      new Date(e.at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                </small>
                {e.route ? (
                  <button type="button" onClick={() => act.go(e.route)}>
                    {e.title}
                  </button>
                ) : (
                  <strong>{e.title}</strong>
                )}
                {(e.xp > 0 || e.coins > 0) && (
                  <span>
                    {e.xp > 0 ? "+ " + e.xp + " XP " : ""}
                    {e.coins > 0 ? "+ " + e.coins + " coins" : ""}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
        <Button variant="ghost" size="sm" onClick={() => act.go("Journal")}>
          Open activity journal <ArrowUpRight />
        </Button>
      </section>
    </div>
  );
}
let host, root;
export function renderRpg(node, data, act) {
  if (node !== host) {
    root?.unmount();
    host = node;
    root = createRoot(node);
  }
  root.render(<Home data={data} act={act} />);
}
