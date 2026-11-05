import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, useReducedMotion } from "motion/react";
import {
  Play,
  Pause,
  Ellipsis,
  Link2,
  RotateCcw,
  Maximize2,
  Minimize2,
  Unlink,
  Check,
} from "lucide-react";
import { Action, Choices } from "./compact-composer";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { TooltipProvider } from "./components/ui/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./components/ui/popover";

function Timer({ timer, remaining, minutes, tasks, act }) {
  const [menu, setMenu] = useState(false),
    [links, setLinks] = useState(false),
    [expanded, expand] = useState(false);
  const [draft, setDraft] = useState(""),
    [error, setError] = useState("");
  const reduced = useReducedMotion();
  const linked = tasks.find((t) => t.id === timer.task);
  const running = Boolean(timer.end) && remaining > 0;
  function configure(e) {
    e.preventDefault();
    const value = Number(draft);
    if (!Number.isInteger(value) || value < 1 || value > 240) {
      setError("Choose 1–240 minutes.");
      return;
    }
    act("duration", value);
    setMenu(false);
  }
  return (
    <TooltipProvider>
      <motion.div
        layout={reduced ? false : "position"}
        transition={{ duration: reduced ? 0 : 0.14 }}
        className={"focus-control" + (expanded ? " is-expanded" : "")}
      >
        <Action
          label={running ? "Pause timer" : "Start timer"}
          onClick={() => act("toggle")}
        >
          {running ? <Pause /> : <Play />}
        </Action>
        <button
          type="button"
          className="clock-readout"
          aria-label={expanded ? "Collapse timer" : "Expand timer"}
          aria-expanded={expanded}
          onClick={() => expand(!expanded)}
        >
          <span>{timer.mode}</span>
          <b role="timer">
            {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, "0")}
          </b>
        </button>
        <Popover open={links} onOpenChange={setLinks}>
          <PopoverTrigger asChild>
            <Button
              className="timer-link"
              variant="ghost"
              size="sm"
              aria-label="Link a task"
              title={linked?.title || "Link a task"}
            >
              <Link2 />
              <span>{linked?.title || "Link task"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="timer-picker">
            <Choices
              placeholder="Find a task to focus on"
              items={tasks
                .filter((t) => !t.done && !t.trashed)
                .map((t) => ({ id: t.id, name: t.title }))}
              choose={(id) => {
                act("link", id);
                setLinks(false);
              }}
            />
            {timer.task && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  act("link", "");
                  setLinks(false);
                }}
              >
                <Unlink />
                Unlink task
              </Button>
            )}
          </PopoverContent>
        </Popover>
        <Popover
          open={menu}
          onOpenChange={(open) => {
            setMenu(open);
            if (open) {
              setDraft(String(minutes));
              setError("");
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Timer options"
              title="Timer options"
            >
              <Ellipsis />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="timer-options">
            <div
              role="group"
              aria-label="Session mode"
              className="compact-choices"
            >
              {["Focus", "Break", "Long break"].map((v) => (
                <Button
                  size="sm"
                  key={v}
                  aria-pressed={v === timer.mode}
                  variant={v === timer.mode ? "secondary" : "ghost"}
                  onClick={() => {
                    if (v !== timer.mode) act("mode", v);
                    setMenu(false);
                  }}
                >
                  {v}
                </Button>
              ))}
            </div>
            <form onSubmit={configure}>
              <label htmlFor="focus-length">Duration (min)</label>
              <Input
                type="number"
                id="focus-length"
                min="1"
                max="240"
                required
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button
                size="icon"
                aria-label="Apply duration"
                title="Apply duration"
              >
                <Check />
              </Button>
            </form>
            {error && <small role="alert">{error}</small>}
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  act("reset");
                  setMenu(false);
                }}
              >
                <RotateCcw />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  expand(!expanded);
                  setMenu(false);
                }}
              >
                {expanded ? <Minimize2 /> : <Maximize2 />}
                {expanded ? "Collapse" : "Expand"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>
    </TooltipProvider>
  );
}
let root;
export function renderFocus(props) {
  root ??= createRoot(document.getElementById("timer"));
  root.render(<Timer {...props} />);
}
