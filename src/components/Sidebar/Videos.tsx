import { Accordion, Stack } from "@mantine/core";

const list = [
  {
    title: "The basics",
    list: ["QRevInMe5rk"],
  },
];

const Videos = () => {
  return (
    <Stack>
      <Accordion defaultValue="customization">
        <Accordion.Item value="customization">
          <Accordion.Control>The Basics</Accordion.Control>
          <Accordion.Panel>
            Colors, fonts, shadows and many other parts are customizable to fit
            your design needs
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="flexibility">
          <Accordion.Control>The Intermediate</Accordion.Control>
          <Accordion.Panel>
            Configure components appearance and behavior with vast amount of
            settings or overwrite any part of component styles
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="focus-ring">
          <Accordion.Control>Advanced Indicators</Accordion.Control>
          <Accordion.Panel>
            With new :focus-visible pseudo-class focus ring appears only when
            user navigates with keyboard
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
};

export default Videos;
