import React from "react";
import { createRoot } from "react-dom/client";
import { Sprout, Swords, Target, Plus, MoreHorizontal } from "lucide-react";
import { Artwork, InlineName } from "./entity-controls";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./components/ui/dropdown-menu";
function Add({ action, children }) {
  return (
    <Button variant="outline" size="sm" data-act={action}>
      <Plus />
      {children}
    </Button>
  );
}
function Skills({ ctx }) {
  return (
    <>
      <Add action="newSkill">New skill</Add>
      <div className="entity-grid">
        {ctx.skills.map((skill) => (
          <article className="entity-tile" key={skill.name}>
            <header>
              <Artwork
                entity={skill}
                fallback={Target}
                read={ctx.readPicture}
                change={(art) => ctx.skillArt(skill.name, art)}
              />
              <InlineName
                label="Rename skill"
                value={skill.name}
                change={(name) => ctx.skillRename(skill.name, name)}
              />
            </header>
            <button
              type="button"
              className="entity-detail"
              data-act="nav"
              data-key={"Skill / " + skill.name}
              aria-label={"Open " + skill.name}
            >
              <small>
                Lv {Math.floor(skill.xp / ctx.limit) + 1} ·{" "}
                {skill.xp % ctx.limit} / {ctx.limit} XP
              </small>
              <Progress
                className="xp-track"
                aria-label={skill.name + " progress"}
                value={((skill.xp % ctx.limit) / ctx.limit) * 100}
              />
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
function Habits({ ctx }) {
  return (
    <>
      {[
        ["Growth", ctx.habits, Sprout, "habit"],
        ["Battle", ctx.battles, Swords, "newBattle"],
      ].map(([kind, rows, Icon, action]) => (
        <section key={kind}>
          <header className="entity-identity">
            <Icon size={16} />
            <h2>{kind}</h2>
            <Add action={action}>
              {kind === "Growth" ? "New habit" : "Add bad habit"}
            </Add>
          </header>
          <div className="entity-grid">
            {rows.map((h) => {
              const growth = kind === "Growth";
              return (
                <article className="entity-tile" key={h.id}>
                  <header>
                    <Artwork
                      entity={h}
                      fallback={Icon}
                      read={ctx.readPicture}
                      change={(art) => ctx.habitPatch(h, { art })}
                    />
                    <InlineName
                      label="Rename habit"
                      value={growth ? h.title : h.name}
                      change={(name) =>
                        ctx.habitPatch(h, growth ? { title: name } : { name })
                      }
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          type="button"
                          variant="ghost"
                          aria-label="Habit settings"
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {growth ? (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              Linked skill
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {ctx.skills.map((s) => (
                                <DropdownMenuItem
                                  key={s.name}
                                  onSelect={() =>
                                    ctx.habitPatch(h, { skill: s.name })
                                  }
                                >
                                  {s.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        ) : (
                          <DropdownMenuItem
                            onSelect={() => ctx.battleStatus(h, "")}
                          >
                            Clear today's outcome
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </header>
                  {growth ? (
                    <>
                      <p>
                        <small>
                          {h.checked ? "Checked in today" : "Ready to check in"}{" "}
                          · {h.streak} day streak
                        </small>
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        data-act="check"
                        data-key={h.id}
                      >
                        {h.checked ? "Undo check-in" : "Check in"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>
                        <small>
                          {h.status === "occurred"
                            ? "Occurred today"
                            : h.status === "avoided"
                              ? "Avoided today"
                              : "No outcome today"}{" "}
                          · {h.log?.length || 0} recorded lapses
                        </small>
                      </p>
                      <div className="entity-identity">
                        <Button
                          size="sm"
                          variant={
                            h.status === "avoided" ? "secondary" : "outline"
                          }
                          aria-pressed={h.status === "avoided"}
                          onClick={() => ctx.battleStatus(h, "avoided")}
                        >
                          Avoided
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            h.status === "occurred" ? "secondary" : "outline"
                          }
                          aria-pressed={h.status === "occurred"}
                          onClick={() => ctx.battleStatus(h, "occurred")}
                        >
                          Occurred
                        </Button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
let host, root;
export function renderEntityWorkspace(node, view, ctx) {
  if (host !== node) {
    root?.unmount();
    host = node;
    root = createRoot(node);
  }
  root.render(view === "Skills" ? <Skills ctx={ctx} /> : <Habits ctx={ctx} />);
}
