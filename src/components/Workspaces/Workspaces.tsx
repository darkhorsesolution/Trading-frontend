import { ComponentProps } from "@/components";
import React from "react";
import {
  ActionIcon,
  Box,
  Flex,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Switch,
  Table,
  Text,
  clsx,
  createStyles,
} from "@mantine/core";
import { useAppDispatch } from "@/pages/_app";
import {
  IWorkspace,
  deleteWorkspace,
  updateWorkspaces,
} from "@/store/workspace";
import { IconTrash } from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  normalFont: {
    fontWeight: "normal",
  },
  box: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    width: "100%",
    height: "100%",
  },
  image: {
    fit: "contain",
  },
  table: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    width: "100%",
    tableLayout: "fixed",
    th: {
      width: "200px",
      verticalAlign: "top",
      textAlign: "left",
      paddingRight: "1rem",
      paddingBottom: "1.5rem",
    },
    td: {
      verticalAlign: "top",
    },
  },
  tabPanel: {
    minHeight: "300px",
  },
}));

export type WorkspacesProps = {
  workspaces: IWorkspace[];
  workspacesSyncing: boolean;
  activeWorkspaceId: string;
  closeAction?: () => void;
} & ComponentProps;

const Workspaces = ({
  workspaces,
  workspacesSyncing,
  activeWorkspaceId,
  children,
  style,
  className,
}: WorkspacesProps) => {
  const { classes, cx } = useStyles();
  const dispatch = useAppDispatch();
  return (
    <Paper
      className={clsx(className)}
      shadow={"xl"}
      p={"md"}
      pl={children ? 30 : "md"}
      radius={"md"}
      style={style}
    >
      {children}
      <ScrollArea
        style={{
          height: "100%",
        }}
      >
        <LoadingOverlay visible={workspacesSyncing} />
        <Flex direction={"column"} px={"sm"}>
          <Box className={classes.box} mb={"sm"}>
            <Text size={"lg"} mb={"md"} weight={"bold"}>
              Workspaces
            </Text>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Visible</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((w) => (
                  <tr key={w.id}>
                    <td>{(activeWorkspaceId === w.id ? `* ` : "") + w.name}</td>
                    <td>
                      <Switch
                        checked={!w.hidden}
                        onChange={() =>
                          dispatch(
                            updateWorkspaces({ ...w, hidden: !w.hidden })
                          )
                        }
                      />
                    </td>
                    <td>
                      <ActionIcon
                        onClick={() => dispatch(deleteWorkspace(w.id))}
                      >
                        <IconTrash size={"16"} />
                      </ActionIcon>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Flex>
      </ScrollArea>
    </Paper>
  );
};

export default Workspaces;
