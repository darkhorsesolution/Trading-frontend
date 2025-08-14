import { useSelector } from "react-redux";
import { Widgets } from "@/lib/WidgetRegister";
import {
  Box,
  CloseButton,
  createStyles,
  Flex,
  Group,
  Input,
  ScrollArea,
  SegmentedControl,
  Text,
  Textarea,
  TextInput,
  Button,
  LoadingOverlay,
  Select,
  ActionIcon,
  Table,
} from "@mantine/core";
import { IDockviewPanelHeaderProps, IDockviewPanelProps } from "dockview";
import { IconEdit, IconGripVertical, IconTrash } from "@tabler/icons";
import { useAppDispatch } from "@/pages/_app";
import React, { useEffect, useState } from "react";
import { IMessage } from "@/interfaces/IMessage";
import { upsertMessage } from "@/store/messages";
import dayjs from "dayjs";
import { accountSelector } from "@/store/account";
import { ApiFetch } from "@/utils/network";
import { IUser } from "@/interfaces/account";
import Tab from "../Tab";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    height: "100%",
    ".mantine-ScrollArea-scrollbar": {
      zIndex: 1000,
    },
  },
  content: {
    flex: 1,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    thead: {
      tr: {
        th: {
          paddingLeft: theme.spacing.sm,
          paddingRight: theme.spacing.sm,
        },
      },
    },
    tbody: {
      tr: {
        cursor: "pointer",
        td: {
          paddingLeft: theme.spacing.sm,
          paddingRight: theme.spacing.sm,
        },
        "&.even": {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[1],
        },
        "&.dayrow": {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[7]
              : theme.colors.gray[0],
          color:
            theme.colorScheme === "dark"
              ? theme.colors.gray[0]
              : theme.colors.dark[7],
          td: {
            padding: theme.spacing.sm,
            textAlign: "center",
          },
        },
      },
    },
    th: {
      textAlign: "left",
      fontWeight: "normal",
    },
  },
}));

const requestMessages = async (): Promise<Array<IMessage>> => {
  try {
    return await ApiFetch<Array<IMessage>>(`/api/admin/messages/list`);
  } catch (error) {
    if (!error || !error.response) {
      throw error;
    }
    return [];
  }
};

const requestDeleteMessage = async (
  messId: string
): Promise<Array<IMessage>> => {
  try {
    return await ApiFetch<Array<IMessage>>(
      `/api/admin/messages/${messId}/delete`
    );
  } catch (error) {
    if (!error || !error.response) {
      throw error;
    }
    return [];
  }
};

const requestUsers = async (): Promise<Array<IUser>> => {
  try {
    return await ApiFetch<Array<IUser>>(`/api/admin/users/list`);
  } catch (error) {
    if (!error || !error.response) {
      throw error;
    }
    return [];
  }
};

export type AdministrationProps = IDockviewPanelProps<{
  settingsOpen: boolean;
}>;

const components = {
  NewMessage: { label: "New Message", value: "1" },
  Messages: { label: "Messages", value: "2" },
};

