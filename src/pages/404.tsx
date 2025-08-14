import { Anchor, Box, Text } from "@mantine/core";

const NotFound = () => {
  return (
    <Box p={"md"}>
      <h1 className={"max-w-2xl"}>404</h1>
      <Text>The page you have requested is not accessible</Text>
      <Anchor href="/">Back</Anchor>
    </Box>
  );
};

export default NotFound;
