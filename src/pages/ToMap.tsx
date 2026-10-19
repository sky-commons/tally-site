import { useEffect } from "react";
import { Link, Section, Text } from "@radix-ui/themes";

/** A short link (/<hex>, /<registration>, /<lat>,<lon>): straight on to the full map. */
export function ToMap({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);
  return (
    <Section size="3">
      <Text color="gray">
        Taking you to the <Link href={href}>map</Link>…
      </Text>
    </Section>
  );
}
