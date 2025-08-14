import { Box, createStyles, LoadingOverlay, Table, Text } from "@mantine/core";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { loadMessages, messagesSelector } from "@/store/messages";
import { useAppDispatch } from "@/pages/_app";
import { currentSubAccountSelector } from "@/store/account";
import { IMessage } from "@/interfaces/IMessage";
import { Time } from "../Time";

const useStyles = createStyles((theme) => ({
  activeRow: {
    cursor: "pointer",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.dark[1],
  },
  dateRow: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.dark[1],
  },
  row: {
    cursor: "pointer",
  },
  description: {
    maxWidth: "100%",
  },
}));
interface MessagesProps {}

function sortAndMapByDays(arrayOfObjects: IMessage[]): Map<string, IMessage[]> {
  // Sort the array based on the 'createdAt' field
  arrayOfObjects.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Create a map to store the objects with days as keys
  const resultMap = new Map<string, IMessage[]>();

  // Iterate through the sorted array and group objects by day
  arrayOfObjects.forEach((obj) => {
    // Extract the day from the 'createdAt' field
    const date = new Date(obj.createdAt);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }); // 'Tuesday, November 28, 2023'

    // Check if the day is already a key in the map
    if (resultMap.has(formattedDate)) {
      // If the key exists, append the object to the existing array
      resultMap.get(formattedDate).push(obj);
    } else {
      // If the key does not exist, create a new array with the object
      resultMap.set(formattedDate, [obj]);
    }
  });

  return resultMap;
}

export function Messages({}: MessagesProps) {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const { messages, status } = useSelector(messagesSelector);
  const currentSubAccount = useSelector(currentSubAccountSelector);

  useEffect(() => {
    if (currentSubAccount) {
      dispatch(loadMessages(currentSubAccount));
    }
  }, [currentSubAccount]);

  const currentDate = new Date();

  const sorted = Object.fromEntries(
    sortAndMapByDays(
      [...messages].filter((obj) => {
        const createdAtDate = new Date(obj.createdAt);
        const timeDifference = currentDate.getTime() - createdAtDate.getTime();
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
        return daysDifference <= 5;
      })
    )
  );

  return (
    <Box>
      {Object.keys(sorted).length === 0 ? (
        <Text align="center" mb={"sm"} mt={"lg"} mx={"sm"} size={"lg"}>
          No recent messages
        </Text>
      ) : (
        <Table highlightOnHover horizontalSpacing={"xs"} verticalSpacing={"xs"}>
          <tbody>
            {Object.keys(sorted).map((date) => (
              <React.Fragment key={date}>
                <tr>
                  <td
                    colSpan={2}
                    style={{ textAlign: "center" }}
                    className={classes.dateRow}
                  >
                    <strong>{date}</strong>
                  </td>
                </tr>
                {sorted[date].map((item, i) => (
                  <tr key={i}>
                    <td width={70}>
                      <Time
                        date={item.createdAt}
                        absolute={true}
                        format={{ hour: "numeric", minute: "numeric" }}
                      />
                    </td>
                    <td>
                      <Text size={"md"} py={"sm"}>
                        {item.subject}
                      </Text>
                      <Text size={"sm"}>{item.text}</Text>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      )}
      <LoadingOverlay visible={status === "loading"} />
    </Box>
  );
}

export default Messages;
