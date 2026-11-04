import * as React from "react";
import { CalendarDays, Check, Clock3, Ellipsis, Pencil, Trash2 } from "lucide-react";
import { Button } from "./components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./components/ui/tooltip";
import { Progress } from "./components/ui/progress";

export type LifeOSPriority = "None" | "Low" | "Medium" | "High" | "Goal";
export type LifeOSTask = {
  id: string;
  title: string;
  project: string;
  minutes: number;
  priority: LifeOSPriority;
  done: boolean;
  date?: string;
};

export function ShortcutKey({ children }: { children: React.ReactNode }) {
  return <kbd className="lo-kbd">{children}</kbd>;
}

export function IconAction({
  label,
  icon: Icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="lo-icon-action"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          <Icon size={15} aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  );
}

export function PaneHeading({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="lo-pane-heading">
      <div className="lo-pane-title">
        <h2>{title}</h2>
        {subtitle && <span className="lo-pane-subtitle">{subtitle}</span>}
      </div>
      {actions && <div className="lo-pane-actions">{actions}</div>}
    </div>
  );
}

export function LifeOSTaskRow({
  task,
  onToggle,
  onEdit,
  onSchedule,
  onPriority,
  onRemove,
}: {
  task: LifeOSTask;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onSchedule: (id: string) => void;
  onPriority: (id: string, priority: LifeOSPriority) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="lo-task-row" role="group" aria-label={"Task: " + task.title} data-done={task.done} data-priority={task.priority}>
      <label className="lo-task-check">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
          aria-label={"Complete " + task.title}
        />
        <span aria-hidden="true"><Check size={11} /></span>
      </label>
      <div className="lo-task-content">
        <button type="button" className="lo-task-title" onClick={() => onEdit(task.id)}>
          {task.title}
        </button>
        <div className="lo-task-meta">
          <span>{task.project}</span>
          <span aria-hidden="true">·</span>
          <Clock3 size={11} aria-hidden />
          <span>{task.minutes} min</span>
          {task.priority !== "None" && (
            <span className="lo-priority" data-level={task.priority}>{task.priority}</span>
          )}
          {task.date && <span>{task.date}</span>}
        </div>
      </div>
      <div className="lo-row-actions">
        <IconAction label={"Schedule " + task.title} icon={CalendarDays} onClick={() => onSchedule(task.id)} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="icon-sm" variant="ghost" className="lo-icon-action" aria-label={"More actions for " + task.title}>
              <Ellipsis size={16} aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem onSelect={() => onEdit(task.id)}>
              <Pencil size={14} aria-hidden /> Edit task
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSchedule(task.id)}>
              <CalendarDays size={14} aria-hidden /> Schedule
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            {(["None", "Low", "Medium", "High", "Goal"] as LifeOSPriority[]).map((priority) => (
              <DropdownMenuItem key={priority} onSelect={() => onPriority(task.id, priority)}>
                {task.priority === priority && <Check size={13} aria-hidden />}
                {priority}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onRemove(task.id)}>
              <Trash2 size={14} aria-hidden /> Remove from preview
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function ExperienceMeter({
  value,
  goal = 100,
  label = "Skill XP",
}: {
  value: number;
  goal?: number;
  label?: string;
}) {
  const bounded = Math.max(0, Math.min(goal, value));
  return (
    <div className="lo-experience">
      <div className="lo-experience-head"><strong>{label}</strong><span>{bounded} / {goal} XP</span></div>
      <Progress value={(bounded / goal) * 100} aria-label={label} className="lo-xp-track" />
    </div>
  );
}
