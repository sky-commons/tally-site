import { useState, type FormEvent } from "react";
import { Box, Button, Card, Flex, Heading, Section, Text, TextField } from "@radix-ui/themes";
import { isKey, urlKey } from "../api";
import { CommandBlock, SectionHeading } from "../ui";

export function Feeders() {
  const [text, setText] = useState("");
  const [wrong, setWrong] = useState(false);
  const open = (event: FormEvent) => {
    event.preventDefault();
    if (!isKey(text)) {
      setWrong(true);
      return;
    }
    window.location.assign(`/feeders/${urlKey(text)}`);
  };
  return (
    <Section size="2" pt="6">
      <Heading as="h1" size="8" mb="3">
        Find your station
      </Heading>
      <Text as="p" size="4" color="gray" mb="6">
        Paste your receiver's public key.
      </Text>
      <Card size="3" style={{ maxWidth: 760 }}>
        <form onSubmit={open}>
          <Flex gap="3" direction={{ initial: "column", sm: "row" }}>
            <Box flexGrow="1">
              <TextField.Root
                size="3"
                value={text}
                placeholder="6kpsY+KcUgq+9VB7Ey7F…"
                aria-label="Public key"
                onChange={(event) => {
                  setText(event.target.value);
                  setWrong(false);
                }}
                className="mono"
              />
            </Box>
            <Button size="3" type="submit">
              Open
            </Button>
          </Flex>
          {wrong && (
            <Text as="p" size="2" color="red" mt="2">
              That isn't a station key: 43 or 44 characters of base64.
            </Text>
          )}
        </form>
      </Card>
      <Box mt="7" maxWidth="760px">
        <SectionHeading title="Lost it?" lead="The installer printed it. On the receiver:" />
        <Box mt="4">
          <CommandBlock command="sudo tally-feed init --key /etc/tally/key" />
        </Box>
        <Text as="p" size="2" color="gray" mt="2">
          With a key already there, this only prints it.
        </Text>
      </Box>
    </Section>
  );
}
