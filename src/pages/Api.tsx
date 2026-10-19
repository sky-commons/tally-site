import type { ReactNode } from "react";
import { Box, Code, Flex, Heading, Link, Section, Separator, Text } from "@radix-ui/themes";
import { api } from "../api";
import { repo } from "../Layout";
import { CommandBlock, InlineCode, SectionHeading } from "../ui";

type Endpoint = { path: string; aka?: string[]; body: ReactNode };

const v1: Endpoint[] = [
  {
    path: "GET /v1/aircraft?west=&south=&east=&north=",
    body: (
      <>
        Aircraft in a box, at most 60° each way. <InlineCode>&feed=precise</InlineCode> for the
        product with every MLAT position final, about 90 s behind.
      </>
    ),
  },
  { path: "GET /v1/aircraft/stream?west=&south=&east=&north=", body: "The same box as SSE: the whole box, then changes every 250 ms at most. 4 streams per address." },
  { path: "GET /v1/network", body: "Receivers online, msg/s, aircraft by position source." },
  { path: "GET /v1/stations/{key}", body: "One station: online, first and last seen, msg/s, location, software." },
  { path: "GET /v1/stations/{key}/stats", body: "Its figures: uptime, range, coverage, unique coverage, MLAT help, ranks." },
  { path: "GET /v1/leaderboards", body: "Every area with a feeder." },
  { path: "GET /v1/leaderboards/{area}", body: "One area, by unique coverage and by MLAT." },
  { path: "GET /v1/me", body: "The stations feeding from your address." },
];

const v2: Endpoint[] = [
  { path: "GET /v2/hex/{hex}", aka: ["/v2/icao/{hex}"], body: "By ICAO address." },
  { path: "GET /v2/callsign/{callsign}", body: "By callsign." },
  { path: "GET /v2/registration/{reg}", aka: ["/v2/reg/{reg}"], body: "By registration." },
  { path: "GET /v2/type/{type}", body: "By ICAO type code, e.g. B738." },
  { path: "GET /v2/squawk/{squawk}", aka: ["/v2/sqk/{squawk}"], body: "By squawk." },
  { path: "GET /v2/mil", body: "Military." },
  {
    path: "GET /v2/point/{lat}/{lon}/{radius}",
    aka: ["/v2/lat/{lat}/lon/{lon}/dist/{radius}"],
    body: "Within a radius in nm, at most 250.",
  },
  { path: "GET /v2/closest/{lat}/{lon}/{radius}", body: "The one aircraft nearest a point, within a radius in nm, at most 250." },
];

const routes: Endpoint[] = [
  { path: "POST /api/0/routeset", body: "Routes for a batch of callsigns with positions, as tar1090's routeApiUrl asks." },
  { path: "GET /api/0/route/{callsign}/{lat}/{lon}", body: "One callsign's route, checked against where the aircraft is." },
];

export function Api() {
  return (
    <>
      <Section size="2" pt="6" pb="5">
        <Flex direction="column" gap="3" maxWidth="760px">
          <Heading as="h1" size="8">
            API
          </Heading>
          <Text as="p" size="4" color="gray">
            Public, read-only JSON. No key. Rate limited per address: over it, <InlineCode>429</InlineCode> with{" "}
            <InlineCode>Retry-After</InlineCode>.
          </Text>
          <Text as="p" size="3">
            Base URL <Code size="3">{api}</Code>
          </Text>
          <Text as="p" size="2" color="gray">
            Data is ODbL. Field by field in the <Link href={`${repo}#run-the-api`}>source README</Link>.
          </Text>
        </Flex>
      </Section>

      <Separator size="4" />

      <Section size="2">
        <SectionHeading title="v1" lead="Tally's own. Times are Unix ms, beside the answer's now_ms." />
        <Endpoints items={v1} />
        <Examples
          commands={[
            `curl '${api}/v1/aircraft?west=-119&south=33.5&east=-117.5&north=34.5'`,
            `curl -N '${api}/v1/aircraft/stream?west=-119&south=33.5&east=-117.5&north=34.5'`,
          ]}
        />
      </Section>

      <Separator size="4" />

      <Section size="2">
        <SectionHeading title="v2" lead="ADS-B Exchange-compatible: the same paths and answers adsb.lol serves." />
        <Endpoints items={v2} />
        <Examples commands={[`curl ${api}/v2/hex/a1b2c3`, `curl ${api}/v2/point/34.05/-118.25/50`]} />
      </Section>

      <Separator size="4" />

      <Section size="2">
        <SectionHeading title="Routes" lead="From VRS standing data (CC0)." />
        <Endpoints items={routes} />
        <Examples commands={[`curl ${api}/api/0/route/UAL1/37.6/-122.4`]} />
      </Section>
    </>
  );
}

function Endpoints({ items }: { items: Endpoint[] }) {
  return (
    <Flex direction="column" gap="4" mt="5" maxWidth="760px">
      {items.map((item) => (
        <Flex key={item.path} direction="column" gap="1">
          <Code size="2" variant="ghost" className="key">
            {item.path}
          </Code>
          {item.aka && (
            <Text size="1" color="gray">
              Also{" "}
              {item.aka.map((aka) => (
                <InlineCode key={aka}>{aka}</InlineCode>
              ))}
            </Text>
          )}
          <Text size="2" color="gray">
            {item.body}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

function Examples({ commands }: { commands: string[] }) {
  return (
    <Flex direction="column" gap="3" mt="5">
      {commands.map((command) => (
        <Box key={command}>
          <CommandBlock command={command} />
        </Box>
      ))}
    </Flex>
  );
}
