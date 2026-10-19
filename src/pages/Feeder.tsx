import { useEffect, useState } from "react";
import { Badge, Box, Button, Callout, Card, Code, Flex, Grid, Heading, Link, Section, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { mlatReceivers, read, shortKey, urlKey, type Answer, type FeederStats, type Station } from "../api";
import { StationMap } from "../StationMap";
import { ago, CopyButton, count, km, km2, place, Stat } from "../ui";

type Reads = { station: Answer<Station>; stats: Answer<FeederStats> } | null;

export function Feeder({ stationKey }: { stationKey: string }) {
  const key = urlKey(stationKey);
  const [reads, setReads] = useState<Reads>(null);

  useEffect(() => {
    let closed = false;
    const load = async () => {
      const [station, stats] = await Promise.all([
        read<Station>(`/v1/stations/${key}`),
        read<FeederStats>(`/v1/stations/${key}/stats`),
      ]);
      if (!closed) setReads({ station, stats });
    };
    load();
    const timer = setInterval(load, 30_000);
    return () => {
      closed = true;
      clearInterval(timer);
    };
  }, [key]);

  useEffect(() => {
    document.title = `Station ${shortKey(key)} · Tally`;
  }, [key]);

  return (
    <Section size="2" pt="6">
      <Flex direction="column" gap="2" mb="5">
        <Text size="2" color="gray">
          <Link href="/feeders/">Stations</Link> / {shortKey(key)}
        </Text>
        <Flex align="center" gap="3" wrap="wrap">
          <Heading as="h1" size="8">
            Station {shortKey(key)}
          </Heading>
          {reads?.station.kind === "ok" && (
            <Badge size="2" color={reads.station.value.online ? "green" : "gray"} variant="soft">
              {reads.station.value.online ? "Online" : "Offline"}
            </Badge>
          )}
        </Flex>
        <Flex align="center" gap="2" wrap="wrap">
          <Code size="2" variant="ghost" color="gray" className="key">
            {key}
          </Code>
          <CopyButton text={key} label="Copy the key" />
        </Flex>
      </Flex>

      {reads == null ? (
        <Text color="gray">Loading…</Text>
      ) : reads.station.kind === "failed" ? (
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>The network's API didn't answer. Trying again shortly.</Callout.Text>
        </Callout.Root>
      ) : reads.station.kind === "missing" ? (
        <Missing />
      ) : (
        <Found station={reads.station.value} stats={reads.stats.kind === "ok" ? reads.stats.value : null} />
      )}
    </Section>
  );
}

function Missing() {
  return (
    <Card size="3" style={{ maxWidth: 760 }}>
      <Flex direction="column" gap="3" align="start">
        <Heading as="h2" size="5">
          Not heard yet
        </Heading>
        <Text color="gray">
          No relay has heard this key. A new feeder shows up within a minute of starting. Check the
          key, or that tally-feed is running.
        </Text>
        <Button variant="soft" asChild>
          <a href="/#feed">Set up a feeder</a>
        </Button>
      </Flex>
    </Card>
  );
}

function Found({ station, stats }: { station: Station; stats: FeederStats | null }) {
  return (
    <Flex direction="column" gap="5">
      <Text size="2" color="gray">
        {[
          station.software,
          `feeding since ${new Date(station.first_seen_at_ms).toLocaleDateString("en-US", { dateStyle: "medium" })}`,
          `last heard ${ago(station.last_seen_at_ms)}`,
          station.location && place(station.location),
        ]
          .filter(Boolean)
          .join(" · ")}
      </Text>

      <Grid columns={{ initial: "1", md: "3" }} gap="4">
        <Box gridColumn={{ initial: "1", md: "1 / 3" }}>
          {station.location ? (
            <StationMap at={station.location} rangeM={stats?.range_m ?? null} />
          ) : (
            <Card size="3" className="station-map-empty">
              <Text color="gray">This station publishes no location.</Text>
            </Card>
          )}
        </Box>
        <Rank stats={stats} />
      </Grid>

      <Card size="3">
        <Flex direction="column" gap="4">
          <Text size="2" color="gray">
            {stats ? "Last day" : "No figures for the last day yet."}
          </Text>
          <Grid columns={{ initial: "2", sm: "4" }} gapX="5" gapY="5">
            <Stat label="msg/s now" value={count(station.messages_per_sec)} />
            {stats && (
              <>
                <Stat label="uptime" value={`${Math.round(stats.uptime * 100)}%`} />
                <Stat label="aircraft" value={count(stats.aircraft)} />
                <Stat label="range" value={km(stats.range_m)} />
                <Stat label="coverage" value={km2(stats.coverage_km2)} />
                <Stat label="only you cover" value={km2(stats.unique_coverage_km2)} />
                <Stat label="MLAT fixes helped" value={count(stats.mlat_positions)} />
              </>
            )}
          </Grid>
        </Flex>
      </Card>
    </Flex>
  );
}

function Rank({ stats }: { stats: FeederStats | null }) {
  if (stats?.ranks) {
    return (
      <Card size="3">
        <Flex direction="column" gap="4" height="100%">
          <Text size="2" color="gray">
            Rank in its area, of {stats.ranks.of}
          </Text>
          <Stat label="by coverage only it has" value={`#${stats.ranks.unique_coverage}`} />
          <Stat label="by MLAT help" value={`#${stats.ranks.mlat}`} />
          <Link href={`/leaderboard/#${stats.area}`} size="2">
            Area leaderboard
          </Link>
        </Flex>
      </Card>
    );
  }
  return (
    <Card size="3">
      <Flex direction="column" gap="3" height="100%">
        <Heading as="h2" size="4">
          Not ranked yet
        </Heading>
        <Text size="2" color="gray">
          Ranking starts once this station helps MLAT, which takes {mlatReceivers} receivers in range
          of each other. It proves a station is real.
        </Text>
        <Link href={stats?.area ? `/leaderboard/#${stats.area}` : "/leaderboard/"} size="2">
          How close is your area?
        </Link>
      </Flex>
    </Card>
  );
}
