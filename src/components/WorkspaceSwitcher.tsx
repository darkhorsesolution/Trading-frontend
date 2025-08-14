import React, { useEffect, useRef, useState } from "react";
import { ComponentProps } from "./index";
import {
  switchWorkspace,
  IWorkspace,
  workspaceSelector,
  toggleWorkspaceVisiblity,
  updateWorkspaces,
} from "@/store/workspace";
import { useAppDispatch } from "@/pages/_app";
import { useSelector } from "react-redux";
import { Button, Group, LoadingOverlay, Modal, Stack, Text, TextInput } from "@mantine/core";
import { v4 as uuid } from "uuid";
import { IconPlus, IconX } from "@tabler/icons";
import { DockviewApi } from "dockview";
import { modals } from "@mantine/modals";
import { Modals } from "./Modals";
import { useLocalStorage } from "@mantine/hooks";

export type WorkspaceSwitcherProps = {
  api: DockviewApi;
  spacing?: string | number;
} & ComponentProps;

const WorkspaceButton = ({
  isCurrent,
  workspace,
  isClosable,
  onClose,
  onRename,
  spacing = "md",
}) => {
  const dispatch = useAppDispatch();

  return (
    <Button
      sx={(theme) => ({
        marginTop: -theme.spacing[spacing],
      })}
      title={isCurrent ? workspace.name : `Open '${workspace.name}' workspace`}
      variant={isCurrent ? "filled" : "subtle"}
      color="gray"
      onClick={() => dispatch(switchWorkspace(workspace.id))}
      onDoubleClick={() => onRename(workspace.id)}
    >
      <span className="truncate text-sm">{workspace.name}</span>
      {isCurrent && isClosable && (
        <IconX
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          size={16}
          style={{ marginLeft: 10 }}
        />
      )}
    </Button>
  );
};

const ModalContent = ({ id, workspaces, api }: { id: string, workspaces: IWorkspace[], api: any }) => {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dispatch = useAppDispatch();

  async function saveNewWorkspace() {
    setLoading(true);
    try {
      const res = await dispatch(
        updateWorkspaces({
          id: uuid(),
          name: inputRef.current.value,
          hidden: false,
          value: api.toJSON(),
        })
      );
      if ((res as Record<string, unknown>).error) {
        throw (res as any).error.message;
      }
      modals.closeAll();
    } catch (e) {
      setError(e.toString());
    }
    setLoading(false);
  }

  async function updateWorkspace() {
    setLoading(true);
    try {
      const res = await dispatch(
        updateWorkspaces({
          id,
          name: inputRef.current.value,
          hidden: false,
          value: api.toJSON(),
        })
      );
      if ((res as Record<string, unknown>).error) {
        throw (res as any).error.message;
      }
      modals.closeAll();
    } catch (e) {
      setError(e.toString());
    }
    setLoading(false);
  }

  return (
    <Stack>
      <LoadingOverlay visible={loading} />
      <TextInput
        mt={"sm"}
        type={"text"}
        size="md"
        ref={inputRef}
        defaultValue={workspaces.find((w) => w.id === id)?.name}
        placeholder={"Workspace name"}
      />
      {error && <Text color="red">{error}</Text>}
      <Group grow>
        <Button
          size="sm"
          className="text-md"
          onClick={() => {
            if (id) {
              updateWorkspace();
            } else {
              saveNewWorkspace();
            }
          }}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );
};


const WorkspaceSwitcher = ({ api }: WorkspaceSwitcherProps) => {
  const { currentWorkspaceId, workspaces } = useSelector(workspaceSelector);
  const [activeWorkspaceId, setActiveWorkspaceId] = useLocalStorage({
    key: "active-workspace-id",
    getInitialValueInEffect: false,
  });

  useEffect(() => {
    if (currentWorkspaceId !== activeWorkspaceId) {
      dispatch(switchWorkspace(activeWorkspaceId))
    }
  }, [])
  useEffect(() => {
    setActiveWorkspaceId(currentWorkspaceId)
  }, [currentWorkspaceId])

  const dispatch = useAppDispatch();

  const isCurrentWorkspace = (workspace: IWorkspace): boolean => {
    return workspace.id === currentWorkspaceId;
  };

  return (
    <>
      <Group style={{ flex: 1 }}>
        {workspaces && workspaces.length > 0 && (
          <Group p={"xs"} spacing={"xs"}>
            {workspaces
              .filter((w) => !w.hidden)
              .map((workspace, index) => (
                <WorkspaceButton
                  onClose={(e) => {
                    dispatch(toggleWorkspaceVisiblity(workspace.id));
                  }}
                  workspace={workspace}
                  key={index}
                  isCurrent={
                    isCurrentWorkspace(workspace) || workspaces.length === 1
                  }
                  onRename={(id) => {
                    modals.openContextModal({
                      modal: Modals.WidgetSettingsModal,
                      title: "Change workspace name",
                      innerProps: {
                        settings: {},
                        children: <ModalContent id={id} api={api} workspaces={workspaces} />,
                      },
                    });
                  }}
                  isClosable={true}
                />
              ))}
          </Group>
        )}
        <Button
          title="Add new workspace"
          variant={"subtle"}
          color={"gray"}
          compact
          onClick={() => {
            modals.openContextModal({
              modal: Modals.WidgetSettingsModal,
              title: "Add new workspace",
              innerProps: {
                settings: {},
                children: <ModalContent id={""} api={api} workspaces={workspaces} />,
              },
            });
          }}
        >
          <IconPlus size={14} />
        </Button>
      </Group>
    </>
  );
};

export default WorkspaceSwitcher;
