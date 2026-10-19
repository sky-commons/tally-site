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

const repo = "https://github.com/sky-commons/tally";
const installCommand =
  "curl -fsSL https://github.com/sky-commons/tally/releases/latest/download/install.sh | sudo bash";

const reasons: { title: string; body: string }[] = [
  {
    title: "Nobody can buy it",
    body: "There is no central server. Anyone can run a relay, and relays share with each other. If an operator goes bad, feeders move on and the network carries on.",
  },
  {
    title: "Your antenna, your key",
    body: "Your receiver makes its own signing key at install. No account, no signup. Every relay knows your antenna by that key, and no operator can take it away.",
  },
  {
    title: "Open data, both ways",
    body: "Feeders give their receptions under CC0. What relays publish is under the ODbL, so nobody can take the data private.",
  },
  {
    title: "Adds on, replaces nothing",
    body: "The feeder is one more reader of your decoder's output. Your other feeds carry on as before, and it opens no port.",
  },
  {
    title: "Finds the quiet aircraft",
    body: "When three or more receivers hear an aircraft that doesn't broadcast its position, relays locate it by multilateration (MLAT), and every receiver that helped is credited.",
  },
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
              <Link href={repo} size="2" aria-label="Tally on GitHub">
                <GitHubLogoIcon width="18" height="18" />
              </Link>
            </Flex>
          </header>
        </Flex>

        <main>
          <Section size="3">
            <Flex direction="column" gap="5" maxWidth="720px">
              <Badge size="2" variant="soft" style={{ alignSelf: "flex-start" }}>
                Early
              </Badge>
              <Heading as="h1" size={{ initial: "8", sm: "9" }}>
                Open infrastructure for the sky
              </Heading>
              <Text as="p" size="5" color="gray">
                Sky Commons builds aviation data infrastructure that nobody owns. Its first project
                is Tally, an open network for ADS-B receivers: your receiver publishes what it hears
                once, and anyone may run a relay or use the data.
              </Text>
              <Flex gap="3" wrap="wrap">
                <Button size="3" asChild>
                  <a href="#feed">Feed Tally</a>
                </Button>
                <Button size="3" variant="soft" asChild>
                  <a href={repo}>
                    <GitHubLogoIcon /> Source
                  </a>
                </Button>
              </Flex>
            </Flex>
          </Section>

          <Separator size="4" />

          <Section size="2">
            <SectionHeading
              title="Why feed Tally"
              lead={
                <>
                  Pilots say “tally” on the radio when they have the traffic in sight. That is what
                  this does, together.
                </>
              }
            />
            <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4" mt="6">
              {reasons.map((reason) => (
                <Card key={reason.title} size="2">
                  <Flex direction="column" gap="2">
                    <Heading as="h3" size="4">
                      {reason.title}
                    </Heading>
                    <Text as="p" size="2" color="gray">
                      {reason.body}
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
              lead="On a receiver that already runs readsb (a Raspberry Pi image, adsb.im, a plain Debian box), one command installs it. It checks the download, finds your decoder and location, makes your key, and starts the service."
            />
            <Box mt="5">
              <CommandBlock command={installCommand} />
            </Box>
            <Flex direction="column" gap="3" mt="5" maxWidth="720px">
              <Text as="p" size="3" color="gray">
                Prefer containers? <Code>ghcr.io/sky-commons/tally-feed</Code> is signed like the
                binaries; see{" "}
                <Link color="sky" href={`${repo}/blob/main/packaging/README.md`}>packaging</Link>.
              </Text>
              <Text as="p" size="3" color="gray">
                Your receiver's location is published as you enter it, because MLAT needs it exact.
                You can round it, and you then contribute less to MLAT.
              </Text>
            </Flex>
          </Section>

          <Separator size="4" />

          <Section size="2" id="relay">
            <SectionHeading
              title="Run a relay"
              lead="A relay is one program anyone may run. Give it a key and a cap on what it sends, and it joins the network. The cap bounds your bill, so a small server is enough to start."
            />
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
            <Flex asChild direction="column" gap="3" mt="5" maxWidth="720px">
              <ul className="plain-list">
                <StatusItem>
                  Releases are signed and public:{" "}
                  <Link href={`${repo}/releases`}>sky-commons/tally releases</Link>.
                </StatusItem>
                <StatusItem>
                  One public relay runs today, operated by Flightlines. We are looking for more
                  operators.
                </StatusItem>
                <StatusItem>The first receivers are feeding it.</StatusItem>
                <StatusItem>
                  The live map is at <Link href="https://tally.flightlines.ai">tally.flightlines.ai</Link>{" "}
                  for now, and moves here once more operators run the network.
                </StatusItem>
              </ul>
            </Flex>
          </Section>
        </main>

        <Separator size="4" />
        <Flex asChild justify="between" gap="4" wrap="wrap" py="6">
          <footer>
            <Text size="2" color="gray">
              Code: MIT or Apache-2.0. Data: CC0 in, ODbL out.
            </Text>
            <Link href={repo} size="2">
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
    <Flex direction="column" gap="3" maxWidth="720px">
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

function StatusItem({ children }: { children: ReactNode }) {
  return (
    <li>
      <Text size="3">{children}</Text>
    </li>
  );
}

function Code({ children }: { children: ReactNode }) {
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
