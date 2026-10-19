import { useState, type ReactNode } from "react";
import { Box, Card, Flex, Heading, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";

export function SectionHeading({ title, lead }: { title: string; lead?: ReactNode }) {
  return (
    <Flex direction="column" gap="3" maxWidth="760px">
      <Heading as="h2" size="7">
        {title}
      </Heading>
      {lead && (
        <Text as="p" size="4" color="gray">
          {lead}
        </Text>
      )}
    </Flex>
  );
}

export function NoteList({ items }: { items: ReactNode[] }) {
  return (
    <Box asChild mt="5" maxWidth="760px">
      <ul className="note-list">
        {items.map((item, index) => (
          <li key={index}>
            <Text size="3">{item}</Text>
          </li>
        ))}
      </ul>
    </Box>
  );
}

export function InlineCode({ children }: { children: ReactNode }) {
  return <code className="inline-code">{children}</code>;
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Tooltip content={copied ? "Copied" : "Copy"}>
      <IconButton variant="soft" color="gray" size="2" onClick={copy} aria-label={label}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </IconButton>
    </Tooltip>
  );
}

export function CommandBlock({ command }: { command: string }) {
  return (
    <Card size="2" variant="surface">
      <Flex align="center" justify="between" gap="3">
        <pre className="command">
          <code>{command}</code>
        </pre>
        <CopyButton text={command} label="Copy the command" />
      </Flex>
    </Card>
  );
}

/** One figure: the value large, what it counts beneath. */
export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Flex direction="column" gap="1">
      <Text size="5" weight="bold" className="tabular">
        {value ?? "…"}
      </Text>
      <Text size="1" color="gray">
        {label}
      </Text>
    </Flex>
  );
}

export function count(n: number | null | undefined): string | null {
  return n == null ? null : Math.round(n).toLocaleString("en-US");
}

export function km(metres: number): string {
  return `${Math.round(metres / 1000).toLocaleString("en-US")} km`;
}

export function km2(area: number): string {
  return `${Math.round(area).toLocaleString("en-US")} km²`;
}

export function ago(ms: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (seconds < 90) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 90) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export function place(position: { lat: number; lon: number }): string {
  const lat = `${Math.abs(position.lat).toFixed(1)}°${position.lat >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(position.lon).toFixed(1)}°${position.lon >= 0 ? "E" : "W"}`;
  return `${lat} ${lon}`;
}
