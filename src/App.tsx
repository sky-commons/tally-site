import { Button, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { Layout } from "./Layout";
import { mapLink, route } from "./routes";
import { Api } from "./pages/Api";
import { Feeder } from "./pages/Feeder";
import { Feeders } from "./pages/Feeders";
import { Hardware } from "./pages/Hardware";
import { Home } from "./pages/Home";
import { Leaderboard } from "./pages/Leaderboard";
import { ToMap } from "./pages/ToMap";

export function App({ path }: { path: string }) {
  const page = route(path);
  const toMap = mapLink(page);
  return (
    <Layout>
      {page.kind === "home" ? (
        <Home />
      ) : page.kind === "leaderboard" ? (
        <Leaderboard />
      ) : page.kind === "feeders" ? (
        <Feeders />
      ) : page.kind === "feeder" ? (
        <Feeder stationKey={page.key} />
      ) : page.kind === "api" ? (
        <Api />
      ) : page.kind === "hardware" ? (
        <Hardware />
      ) : toMap ? (
        <ToMap href={toMap} />
      ) : (
        <Section size="3">
          <Flex direction="column" align="start" gap="4">
            <Heading as="h1" size="8">
              Nothing here
            </Heading>
            <Text color="gray">This page doesn't exist.</Text>
            <Button asChild>
              <a href="/">Home</a>
            </Button>
          </Flex>
        </Section>
      )}
    </Layout>
  );
}
