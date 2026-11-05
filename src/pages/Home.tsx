import { useEffect, useState, type ReactNode } from "react";
import { Badge, Box, Button, Card, Flex, Grid, Heading, Link, Section, Separator, Text } from "@radix-ui/themes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { LiveMap } from "../LiveMap";
import { repo } from "../Layout";
import { feedTag, mapUrl, read, shortKey, urlKey, type Me } from "../api";
import { CommandBlock, count, InlineCode, NoteList, SectionHeading } from "../ui";

// The tally README's own form: download the installer, then run it, so what runs is what was read.
export const installCommand = `curl -fsSL https://github.com/sky-commons/tally/releases/latest/download/install.sh -o /tmp/tally-install.sh
sudo bash /tmp/tally-install.sh`;
export const packagingGuide = `${repo}/blob/main/packaging/README.md`;
// adsb.im starts only its own compose files, so Tally gets a project of its own on adsb.im's network,
// reading adsb.im's location from its .env (linked beside it).
const adsbimCompose = `name: tally
services:
  tally-feed:
    image: ghcr.io/sky-commons/tally-feed:${feedTag}
    container_name: tally-feed
    restart: unless-stopped
    environment:
      - BEASTHOST=ultrafeeder
      - LAT=\${FEEDER_LAT}
      - LONG=\${FEEDER_LONG}
      - ALT_MSL=\${FEEDER_ALT_M}m
    volumes:
      - /opt/adsb/tally-feed:/var/lib/tally-feed
networks:
  default:
    name: adsb_im_bridge
    external: true`;
const adsbimStart = `sudo ln -s /opt/adsb/config/.env /opt/adsb/tally/.env
cd /opt/adsb/tally && sudo docker compose up -d`;
const composeExample = `  tally-feed:
    image: ghcr.io/sky-commons/tally-feed:${feedTag}
    container_name: tally-feed
    restart: unless-stopped
    environment:
      - BEASTHOST=ultrafeeder
      - LAT=51.4779
      - LONG=-0.0015
      - ALT_MSL=20m
    volumes:
      - ./tally-feed:/var/lib/tally-feed`;
const relayCommand = `tally-relay keygen > /etc/tally/relay.key
tally-relay --key /etc/tally/relay.key --max-upload 6Mbit/s \\
  --listen 0.0.0.0:10900 --beast-out 127.0.0.1:30105`;

