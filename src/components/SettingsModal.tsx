import React, { useEffect, useState } from "react";
import { Modal, Text } from "@mantine/core";

export interface SettingsModalProps {
  isOpen?: boolean;
  children?: any;
  onSave: () => void;
  title?: string;
}

const SettingsModal = ({
  children,
  isOpen = false,
  onSave,
  title = "Settings",
}: SettingsModalProps) => {
  const [_isOpen, setIsOpen] = useState(isOpen);

  return (
    <Modal
      opened={_isOpen}
      onClose={() => {
        onSave();
        setIsOpen(false);
      }}
      centered={true}
      title={title}
    >
      {children}
    </Modal>
  );
};

export default SettingsModal;
