import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Folder,
  Palette,
  GraduationCap,
  Circle,
  Clock3,
  CircleCheck,
  Check,
  Plus,
} from "lucide-react";
import { Artwork, Identity } from "./entity-controls";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "./components/ui/dropdown-menu";
export function ProjectIconButton({ label, hint, children, ...props }) {
  return (
    <Button
      size="icon"
      variant="ghost"
      type="button"
      className="project-icon-control"
      aria-label={label}
      title={hint ? label + ": " + hint : label}
      {...props}
    >
      {children}
    </Button>
  );
}
export function OptionMenu({ label, value, options, change, children }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ProjectIconButton
          label={label}
          hint={options.find((o) => o.value === value)?.label}
        >
          {children}
        </ProjectIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => change(option.value)}
          >
            {option.icon}
            {option.label}
            {value === option.value && (
              <Check className="ml-auto" aria-label="Selected" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
const stages = [
  { value: "Inbox", label: "Not started", Icon: Circle, tone: "idle" },
  { value: "In progress", label: "In progress", Icon: Clock3, tone: "active" },
  { value: "Completed", label: "Completed", Icon: CircleCheck, tone: "done" },
];
export function ProjectProperties({ project, change, folders, skills }) {
  const [folderOpen, setFolderOpen] = useState(false),
    [folderName, setFolderName] = useState("");
  const [skillOpen, setSkillOpen] = useState(false),
    [skillName, setSkillName] = useState("");
  const stage = stages.find((s) => s.value === project.stage) || stages[0];
  const chooseFolder = (folder) => {
    change({ folder });
    setFolderOpen(false);
    setFolderName("");
  };
  const chooseSkill = (skill) => {
    change({ skill });
    setSkillOpen(false);
    setSkillName("");
  };
  return (
    <div className="project-property-row project-icon-strip">
      <Popover open={folderOpen} onOpenChange={setFolderOpen}>
        <PopoverTrigger asChild>
          <ProjectIconButton
            label="Project folder"
            hint={project.folder || "No folder"}
          >
            <Identity
              entity={folders.find((f) => f.name === project.folder)}
              fallback={Folder}
            />
          </ProjectIconButton>
        </PopoverTrigger>
        <PopoverContent align="start" className="project-picker">
          <strong>Project folder</strong>
          {[{ name: "", art: null }, ...folders].map((f) => (
            <Button
              key={f.name}
              variant="ghost"
              size="sm"
              aria-pressed={project.folder === f.name}
              onClick={() => chooseFolder(f.name)}
            >
              <Identity entity={f} fallback={Folder} />
              {f.name || "No folder"}
            </Button>
          ))}
          <div className="project-picker-entry">
            <Input
              aria-label="Folder name"
              placeholder="New folder"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (folderName.trim()) chooseFolder(folderName.trim());
                }
              }}
            />
            <ProjectIconButton
              label="Use new folder"
              disabled={!folderName.trim()}
              onClick={() => chooseFolder(folderName.trim())}
            >
              <Plus />
            </ProjectIconButton>
          </div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <ProjectIconButton label="Project color">
            <Palette style={{ color: project.color }} />
          </ProjectIconButton>
        </PopoverTrigger>
        <PopoverContent align="start" className="project-picker">
          <label>
            Project color
            <Input
              aria-label="Choose project color"
              type="color"
              value={project.color || "#74669e"}
              onChange={(e) => change({ color: e.target.value })}
            />
          </label>
        </PopoverContent>
      </Popover>
      <OptionMenu
        label="Stage"
        value={stage.value}
        options={stages.map((s) => ({
          ...s,
          icon: <s.Icon className={"project-stage-" + s.tone} />,
        }))}
        change={(stage) => change({ stage })}
      >
        <stage.Icon className={"project-stage-" + stage.tone} />
      </OptionMenu>
      <Popover open={skillOpen} onOpenChange={setSkillOpen}>
        <PopoverTrigger asChild>
          <ProjectIconButton
            label="Linked skill"
            hint={project.skill || "No linked skill"}
          >
            <GraduationCap />
          </ProjectIconButton>
        </PopoverTrigger>
        <PopoverContent align="start" className="project-picker">
          <strong>Linked skill</strong>
          {["", ...skills].map((skill) => (
            <Button
              key={skill}
              variant="ghost"
              size="sm"
              aria-pressed={project.skill === skill}
              onClick={() => chooseSkill(skill)}
            >
              {skill || "No linked skill"}
            </Button>
          ))}
          <div className="project-picker-entry">
            <Input
              aria-label="Skill name"
              placeholder="New skill"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (skillName.trim()) chooseSkill(skillName.trim());
                }
              }}
            />
            <ProjectIconButton
              label="Use new skill"
              disabled={!skillName.trim()}
              onClick={() => chooseSkill(skillName.trim())}
            >
              <Plus />
            </ProjectIconButton>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
function ProjectEditor({ initial, folders, skills, read, save, close }) {
  const [draft, setDraft] = useState(initial);
  const change = (patch) => setDraft((old) => ({ ...old, ...patch }));
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="project-composer">
        <DialogTitle>{initial.id ? "Edit project" : "New project"}</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.name.trim()) {
              save({ ...draft, name: draft.name.trim() });
              close();
            }
          }}
        >
          <div className="project-composer-name">
            <Artwork
              entity={draft}
              read={read}
              change={(art) =>
                change({ art, image: art?.kind === "image" ? art.value : "" })
              }
            />
            <Input
              aria-label="Project name"
              placeholder="Project name"
              required
              value={draft.name}
              onChange={(e) => change({ name: e.target.value })}
            />
          </div>
          <div className="project-composer-actions">
            <ProjectProperties
              project={draft}
              change={change}
              folders={folders}
              skills={skills}
            />
            <Button type="submit" size="sm" disabled={!draft.name.trim()}>
              {initial.id ? "Save" : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
let root,
  sequence = 0;
export function openProjectEditor(props) {
  if (!root) {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  }
  root.render(
    <ProjectEditor
      key={++sequence}
      {...props}
      close={() => root.render(null)}
    />,
  );
}
