import { useState, type ReactNode } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  IconButton,
  Link,
  Section,
  Separator,
  Text,
  Theme,
  Tooltip,
} from "@radix-ui/themes";
import { CheckIcon, CopyIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { LiveMap } from "./LiveMap";

const repo = "https://github.com/sky-commons/tally";
const installCommand =
  "curl -fsSL https://github.com/sky-commons/tally/releases/latest/download/install.sh | sudo bash";
const relayCommand = `tally-relay keygen > /etc/tally/relay.key
tally-relay --key /etc/tally/relay.key --max-upload 6Mbit/s \\
  --listen 0.0.0.0:10900 --beast-out 127.0.0.1:30105`;

const differences: { title: string; body: ReactNode }[] = [
  { title: "No single operator", body: "Anyone can run a relay. Feeders fail over between them." },
  { title: "Signed at the antenna", body: "Every batch carries your station key. No account." },
  { title: "Delivery is checked", body: "Feeders verify relays hold their data." },
  { title: "MLAT on the relays", body: "Solved per area, credited to the receivers used." },
  {
    title: "Take the raw back",
    body: (
      <>
        Run a relay, get your area as BEAST via <InlineCode>--beast-out</InlineCode>.
      </>
    ),
  },
  { title: "Open data", body: "CC0 in, ODbL out. Code MIT or Apache-2.0." },
];

const feederNotes: ReactNode[] = [
  <>
    Reads BEAST on <InlineCode>:30005</InlineCode>. Opens no port, leaves other feeds alone.
  </>,
  <>
    Exact location for MLAT, or <InlineCode>--precision &lt;m&gt;</InlineCode> if rounded.
  </>,
  <>
    UAT: <InlineCode>--uat 127.0.0.1:30978</InlineCode>. Docker:{" "}
    <InlineCode>ghcr.io/sky-commons/tally-feed</InlineCode>.
  </>,
];

export function App() {
  return (
    <Theme accentColor="sky" grayColor="slate" radius="medium" appearance="inherit">
      <Container size="3" px="4">
        <Flex asChild align="center" justify="between" py="4">
          <header>
            <Flex align="center" gap="2">
              <img src="./favicon.svg" alt="" width="24" height="24" />
              <Text weight="bold" size="4">
                Sky Commons
              </Text>
            </Flex>
            <Flex align="center" gap="4">
              <Link href="#feed" size="2">
                Feed
              </Link>
              <Link href="#relay" size="2">
                Run a relay
              </Link>
              <IconButton variant="ghost" color="gray" asChild>
                <a href={repo} aria-label="Tally on GitHub">
                  <GitHubLogoIcon width="18" height="18" />
                </a>
              </IconButton>
            </Flex>
          </header>
        </Flex>

        <main>
          <Section size="2" pb="5">
            <Flex direction="column" gap="4" maxWidth="760px">
              <Badge size="2" variant="soft" style={{ alignSelf: "flex-start" }}>
                Early
              </Badge>
              <Heading as="h1" size={{ initial: "8", sm: "9" }}>
                An ADS-B network with no single operator
              </Heading>
              <Text as="p" size="5" color="gray">
                Feed it alongside what you already run. Anyone can run a relay, and nobody can
                sell or switch off the data.
              </Text>
              <Flex gap="3" wrap="wrap">
                <Button size="3" asChild>
                  <a href="#feed">Feed Tally</a>
                </Button>
                <Button size="3" variant="soft" asChild>
                  <a href="#relay">Run a relay</a>
                </Button>
                <Button size="3" variant="ghost" color="gray" asChild>
                  <a href={repo}>
                    <GitHubLogoIcon /> Source
                  </a>
                </Button>
              </Flex>
            </Flex>
          </Section>

          <Box pb="8">
            <LiveMap />
            <Text as="p" size="1" color="gray" mt="2">
              Live. Red is Tally MLAT.
            </Text>
          </Box>

          <Separator size="4" />

          <Section size="2">
            <SectionHeading title="How it differs" />
            <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4" mt="5">
              {differences.map((item) => (
                <Card key={item.title} size="2">
                  <Flex direction="column" gap="2">
                    <Heading as="h3" size="4">
                      {item.title}
                    </Heading>
                    <Text as="p" size="2" color="gray">
                      {item.body}
                    </Text>
                  </Flex>
                </Card>
              ))}
            </Grid>
          </Section>

          <Separator size="4" />

          <Section size="2" id="feed">
            <SectionHeading
              title="Feed Tally"
              lead="Any box running readsb, adsb.im included."
            />
            <Box mt="5">
              <CommandBlock command={installCommand} />
            </Box>
            <NoteList items={feederNotes} />
          </Section>

          <Separator size="4" />

          <Section size="2" id="relay">
            <SectionHeading
              title="Run a relay"
              lead="One binary. --max-upload caps your bill."
            />
            <Box mt="5">
              <CommandBlock command={relayCommand} />
            </Box>
            <Flex gap="3" mt="5" wrap="wrap">
              <Button size="3" variant="soft" asChild>
                <a href={`${repo}#run-a-relay`}>Relay guide</a>
              </Button>
              <Button size="3" variant="ghost" asChild>
                <a href={`${repo}#what-a-relay-costs`}>What a relay costs</a>
              </Button>
            </Flex>
          </Section>

          <Separator size="4" />

          <Section size="2">
            <SectionHeading title="Where it stands" />
            <NoteList
              items={[
                <>
                  One relay so far (Flightlines). Want to run the second?{" "}
                  <Link href={`${repo}/issues`}>Open an issue</Link>.
                </>,
                "Receivers are around LA. LA feeders get MLAT going.",
                <>
                  Station stats: <Link href="https://tally.flightlines.ai">tally.flightlines.ai</Link>.
                </>,
              ]}
            />
          </Section>
        </main>

        <Separator size="4" />
        <Flex asChild justify="between" gap="4" wrap="wrap" py="6">
          <footer>
            <Text size="2" color="gray">
              Pilots say “tally” when they have the traffic in sight.
            </Text>
            <Link href="https://github.com/sky-commons" size="2">
              github.com/sky-commons
            </Link>
          </footer>
        </Flex>
      </Container>
    </Theme>
  );
}

function SectionHeading({ title, lead }: { title: string; lead?: ReactNode }) {
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

function NoteList({ items }: { items: ReactNode[] }) {
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

function InlineCode({ children }: { children: ReactNode }) {
  return <code className="inline-code">{children}</code>;
}

function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Card size="2" variant="surface">
      <Flex align="start" justify="between" gap="3">
        <pre className="command">
          <code>{command}</code>
        </pre>
        <Tooltip content={copied ? "Copied" : "Copy"}>
          <IconButton variant="ghost" color="gray" onClick={copy} aria-label="Copy the command">
            {copied ? <CheckIcon /> : <CopyIcon />}
          </IconButton>
        </Tooltip>
      </Flex>
    </Card>
  );
}
