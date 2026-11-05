// PR 01: independent React app shell. No domain fixtures or reward transactions.
// Adapted navigation composition from satnaing/shadcn-admin @ e16c87f:
// src/components/layout/app-sidebar.tsx, header.tsx, command-menu.tsx (MIT).
// License notice: ui/rebuild/UPSTREAM-LICENSE.txt
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Sidebar, SidebarProvider, SidebarTrigger, SidebarContent,
  SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar
} from "../components/ui/sidebar";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem
} from "../components/ui/command";
import { Button } from "../components/ui/button";
import {
  ArrowUpRight, ArrowRight, BookOpenText, CalendarDays, Check,
  ChevronRight, Dumbbell, Flame, FolderKanban, House, Inbox,
  Keyboard, Menu, Moon, PanelLeftClose, Search, Settings2,
  Shield, Sparkles, Store, Sun, Target, TrendingUp, X
} from "lucide-react";

const WORKSPACES = [
  { group: "Plan", items: [
    { id: "home", title: "Home", icon: House, phase: "PR 02" },
    { id: "inbox", title: "Inbox", icon: Inbox, phase: "PR 03" },
    { id: "planner", title: "Planner", icon: CalendarDays, phase: "PR 04" },
    { id: "upcoming", title: "Upcoming", icon: Target, phase: "PR 04" },
    { id: "projects", title: "Projects", icon: FolderKanban, phase: "PR 03" }
  ]},
  { group: "Progress", items: [
    { id: "skills", title: "Skills", icon: TrendingUp, phase: "PR 05" },
    { id: "growth", title: "Growth", icon: Sparkles, phase: "PR 05" },
    { id: "battle", title: "Battle", icon: Shield, phase: "PR 05" },
    { id: "market", title: "Market", icon: Store, phase: "PR 14" }
  ]},
  { group: "Training", items: [
    { id: "fitness", title: "OpenGym", icon: Dumbbell, phase: "PR 06" }
  ]}
];
const ALL = WORKSPACES.flatMap((g) => g.items);
const getWorkspace = (id) => ALL.find((w) => w.id === id) || ALL[0];
const getHash = () => location.hash.replace(/^#\/?/, "") || "home";
const gymUrl = () => window.lifeosHosted
  ? new URL("/gym/", location.origin).href
  : "http://127.0.0.1:5173/";

function AppSidebar({ selected, navigate, launchSearch }) {
  const { open, setOpenMobile } = useSidebar();
  return (
    <Sidebar collapsible="icon" className="lo-sidebar">
      <SidebarHeader className="lo-sidebar-head">
        <div className="lo-brand">
          <span className="lo-brand-mark" aria-hidden="true"><Sparkles size={18}/></span>
          <span className="lo-brand-copy"><strong>LifeOS</strong><small>PERSONAL SPACE</small></span>
        </div>
      </SidebarHeader>
      <SidebarContent className="lo-sidebar-scroll">
        <nav aria-label="Main navigation">
          {WORKSPACES.map((group) => (
            <SidebarGroup key={group.group} className="lo-nav-group">
              <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map(({ id, icon: Icon, title }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={selected === id}
                      tooltip={title}
                      aria-label={title}
                      aria-current={selected === id ? "page" : undefined}
                      onClick={() => { navigate(id); setOpenMobile(false); }}
                    >
                      <Icon aria-hidden="true" size={18}/><span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className="lo-sidebar-foot">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Search" aria-label="Search" onClick={launchSearch}>
              <Search size={18}/><span>Search</span><kbd className="lo-sidebar-key">⌘ K</kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={selected === "settings"} tooltip="Settings"
              aria-label="Settings" onClick={() => { navigate("settings"); setOpenMobile(false); }}>
              <Settings2 size={18}/><span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={open ? "Collapse sidebar" : "Expand sidebar"}
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
              asChild>
              <SidebarTrigger aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
                className="lo-sidebar-toggle">
                <PanelLeftClose size={17}/><span>{open ? "Collapse" : "Expand"}</span>
              </SidebarTrigger>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="lo-preview-flag">REBUILD PREVIEW · PR 01</div>
      </SidebarFooter>
    </Sidebar>
  );
}

function Header({ selected, onSearch, theme, onTheme }) {
  const workspace = selected === "settings"
    ? { title: "Settings" } : getWorkspace(selected);
  return (
    <header className="lo-header">
      <div className="lo-header-left">
        <SidebarTrigger aria-label="Toggle navigation" className="lo-mobile-trigger"/>
        <span className="lo-crumb">Workspace</span>
        <ChevronRight size={14} aria-hidden="true" className="lo-crumb-arrow"/>
        <strong>{workspace.title}</strong>
      </div>
      <div className="lo-header-actions">
        <Button type="button" variant="outline" className="lo-search-trigger"
          aria-label="Search workspaces" onClick={onSearch}>
          <Search size={16}/><span>Search</span><kbd>Ctrl K</kbd>
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label={
          theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        } title="Toggle theme" onClick={onTheme}>
          {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
        </Button>
        <span className="lo-profile" aria-label="Personal workspace" title="Personal workspace">L</span>
      </div>
    </header>
  );
}

function SearchMenu({ open, onOpenChange, navigate, onTheme }) {
  const execute = (run) => { onOpenChange(false); run(); };
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}
      title="Find a workspace" description="Navigate by typing its name"
      className="lo-command">
      <CommandInput autoFocus placeholder="Search pages or actions…" aria-label="Search pages"/>
      <CommandList>
        <CommandEmpty>No matching workspace.</CommandEmpty>
        {WORKSPACES.map((group) => (
          <CommandGroup heading={group.group} key={group.group}>
            {group.items.map((item) => (
              <CommandItem key={item.id} value={item.title}
                onSelect={() => execute(() => navigate(item.id))}>
                <item.icon size={16}/><span>{item.title}</span><ArrowRight size={14} className="ml-auto"/>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandGroup heading="Actions">
          <CommandItem value="Change theme" onSelect={() => execute(onTheme)}>
            <Sun size={16}/><span>Switch theme</span>
          </CommandItem>
          <CommandItem value="Settings" onSelect={() => execute(() => navigate("settings"))}>
            <Settings2 size={16}/><span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function EmptyWorkspace({ workspace, navigate }) {
  const Icon = workspace.icon;
  return (
    <section className="lo-content" aria-label={workspace.title}>
      <div className="lo-section-label"><span className="lo-label-dot"/>{workspace.phase} · DESIGN STAGE</div>
      <div className="lo-empty">
        <span className="lo-empty-symbol"><Icon size={25} strokeWidth={1.7}/></span>
        <h1>{workspace.title}</h1>
        <p>The new {workspace.title.toLowerCase()} workspace follows after this shell is approved.</p>
        <div className="lo-empty-actions">
          <a className="lo-primary-link" href="/">Use current LifeOS <ArrowUpRight size={15}/></a>
          <button type="button" className="lo-text-link" onClick={() => navigate("home")}>Back to home</button>
        </div>
      </div>
    </section>
  );
}

function Home({ navigate }) {
  return (
    <section className="lo-content lo-home" aria-label="Home">
      <div className="lo-section-label"><span className="lo-label-dot"/>PR 01 · SHELL PREVIEW</div>
      <div className="lo-home-heading">
        <div><p className="lo-overline">YOUR WORKSPACE</p><h1>Make room for progress.</h1>
          <p className="lo-intro">Plan the day. Build your skills. Keep your momentum.</p></div>
        <a href="/" className="lo-current-link">Current LifeOS <ArrowUpRight size={15}/></a>
      </div>
      <div className="lo-home-rule"/>
      <h2 className="lo-section-title">Go to</h2>
      <div className="lo-shortcuts">
        {[
          { id: "planner", detail: "Plan your time" },
          { id: "projects", detail: "Organize the work" },
          { id: "skills", detail: "Track your growth" },
          { id: "fitness", detail: "Train in OpenGym" }
        ].map(({ id, detail }) => {
          const item = getWorkspace(id);
          const Icon = item.icon;
          return <button type="button" key={id} className="lo-shortcut"
            onClick={() => navigate(id)}>
            <span className="lo-shortcut-icon"><Icon size={19}/></span>
            <span><strong>{item.title}</strong><small>{detail}</small></span>
            <ArrowRight size={16} className="lo-shortcut-arrow"/>
          </button>;
        })}
      </div>
      <div className="lo-foundation-note"><Check size={16}/>
        <span>Shell only. No simulated XP, coins, completed tasks or synced data.</span></div>
    </section>
  );
}

function Fitness() {
  const url = gymUrl();
  return (
    <section className="lo-fitness" aria-label="OpenGym">
      <div className="lo-fitness-head"><div><h1>OpenGym</h1><p>Native workout application</p></div>
        <a href={url} target="_blank" rel="noreferrer" className="lo-current-link">
          Open separately <ArrowUpRight size={15}/></a>
      </div>
      <iframe title="Native OpenGym" src={url} className="lo-gym-frame"
        referrerPolicy="same-origin"/>
    </section>
  );
}

function SettingsPage({ theme, onTheme }) {
  return (
    <section className="lo-content" aria-label="Settings">
      <div className="lo-section-label"><span className="lo-label-dot"/>REBUILD PREVIEW</div>
      <h1 className="lo-settings-title">Preferences</h1>
      <div className="lo-setting-row"><div><strong>Appearance</strong>
        <small>Used only by the rebuild preview</small></div>
        <Button variant="outline" onClick={onTheme}>
          {theme === "dark" ? <Moon size={16}/> : <Sun size={16}/>}
          {theme === "dark" ? "Dark" : "Light"}
        </Button>
      </div>
      <div className="lo-setting-row"><div><strong>Current LifeOS</strong>
        <small>Your existing application is unchanged.</small></div>
        <a href="/" className="lo-current-link">Open <ArrowUpRight size={15}/></a>
      </div>
    </section>
  );
}

function App() {
  const [selected, setSelected] = useState(getHash);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("lifeos:rebuild-theme") === "dark" ? "dark" : "light"
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const searchButton = useRef(null);
  useEffect(() => {
    const sync = () => setSelected(getHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("lifeos:rebuild-theme", theme);
  }, [theme]);
  useEffect(() => {
    const shortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const navigate = (id) => {
    location.hash = "/" + id;
    setSelected(id);
  };
  const onTheme = () => setTheme((prev) => prev === "dark" ? "light" : "dark");
  const onSearch = () => setSearchOpen(true);
  const workspace = getWorkspace(selected);
  return (
    <SidebarProvider defaultOpen={true}
      style={{ "--sidebar-width": "234px", "--sidebar-width-icon": "58px" }}
      className="lo-app">
      <AppSidebar selected={selected} navigate={navigate} launchSearch={onSearch}/>
      <div className="lo-main">
        <Header selected={selected} onSearch={onSearch} theme={theme} onTheme={onTheme}/>
        <main id="main-content" className="lo-main-content" tabIndex={-1}>
          {selected === "home" ? <Home navigate={navigate}/> :
           selected === "fitness" ? <Fitness/> :
           selected === "settings" ? <SettingsPage theme={theme} onTheme={onTheme}/> :
           <EmptyWorkspace workspace={workspace} navigate={navigate}/>}
        </main>
      </div>
      <SearchMenu open={searchOpen} onOpenChange={setSearchOpen}
        navigate={navigate} onTheme={onTheme}/>
    </SidebarProvider>
  );
}
createRoot(document.getElementById("lifeos-rebuild")).render(<App/>);
