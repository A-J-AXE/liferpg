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
import { ShortcutKey } from "./lifeos-primitives";
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
} from "lucide-react";

const groups = [
  [
    "Planner",
    [
      [PanelsTopLeft, "Overview"],
      [Inbox, "Inbox"],
      [CalendarDays, "Planner"],
      [ListChecks, "Upcoming"],
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
                      {["Today", "Tasks", ...lists.filter((x) => x !== "Upcoming")].map((x) => item(CalendarDays, x))}
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
                        <FolderOpen size={14} />
                        {f}
                      </div>
                    )}
                    <SidebarMenu>
                      {projects
                        .filter((p) => (p.folder || "") === f)
                        .map((p) => item(Folder, p.name, p.id, p.image))}
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
                <ShortcutKey>Ctrl K</ShortcutKey>
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
