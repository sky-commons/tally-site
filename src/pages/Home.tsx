import { useEffect, useState, type ReactNode } from "react";
import { Badge, Box, Button, Card, Flex, Grid, Heading, Link, Section, Separator, Text } from "@radix-ui/themes";
import { ArrowTopRightIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { LiveMap } from "../LiveMap";
import { repo } from "../Layout";
import { mapUrl, read, shortKey, urlKey, type Me } from "../api";
import { CommandBlock, count, InlineCode, NoteList, SectionHeading } from "../ui";

export const installCommand =
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
  <>
    Then <Link href="/feeders/">find your station</Link>: its page, figures and rank.
  </>,
];

export function Home() {
  return (
    <>
      <Section size="2" pt="6" pb="5">
        <Flex direction="column" align="start" gap="4" maxWidth="760px">
          <Badge size="2" variant="soft">
            Early
          </Badge>
          <Heading as="h1" size={{ initial: "8", sm: "9" }}>
            An ADS-B network with no single operator
          </Heading>
          <Text as="p" size="5" color="gray">
            Feed it alongside what you already run. Anyone can run a relay, and nobody can sell or
            switch off the data.
          </Text>
          <Flex gap="3" wrap="wrap">
            <Button size="3" asChild>
              <a href="#feed">Feed Tally</a>
            </Button>
            <Button size="3" variant="soft" asChild>
              <a href="/leaderboard/">Leaderboard</a>
            </Button>
            <Button size="3" variant="outline" color="gray" asChild>
              <a href={repo}>
                <GitHubLogoIcon /> Source
              </a>
            </Button>
          </Flex>
          <Feeding />
        </Flex>
      </Section>

      <Box pb="8">
        <LiveMap />
        <Flex justify="between" align="center" gap="3" mt="2">
          <Text size="1" color="gray">
            Live. Red is Tally MLAT.
          </Text>
          <Link href={mapUrl} size="2" weight="medium">
            <Flex as="span" align="center" gap="1">
              Full map <ArrowTopRightIcon />
            </Flex>
          </Link>
        </Flex>
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
        <SectionHeading title="Feed Tally" lead="Any box running readsb, adsb.im included." />
        <Box mt="5">
          <CommandBlock command={installCommand} />
        </Box>
        <NoteList items={feederNotes} />
      </Section>

      <Separator size="4" />

      <Section size="2" id="relay">
        <SectionHeading title="Run a relay" lead="One binary. --max-upload caps your bill." />
        <Box mt="5">
          <CommandBlock command={relayCommand} />
        </Box>
        <Flex gap="3" mt="5" wrap="wrap">
          <Button size="3" variant="soft" asChild>
            <a href={`${repo}#run-a-relay`}>Relay guide</a>
          </Button>
          <Button size="3" variant="outline" color="gray" asChild>
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
            <>
              Two receivers so far, in LA and the Bay Area. Three in range of each other start
              MLAT, and the <Link href="/leaderboard/">leaderboard</Link> with it.
            </>,
          ]}
        />
      </Section>
    </>
  );
}

/** Am I feeding: the stations whose session comes from the visitor's address. Drawn in the browser
 * only, and nothing at all when the API cannot answer. */
function Feeding() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let closed = false;
    read<Me>("/v1/me").then((answer) => {
      if (!closed && answer.kind === "ok") setMe(answer.value);
    });
    return () => {
      closed = true;
    };
  }, []);

  if (me == null) return null;
  if (me.stations.length === 0) {
    return (
      <Text size="2" color="gray">
        No feeder from your address. <Link href="#feed">Set one up</Link>
      </Text>
    );
  }
  return (
    <Card size="1" style={{ width: "100%", maxWidth: 420 }}>
      <Flex direction="column" gap="2">
        <Text size="1" color="gray">
          Feeding from your address
        </Text>
        {me.stations.map((station) => (
          <Flex key={station.key} align="center" justify="between" gap="3">
            <Flex align="center" gap="2" minWidth="0">
              <Badge color={station.online ? "green" : "gray"} variant="soft">
                {station.online ? "Online" : "Offline"}
              </Badge>
              <Link href={`/feeders/${urlKey(station.key)}`} size="2" className="mono">
                {shortKey(station.key)}
              </Link>
            </Flex>
            <Text size="2" color="gray" className="tabular">
              {count(station.messages_per_sec)} msg/s
            </Text>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}
