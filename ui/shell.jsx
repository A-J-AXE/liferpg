import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./components/ui/dropdown-menu";
export { renderEntityWorkspace } from "./entity-workspaces";
import { Artwork, InlineName } from "./entity-controls";
export { workspace } from "./workspaces";
export { renderRpg } from "./rpg-home";
export { backupLegacy } from "./planning-backup.mjs";
export { plan, applyPlan } from "./planning.mjs";
export { openComposer, openProjectPicker } from "./compact-composer";
export { renderFocus } from "./compact-timer";
export { searchTasks } from "./planner-controls";
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Progress } from "./components/ui/progress";
import { Button } from "./components/ui/button";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "./components/ui/sidebar";
import "./showcase";
import {
  PanelsTopLeft,
  Inbox,
  CalendarDays,
  ListChecks,
  Folders,
  Dumbbell,
  ChartNoAxesColumnIncreasing,
  Flame,
  BookOpen,
  Store,
  Settings,
  Folder,
  FolderOpen,
  Plus,
  Sun,
  Moon,
  Search,
  PanelLeft,
  Layers2,
  ChevronRight,
} from "lucide-react";

const groups = [
  [
    "Planner",
    [
      [PanelsTopLeft, "Overview"],
      [Inbox, "Inbox"],
      [CalendarDays, "Today"],
      [CalendarDays, "Planner"],
      [Layers2, "Upcoming"],
      [ListChecks, "Tasks"],
      [ListChecks, "Completed tasks"],
      [Folders, "Projects"],
    ],
  ],
  [
    "Progress",
    [
      [ChartNoAxesColumnIncreasing, "Skills"],
      [Flame, "Habits"],
      [BookOpen, "Diary"],
      [Store, "Market"],
    ],
  ],
  ["Training", [[Dumbbell, "openGym"]]],
];
function Navigation({
  view,
  projects,
  count,
  theme,
  onTheme,
  onProject,
  projectChange,
  folders,
  folderChange,
  readPicture,
  lists,
}) {
  const { open, isMobile, setOpenMobile, toggleSidebar } = useSidebar();
  useEffect(() => {
    document.body.classList.toggle("compact", !open);
  }, [open]);
  const item = (Icon, name, key = name, photo) => (
    <SidebarMenuItem key={key}>
      <SidebarMenuButton
        tooltip={name}
        isActive={view === key}
        aria-current={view === key ? "page" : undefined}
        aria-label={name}
        data-act="nav"
        data-key={key}
        onClick={() => setOpenMobile(false)}
      >
        {photo ? (
          <img className="project-thumb" alt="" src={photo} />
        ) : (
          <Icon aria-hidden />
        )}
        <span>{name}</span>
        {name === "Inbox" && <small className="count">{count}</small>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
  return (
    <>
      {isMobile && (
        <Button
          className="mobile-navigation"
          variant="ghost"
          aria-label="Toggle navigation"
          onClick={toggleSidebar}
        >
          <PanelLeft /> LifeOS
        </Button>
      )}
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="workspace-brand">
            <Layers2 />
            <strong>LifeOS</strong>
          </div>
          <SidebarTrigger
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          />
        </SidebarHeader>
        <SidebarContent>
          <nav id="nav" aria-label="Workspace">
            {groups.map(([label, items]) => (
              <SidebarGroup key={label}>
                <SidebarGroupLabel>{label}</SidebarGroupLabel>
                <SidebarMenu>
                  {items.map(([icon, name]) => item(icon, name))}
                </SidebarMenu>
                {label === "Planner" && (
                  <details className="more-views">
                    <summary>More views</summary>
                    <SidebarMenu>
                      {lists
                        .filter((x) => x !== "Upcoming")
                        .map((x) => item(CalendarDays, x))}
                    </SidebarMenu>
                  </details>
                )}
              </SidebarGroup>
            ))}
          </nav>
          <SidebarGroup>
            <SidebarGroupLabel>My projects</SidebarGroupLabel>
            <SidebarGroupAction
              id="newProject"
              title="New project"
              aria-label="New project"
              onClick={() => {
                setOpenMobile(false);
                onProject();
              }}
            >
              <Plus />
            </SidebarGroupAction>
            <div id="projects">
              {Array.from(new Set(projects.map((p) => p.folder || ""))).map(
                (f) => (
                  <div key={f}>
                    {f && (
                      <div className="folder-name">
                        <Artwork
                          entity={{ art: folders?.[f] }}
                          fallback={FolderOpen}
                          read={readPicture}
                          change={(art) => folderChange(f, { art })}
                        />
                        <InlineName
                          value={f}
                          label="Rename folder"
                          change={(name) => folderChange(f, { name })}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button aria-label={"Folder actions for " + f}>
                              ⋯
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onSelect={() => folderChange(f, { name: "" })}
                            >
                              Remove folder (keep projects)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    <SidebarMenu>
                      {projects
                        .filter((p) => (p.folder || "") === f)
                        .map((p) => (
                          <SidebarMenuItem
                            key={p.id}
                            className="sidebar-project"
                            data-active={view === p.id}
                          >
                            <Artwork
                              entity={p}
                              read={readPicture}
                              change={(art) =>
                                projectChange(p, {
                                  art,
                                  image: art?.kind === "image" ? art.value : "",
                                })
                              }
                            />
                            <InlineName
                              value={p.name}
                              label="Rename project"
                              change={(name) => projectChange(p, { name })}
                            />
                            <SidebarMenuButton
                              tooltip={"Open " + p.name}
                              aria-label={p.name}
                              aria-current={view === p.id ? "page" : undefined}
                              data-act="nav"
                              data-key={p.id}
                              onClick={() => setOpenMobile(false)}
                            >
                              <ChevronRight />
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                  </div>
                ),
              )}
            </div>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Search"
                aria-label="Search"
                data-act="search"
                onClick={() => setOpenMobile(false)}
              >
                <Search />
                <span>Search</span>
                <kbd>Ctrl K</kbd>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {item(Settings, "Settings")}
          </SidebarMenu>
          <Button
            variant="outline"
            id="theme"
            aria-label={"◐ " + theme + " mode"}
            title="Switch theme"
            onClick={onTheme}
          >
            <span data-selected={theme === "Light"}>
              <Sun size={14} /> Light
            </span>
            <span data-selected={theme === "Black"}>
              <Moon size={14} /> Black
            </span>
          </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
let side;
export function renderSidebar(props) {
  side ??= createRoot(document.querySelector("aside"));
  side.render(
    <SidebarProvider
      style={{ "--sidebar-width": "228px", "--sidebar-width-icon": "56px" }}
    >
      <Navigation {...props} />
    </SidebarProvider>,
  );
}
const readings = new Map();
function Meter({ label, value, max, total }) {
  const indicator = React.useRef(null);
  const offset = (n) => "translateX(" + ((n / max) * 100 - 100) + "%)";
  React.useLayoutEffect(() => {
    const previous = readings.get(label);
    readings.set(label, { total, max });
    if (
      !previous ||
      total <= previous.total ||
      previous.max !== max ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.effects === "off"
    )
      return;
    const sameLevel =
      Math.floor(total / max) === Math.floor(previous.total / max);
    indicator.current
      .querySelector("[data-slot=progress-indicator]")
      .animate(
        [
          { transform: offset(sameLevel ? previous.total % max : 0) },
          { transform: offset(value) },
        ],
        { duration: 360, easing: "ease-out" },
      );
  }, [label, total, value, max]);
  return (
    <div ref={indicator}>
      <Progress
        className="xp-track"
        value={(value / max) * 100}
        aria-label={label}
        getValueLabel={() => value + " / " + max + " XP"}
      />
    </div>
  );
}
class XpMeter extends HTMLElement {
  connectedCallback() {
    this.root = createRoot(this);
    this.root.render(
      <Meter
        label={this.dataset.label}
        value={Number(this.dataset.value)}
        total={Number(this.dataset.total)}
        max={Number(this.dataset.max)}
      />,
    );
  }
  disconnectedCallback() {
    this.root?.unmount();
  }
}
customElements.define("xp-meter", XpMeter);
