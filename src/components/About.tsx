import { Stack, Text } from "@mantine/core";
import Logo from "@/components/Logo";

const About = ({ appVersion }) => {
  return (
    <Stack>
      <Logo />
      <Text>version {appVersion}</Text>
    </Stack>
  );
};

export default About;
