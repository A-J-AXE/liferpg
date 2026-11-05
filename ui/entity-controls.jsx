import React, { useRef, useState } from "react";
import {
  Folder,
  ImagePlus,
  Search,
  Trash2,
  Target,
  Dumbbell,
  BookOpen,
  Code,
  Swords,
  Sprout,
  Star,
  Heart,
  Flame,
  GraduationCap,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "./components/ui/command";

const icons = {
  Folder,
  Target,
  Dumbbell,
  BookOpen,
  Code,
  Swords,
  Sprout,
  Star,
  Heart,
  Flame,
  GraduationCap,
};
export function Identity({ entity, fallback: Fallback = Folder }) {
  const art = entity?.art;
  if (art?.kind === "image" || (!art && entity?.image))
    return (
      <img className="entity-art" alt="" src={art?.value || entity.image} />
    );
  if (art?.kind === "emoji") return <span aria-hidden>{art.value}</span>;
  const Icon = icons[art?.value] || Fallback;
  return <Icon aria-hidden />;
}
export function InlineName({ value, change, label = "Name" }) {
  const [editing, set] = useState(false),
    [draft, type] = useState(value),
    [error, fail] = useState("");
  const cancel = useRef(false);
  const commit = () => {
    if (cancel.current) {
      cancel.current = false;
      return;
    }
    if (!draft.trim()) {
      fail("A name is required");
      return;
    }
    try {
      if (draft.trim() !== value) change(draft.trim());
      set(false);
      fail("");
    } catch (err) {
      fail(err.message);
    }
  };
  return editing ? (
    <span className="inline-name">
      <Input
        aria-label={label}
        autoFocus
        value={draft}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => type(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            e.stopPropagation();
            cancel.current = true;
            set(false);
            fail("");
          }
        }}
      />
      {error && <small role="alert">{error}</small>}
    </span>
  ) : (
    <button
      className="entity-name"
      type="button"
      title={"Rename " + value}
      aria-label={"Rename " + value}
      onClick={() => {
        type(value);
        set(true);
      }}
    >
      {value}
    </button>
  );
}
export function Artwork({ entity, change, read, fallback }) {
  const [open, toggle] = useState(false),
    [mode, setMode] = useState(""),
    [error, fail] = useState("");
  const input = useRef(null);
  const choose = (v) => {
    change(v);
    toggle(false);
  };
  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        toggle(v);
        setMode("");
        fail("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="entity-art-trigger"
          aria-label="Change image"
        >
          <Identity entity={entity} fallback={fallback} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="entity-picker"
        align="start"
        aria-label="Entity image"
      >
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          aria-label="Upload image file"
          hidden
          onChange={async (e) => {
            try {
              if (e.target.files?.[0])
                choose({ kind: "image", value: await read(e.target.files[0]) });
            } catch (err) {
              fail(err.message);
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => input.current.click()}
        >
          <ImagePlus />
          Upload image
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMode("icon")}
        >
          <Search />
          Choose icon
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMode("emoji")}
        >
          Choose emoji
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => choose(null)}
        >
          <Trash2 />
          Remove image
        </Button>
        {mode === "icon" && (
          <Command>
            <CommandInput autoFocus placeholder="Search icons" />
            <CommandList>
              <CommandEmpty>No icons found</CommandEmpty>
              <CommandGroup>
                {Object.entries(icons).map(([name, Icon]) => (
                  <CommandItem
                    key={name}
                    onSelect={() => choose({ kind: "icon", value: name })}
                  >
                    <Icon />
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
        {mode === "emoji" && (
          <div className="entity-emoji">
            {["📚", "💪", "🧠", "⚙️", "🧘", "🌱", "🏆", "🎯", "🎨", "💻"].map(
              (value) => (
                <Button
                  type="button"
                  key={value}
                  variant="ghost"
                  size="icon"
                  onClick={() => choose({ kind: "emoji", value })}
                >
                  {value}
                </Button>
              ),
            )}
          </div>
        )}
        {error && <small role="alert">{error}</small>}
      </PopoverContent>
    </Popover>
  );
}
