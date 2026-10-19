import type { ReactNode } from "react";
import { Box, Button, Card, Flex, Grid, Heading, Link, Section, Separator, Text } from "@radix-ui/themes";
import { installCommand } from "./Home";
import { CommandBlock, InlineCode, NoteList, SectionHeading } from "../ui";

const parts: { title: string; body: ReactNode }[] = [
  {
    title: "Computer",
    body: "A Raspberry Pi 4 or 5, or any small Linux box.",
  },
  {
    title: "Receiver",
    body: "An RTL-SDR with a 1090 MHz filter and LNA, such as the FlightAware Pro Stick Plus. Airspy Mini or R2 for a serious site.",
  },
  {
    title: "Antenna",
    body: "A 1090 MHz collinear, as high and clear as you can get it. Short, low-loss coax.",
  },
  {
    title: "UAT (US only)",
    body: (
      <>
        Optional: a second dongle on 978 MHz with dump978, fed with <InlineCode>--uat</InlineCode>.
      </>
    ),
  },
];

const antennaNotes: ReactNode[] = [
  "Height and a clear horizon matter more than anything else. Range is line of sight.",
  "Every metre of thin coax at 1090 MHz costs signal. Put the LNA near the antenna if the run is long.",
  "Outdoors beats indoors; a window beats a basement. Keep it away from metal and other antennas.",
  "Check your local rules for masts and roof work.",
];

export function Hardware() {
  return (
    <>
      <Section size="2" pt="6" pb="5">
        <Flex direction="column" gap="3" maxWidth="760px">
          <Heading as="h1" size="8">
            Hardware
          </Heading>
          <Text as="p" size="4" color="gray">
            A 1090 MHz receiver is four parts. Already running one? Skip to{" "}
            <Link href="/#feed">Feed Tally</Link>.
          </Text>
        </Flex>
      </Section>

      <Separator size="4" />

      <Section size="2">
        <SectionHeading title="What you need" />
        <Grid columns={{ initial: "1", sm: "2" }} gap="4" mt="5">
          {parts.map((part) => (
            <Card key={part.title} size="2">
              <Flex direction="column" gap="2">
                <Heading as="h3" size="4">
                  {part.title}
                </Heading>
                <Text as="p" size="2" color="gray">
                  {part.body}
                </Text>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Section>

      <Separator size="4" />

      <Section size="2">
        <SectionHeading title="The antenna" lead="It decides your range." />
        <NoteList items={antennaNotes} />
      </Section>

      <Separator size="4" />

      <Section size="2">
        <SectionHeading
          title="Software"
          lead={
            <>
              Flash <Link href="https://adsb.im">adsb.im</Link>, or install readsb on the OS you run.
              Then add Tally:
            </>
          }
        />
        <Box mt="5">
          <CommandBlock command={installCommand} />
        </Box>
        <Flex gap="3" mt="5" wrap="wrap">
          <Button size="3" asChild>
            <a href="/#feed">Feed Tally</a>
          </Button>
          <Button size="3" variant="outline" color="gray" asChild>
            <a href="https://github.com/wiedehopf/adsb-scripts/wiki/Automatic-installation-for-readsb">
              readsb install script
            </a>
          </Button>
        </Flex>
      </Section>
    </>
  );
}