const Messages = ({ params, api }: AdministrationProps) => {
  const dispatch = useAppDispatch();
  const { classes } = useStyles();
  const { subUsers, loginAccount } = useSelector(accountSelector);
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [allMessages, setAllMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loginUser = subUsers[loginAccount];
  const [control, setControl] = useState(components.NewMessage.value);
  const [messageData, setMessageData] = useState<Partial<IMessage>>({
    subject: "",
    text: "",
  });
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    requestUsers()
      .then(setAllUsers)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (expandedMessage) {
      setMessageData({ ...messageData, id: expandedMessage });
    }
  }, [expandedMessage]);

  useEffect(() => {
    setMessageData({});
    setExpandedMessage(null);
    if (control === components.Messages.value) {
      setLoading(true);
      requestMessages()
        .then(setAllMessages)
        .finally(() => setLoading(false));
    }
  }, [control]);

  const deleteMessage = async (messId: string) => {
    setLoading(true);
    try {
      await requestDeleteMessage(messId);
    } catch (e) {
      //
    }
    await requestMessages().then(setAllMessages);
    setLoading(false);
  };

  if (!loginUser.admin) {
    return (
      <Box className={classes.wrapper} p={"sm"}>
        You need to be logged in as admin
      </Box>
    );
  }

  const recipients = [{ label: "All", key: "all", value: undefined }].concat(
    allUsers.map((u) => ({ label: u.account, value: u.id, key: u.id }))
  );

  return (
    <Box className={classes.wrapper}>
      <ScrollArea
        style={{
          zIndex: 100,
          height: "100%",
          width: "100%",
        }}
        scrollHideDelay={250}
      >
        <SegmentedControl
          size={"sm"}
          data={Object.values(components)}
          ml={0}
          fullWidth={true}
          value={control}
          onChange={(val) => setControl(val)}
        />
        {control === components.NewMessage.value && (
          <Box p={"sm"}>
            <Select
              mb={"sm"}
              label="Recipient"
              placeholder="All"
              data={recipients}
              searchable
              onChange={(val) =>
                setMessageData({ ...messageData, userId: val })
              }
            />

            <Input.Wrapper mb={"sm"}>
              <Input.Label>Subject*</Input.Label>
              <TextInput
                onChange={(val) =>
                  setMessageData({ ...messageData, subject: val.target.value })
                }
              />
            </Input.Wrapper>

            <Input.Wrapper mb={"lg"}>
              <Input.Label>Text*</Input.Label>
              <Textarea
                autosize
                onChange={(val) =>
                  setMessageData({ ...messageData, text: val.target.value })
                }
              />
            </Input.Wrapper>

            <Button
              disabled={!messageData.subject || !messageData.text}
              onClick={() =>
                dispatch(upsertMessage(messageData))
                  .then(requestMessages)
                  .then(setAllMessages)
              }
            >
              Send
            </Button>
          </Box>
        )}
        {control === components.Messages.value && (
          <Box py={"sm"}>
            <LoadingOverlay visible={loading} />
            <Table striped={true} className={classes.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allMessages.map((item, i) => (
                  <React.Fragment key={i}>
                    <tr className={i % 2 === 0 ? "even" : "odd"}>
                      <td>{dayjs(item.createdAt).format("HH:mm")}</td>
                      <td>{item.subject}</td>
                      <td>
                        <Flex>
                          <ActionIcon
                            onClick={() => {
                              setExpandedMessage(
                                item.id === expandedMessage ? null : item.id
                              );
                              setMessageData(item);
                            }}
                          >
                            <IconEdit size={"16"} />
                          </ActionIcon>
                          <ActionIcon onClick={() => deleteMessage(item.id)}>
                            <IconTrash size={"16"} />
                          </ActionIcon>
                        </Flex>
                      </td>
                    </tr>
                    {expandedMessage === item.id && (
                      <tr className={i % 2 === 0 ? "even" : "odd"}>
                        <td colSpan={3}>
                          <Box p={"sm"}>
                            <Text>Edit message:</Text>
                            <Select
                              mb={"sm"}
                              label="Recipient"
                              placeholder="All"
                              defaultValue={item.userId}
                              data={recipients}
                              searchable
                              onChange={(val) =>
                                setMessageData({ ...messageData, userId: val })
                              }
                            />

                            <Input.Wrapper mb={"sm"}>
                              <Input.Label>Subject</Input.Label>
                              <TextInput
                                error={!messageData.subject ? "Required" : ""}
                                defaultValue={item.subject}
                                onChange={(val) =>
                                  setMessageData({
                                    ...messageData,
                                    subject: val.target.value,
                                  })
                                }
                              />
                            </Input.Wrapper>

                            <Input.Wrapper mb={"lg"}>
                              <Input.Label>Text</Input.Label>
                              <Textarea
                                error={!messageData.text ? "Required" : ""}
                                required={true}
                                autosize
                                defaultValue={item.text}
                                onChange={(val) =>
                                  setMessageData({
                                    ...messageData,
                                    text: val.target.value,
                                  })
                                }
                              />
                            </Input.Wrapper>

                            <Button
                              disabled={
                                !messageData.subject || !messageData.text
                              }
                              onClick={() =>
                                dispatch(upsertMessage(messageData))
                                  .then(requestMessages)
                                  .then(setAllMessages)
                              }
                            >
                              Update
                            </Button>
                          </Box>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </Box>
        )}
      </ScrollArea>
    </Box>
  );
};

Widgets.register(Messages, "messages", {
  closable: true,
  admin: true,
  title: "Messages",
  tabComponent: (props: IDockviewPanelHeaderProps) => (
    <Tab {...props} withSetting={false} />
  ),
});

export default Messages;
