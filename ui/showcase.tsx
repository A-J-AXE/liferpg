import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { CalendarDays, Check, Ellipsis, Info, Search } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Field, FieldLabel } from "./components/ui/field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "./components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./components/ui/dropdown-menu";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { Calendar } from "./components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from "./components/ui/command";
import { Progress } from "./components/ui/progress";

function Showcase() {
  const [title, setTitle] = React.useState("Calibrate wrist joint"),
    [draft, setDraft] = React.useState(title),
    [date, setDate] = React.useState<Date | undefined>(new Date()),
    [done, setDone] = React.useState(false),
    [priority, setPriority] = React.useState("Goal"),
    [editing, edit] = React.useState(false),
    [commands, command] = React.useState(false),
    [picker, pick] = React.useState(false);
  const xp = done ? 60 : 35;
  return (
    <TooltipProvider>
      <div className="showcase">
        <p className="spec-intro">
          Planner controls in Light and Black. Try the sample task; changes here
          stay in this preview.
        </p>
        <Tabs defaultValue="planning">
          <TabsList aria-label="Component groups">
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="rewards">Progress</TabsTrigger>
          </TabsList>
          <TabsContent value="planning">
            <Card>
              <CardHeader>
                <CardTitle>Robotic arm</CardTitle>
                <CardDescription>Project task · Robotics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="spec-task" data-priority={priority}>
                  <div>
                    <strong>{title}</strong>
                    <p>
                      {priority} · {date?.toLocaleDateString() || "Unscheduled"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Set priority"
                      >
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        {["None", "Low", "Medium", "High", "Goal"].map((v) => (
                          <DropdownMenuItem
                            key={v}
                            onSelect={() => setPriority(v)}
                          >
                            {v}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
              <CardFooter className="flex-wrap gap-2">
                <Dialog open={editing} onOpenChange={edit}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setDraft(title)}>Edit task</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit sample task</DialogTitle>
                      <DialogDescription>
                        Rename the task in the design preview.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (draft.trim()) {
                          setTitle(draft.trim());
                          edit(false);
                        }
                      }}
                    >
                      <Field>
                        <FieldLabel htmlFor="sample-title">
                          Task title
                        </FieldLabel>
                        <Input
                          id="sample-title"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          required
                          autoFocus
                        />
                      </Field>
                      <DialogFooter className="mt-4">
                        <Button type="submit">Save task</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Popover open={picker} onOpenChange={pick}>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarDays data-icon="inline-start" />
                      Choose date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(v) => {
                        setDate(v);
                        pick(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" onClick={() => command(true)}>
                  <Search data-icon="inline-start" />
                  Commands
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Robotics</CardTitle>
                <CardDescription>Level 1 · skill XP</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress
                  className="xp-track"
                  aria-label="Robotics experience"
                  value={xp}
                />
                <div className="meter-scale">
                  <span>{xp} / 100 XP</span>
                  <span>Level 2</span>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button onClick={() => setDone(!done)}>
                  <Check data-icon="inline-start" />
                  {done ? "Undo completion" : "Complete sample task"}
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Reward details"
                    >
                      <Info />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    One completion grants 25 XP. Undo removes it.
                  </TooltipContent>
                </Tooltip>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        <CommandDialog
          open={commands}
          onOpenChange={command}
          title="Sample task commands"
        >
          <CommandInput placeholder="Find a command" />
          <CommandList>
            <CommandEmpty>No matching command</CommandEmpty>
            <CommandGroup heading="Project task">
              <CommandItem
                onSelect={() => {
                  command(false);
                  setDraft(title);
                  edit(true);
                }}
              >
                Rename task
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  command(false);
                  pick(true);
                }}
              >
                Schedule task
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </TooltipProvider>
  );
}
class ShowcaseElement extends HTMLElement {
  root?: Root;
  connectedCallback() {
    this.root = createRoot(this);
    this.root.render(<Showcase />);
  }
  disconnectedCallback() {
    this.root?.unmount();
  }
}
customElements.define("lifeos-showcase", ShowcaseElement);
