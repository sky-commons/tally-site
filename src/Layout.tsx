import type { ReactNode } from "react";
import { Container, Flex, IconButton, Link, Separator, Text, Theme } from "@radix-ui/themes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export const repo = "https://github.com/sky-commons/tally";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <Theme accentColor="sky" grayColor="slate" radius="medium" appearance="inherit">
      <Container size="3" px="4">
        <Flex asChild align="center" justify="between" gap="4" height="64px">
          <header>
            <a href="/" className="brand">
              <img src="/favicon.svg" alt="" width="24" height="24" />
              <Text weight="bold" size="4">
                Tally
              </Text>
            </a>
            <Flex asChild align="center" gap="5">
              <nav>
                <NavLink href="/leaderboard/">Leaderboard</NavLink>
                <NavLink href="/#feed" wide>
                  Feed
                </NavLink>
                <NavLink href="/#relay" wide>
                  Run a relay
                </NavLink>
                <IconButton variant="ghost" color="gray" size="2" asChild>
                  <a href={repo} aria-label="Tally on GitHub">
                    <GitHubLogoIcon width="18" height="18" />
                  </a>
                </IconButton>
              </nav>
            </Flex>
          </header>
        </Flex>

        <main>{children}</main>

        <Separator size="4" />
        <Flex asChild justify="between" align="center" gap="4" wrap="wrap" py="6">
          <footer>
            <Text size="2" color="gray">
              Tally is a{" "}
              <Link href="https://skycommons.org" color="gray" underline="always">
                Sky Commons
              </Link>{" "}
              project. Pilots say “tally” when they have the traffic in sight.
            </Text>
            <Link href="https://github.com/sky-commons" size="2">
              github.com/sky-commons
            </Link>
          </footer>
        </Flex>
      </Container>
    </Theme>
  );
}

function NavLink({ href, wide, children }: { href: string; wide?: boolean; children: ReactNode }) {
  return (
    <Link href={href} size="2" weight="medium" className={wide ? "wide-only" : undefined}>
      {children}
    </Link>
  );
}
