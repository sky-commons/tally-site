import { Button, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { Layout } from "./Layout";
import { route } from "./routes";
import { Feeder } from "./pages/Feeder";
import { Feeders } from "./pages/Feeders";
import { Home } from "./pages/Home";
import { Leaderboard } from "./pages/Leaderboard";

export function App({ path }: { path: string }) {
  const page = route(path);
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
