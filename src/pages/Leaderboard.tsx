import { useEffect, useState } from "react";
import { Badge, Button, Callout, Card, Flex, Heading, Link, Progress, Section, Table, Tabs, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  mlatReceivers,
  read,
  shortKey,
  urlKey,
  type Leaderboard as Board,
  type LeaderboardEntry,
  type Leaderboards,
  type Network,
} from "../api";
import { count, km2, place } from "../ui";

type State =
  | { kind: "loading" }
  | { kind: "failed" }
  | { kind: "ready"; boards: Board[]; network: Network | null };

export function Leaderboard() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let closed = false;
    (async () => {
      const [list, network] = await Promise.all([read<Leaderboards>("/v1/leaderboards"), read<Network>("/v1/network")]);
      if (list.kind !== "ok") {
        if (!closed) setState({ kind: "failed" });
        return;
      }
      const boards = await Promise.all(list.value.areas.map((area) => read<Board>(`/v1/leaderboards/${area.area}`)));
      if (closed) return;
      setState({
        kind: "ready",
        boards: boards.flatMap((board) => (board.kind === "ok" ? [board.value] : [])),
        network: network.kind === "ok" ? network.value : null,
      });
    })();
    return () => {
      closed = true;
    };
  }, []);

  useEffect(() => {
    if (state.kind !== "ready") return;
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(hash)?.scrollIntoView();
  }, [state.kind]);

  return (
    <Section size="2" pt="6">
      <Heading as="h1" size="8" mb="3">
        Leaderboard
      </Heading>
      <Text as="p" size="4" color="gray" mb="6" style={{ maxWidth: 760 }}>
        Ranked per area by the coverage only a station has and by how much it helps MLAT. A station
        is ranked once MLAT proves it real.
      </Text>
      {state.kind === "loading" ? (
        <Text color="gray">Loading…</Text>
      ) : state.kind === "failed" ? (
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>The network's API didn't answer. Reload to try again.</Callout.Text>
        </Callout.Root>
      ) : state.boards.length === 0 ? (
        <NoAreas network={state.network} />
      ) : (
        <Flex direction="column" gap="5">
          {state.boards.map((board) => (
            <Area key={board.area} board={board} />
          ))}
        </Flex>
      )}
    </Section>
  );
}

function NoAreas({ network }: { network: Network | null }) {
  const online = network?.receivers_online ?? 0;
  return (
    <Card size="3" style={{ maxWidth: 760 }}>
      <Flex direction="column" gap="4" align="start">
        <Heading as="h2" size="5">
          No area has MLAT yet
        </Heading>
        <Text color="gray">
          {count(online)} receiver{online === 1 ? "" : "s"} online. Ranking starts in an area once{" "}
          {mlatReceivers} receivers there hear the same aircraft.
        </Text>
        <Button asChild>
          <a href="/#feed">Feed Tally</a>
        </Button>
      </Flex>
    </Card>
  );
}

function Area({ board }: { board: Board }) {
  const receivers = board.receivers ?? board.ranked + (board.unranked?.length ?? 0);
  return (
    <Card size="3" id={board.area}>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Heading as="h2" size="5">
            Area near {place(board.center)}
          </Heading>
          <Flex gap="2">
            <Badge variant="soft" color="gray">
              {receivers} receiver{receivers === 1 ? "" : "s"}
            </Badge>
            <Badge variant="soft">{board.ranked} ranked</Badge>
          </Flex>
        </Flex>

        {board.ranked === 0 ? (
          <Flex direction="column" gap="3" maxWidth="560px">
            <Text size="3">
              <Text weight="bold">
                {Math.min(receivers, mlatReceivers)} of {mlatReceivers}
              </Text>{" "}
              receivers for MLAT
            </Text>
            <Progress value={(Math.min(receivers, mlatReceivers) / mlatReceivers) * 100} size="3" />
            <Text size="2" color="gray">
              {mlatReceivers - Math.min(receivers, mlatReceivers)} more in range of each other and MLAT
              starts here, with ranking.
            </Text>
          </Flex>
        ) : (
          <Tabs.Root defaultValue="coverage">
            <Tabs.List>
              <Tabs.Trigger value="coverage">Coverage only they have</Tabs.Trigger>
              <Tabs.Trigger value="mlat">MLAT help</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="coverage">
              <Ranking entries={board.by_unique_coverage} />
            </Tabs.Content>
            <Tabs.Content value="mlat">
              <Ranking entries={board.by_mlat} />
            </Tabs.Content>
          </Tabs.Root>
        )}

        {board.unranked && board.unranked.length > 0 && (
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">
              Feeding, not ranked yet
            </Text>
            <Flex gap="3" wrap="wrap">
              {board.unranked.map((feeder) => (
                <Link key={feeder.key} href={`/feeders/${urlKey(feeder.key)}`} size="2" className="mono">
                  {shortKey(feeder.key)}
                </Link>
              ))}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

function Ranking({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <Table.Root size="2" mt="3">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell width="48px">#</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Station</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell justify="end">Only they cover</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell justify="end">MLAT fixes</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {entries.map((entry) => (
          <Table.Row key={entry.key}>
            <Table.RowHeaderCell>{entry.rank}</Table.RowHeaderCell>
            <Table.Cell>
              <Link href={`/feeders/${urlKey(entry.key)}`} className="mono">
                {shortKey(entry.key)}
              </Link>
            </Table.Cell>
            <Table.Cell justify="end" className="tabular">
              {km2(entry.unique_coverage_km2)}
            </Table.Cell>
            <Table.Cell justify="end" className="tabular">
              {count(entry.mlat_positions)}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