const differences: { title: string; body: ReactNode }[] = [
  {
    title: "Anyone can run a relay",
    body: "Feeders fail over between relays. Today there is one, run by Flightlines; the second is open.",
  },
  { title: "Signed at the antenna", body: "Every batch carries your station key. No account." },
  { title: "Delivery is checked", body: "Feeders verify relays hold their data." },
  {
    title: "MLAT, coming",
    body: "Solved on the relays once 3–4 receivers in range hear the same aircraft. It hasn't solved one yet.",
  },
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
    <Text weight="bold">Updates itself</Text> once a day, signature-checked. Opt out with{" "}
    <InlineCode>TALLY_AUTO_UPDATE=0</InlineCode> or <InlineCode>--no-auto-update</InlineCode> at install, or later{" "}
    <InlineCode>sudo systemctl disable --now tally-feed-update.timer</InlineCode>. Installed before 0.7.2? Run the
    installer once more.
  </>,
  <>
    <Text weight="bold">After install</Text> it prints the link to your station's page. Within a minute its aircraft
    are on the <Link href={mapUrl}>map</Link>. No ranking or MLAT credit yet.
  </>,
  <>
    <Text weight="bold">No location set?</Text> The installer asks for the antenna's street address (or run it with{" "}
    <InlineCode>--locate</InlineCode>) and works out the coordinates and elevation on the receiver. The address goes
    only to the US Census geocoder and OpenStreetMap, never to Tally; the coordinates they find go to USGS (or
    Open-Meteo outside the US) for the elevation.
  </>,
  <>
    Reads BEAST on <InlineCode>:30005</InlineCode>. Opens no port, leaves other feeds alone. UAT:{" "}
    <InlineCode>--uat 127.0.0.1:30978</InlineCode>.
  </>,
  <>
    Your exact location goes only to relays, for MLAT. Public pages, the map and the API show a coarse cell a few km
    across.
  </>,
  <>
    Light: capped at 64 MB of memory and 20% of a CPU, uploads at most 64 KB/s to each of at most 2 relays. The
    signature checker (cosign) takes about 150 MB of disk.
  </>,
  <>
    Runs on 64-bit Linux (x86_64, ARM64) and 32-bit ARMv7 (Raspberry Pi 2 and later, not the Pi 1 or original Zero),
    with systemd 247 or newer: Raspberry Pi OS or Debian Bullseye and later.
  </>,
  <>
    Remove it: <InlineCode>sudo bash /tmp/tally-install.sh --uninstall</InlineCode> keeps your key;{" "}
    <InlineCode>--uninstall --purge</InlineCode> deletes it.
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
            Feed it alongside what you already run. It is built so anyone can run a relay and no one company holds
            the data.
          </Text>
          <Text as="p" size="3" weight="medium">
            Early: 1 relay (Flightlines), 2 receivers, map only, MLAT coming.
          </Text>
          <Flex gap="3" wrap="wrap">
            <Button size="3" asChild>
              <a href="#feed">Feed Tally</a>
            </Button>
            <Button size="3" variant="soft" asChild>
              <a href={mapUrl}>Full map</a>
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
          lead="Any Linux box running readsb: Raspberry Pi OS, Debian, Ubuntu. Download the installer, then run it."
        />
        <Box mt="5">
          <CommandBlock command={installCommand} />
        </Box>
        <NoteList items={feederNotes} />

        <Box mt="6">
          <Heading as="h3" size="5" mb="2">
            adsb.im, or Docker
          </Heading>
          <Text as="p" size="3" color="gray" style={{ maxWidth: 760 }}>
            Run Tally as a container beside ultrafeeder (<Link href={packagingGuide}>packaging guide</Link>).{" "}
            <InlineCode>:{feedTag}</InlineCode> follows releases, so Watchtower or a periodic{" "}
            <InlineCode>docker compose pull && docker compose up -d</InlineCode> keeps it current; pin{" "}
            <InlineCode>vX.Y.Z</InlineCode> to control it.
          </Text>
          <Heading as="h4" size="3" mt="5" mb="2">
            On adsb.im
          </Heading>
          <Text as="p" size="3" color="gray" style={{ maxWidth: 760 }}>
            adsb.im has no way to add it from its web page yet: SSH in. It starts only its own compose files and has
            no slot for another, so Tally gets a file of its own, in its own directory (adsb.im moves any{" "}
            <InlineCode>.yml</InlineCode> left in <InlineCode>/opt/adsb</InlineCode> itself). Make the directory with{" "}
            <InlineCode>sudo mkdir /opt/adsb/tally</InlineCode> and save this as{" "}
            <InlineCode>/opt/adsb/tally/docker-compose.yml</InlineCode>:
          </Text>
          <Box mt="3">
            <CommandBlock command={adsbimCompose} />
          </Box>
          <Text as="p" size="3" color="gray" mt="3" style={{ maxWidth: 760 }}>
            The <InlineCode>{"${FEEDER_…}"}</InlineCode> values are the location you gave adsb.im, from its{" "}
            <InlineCode>/opt/adsb/config/.env</InlineCode>; linking that file beside this one lets compose read them.{" "}
            <InlineCode>adsb_im_bridge</InlineCode> is adsb.im's network, where ultrafeeder is, and the key lives in{" "}
            <InlineCode>/opt/adsb/tally-feed</InlineCode>. Link the <InlineCode>.env</InlineCode> and start Tally; it starts again with the box:
          </Text>
          <Box mt="3">
            <CommandBlock command={adsbimStart} />
          </Box>
          <Heading as="h4" size="3" mt="5" mb="2">
            Any other compose setup
          </Heading>
          <Text as="p" size="3" color="gray" style={{ maxWidth: 760 }}>
            Add this service to the compose file that runs ultrafeeder, with your antenna's latitude, longitude and
            altitude. <InlineCode>ALT_MSL</InlineCode> is the antenna's height above sea level, in metres
            (<InlineCode>20m</InlineCode>) or feet (<InlineCode>65ft</InlineCode>). <InlineCode>BEASTHOST</InlineCode> is the ultrafeeder container's name, and both must
            be on the same compose network (the same file does that).
          </Text>
          <Box mt="3">
            <CommandBlock command={composeExample} />
          </Box>
        </Box>
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
