import { useState } from "react";
import LocalStorageService from "@/services/LocalStorageService";
import { useMediaQuery } from "@mantine/hooks";
import { em } from "@mantine/core";

export enum Device {
  NotSet = -1,
  Default = 0,
  Mobile = 1,
  Desktop = 2,
}
function useDevice() {
  const [device, setDevice] = useState(Device.NotSet);
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`); // 750 should be app?

  if (isMobile === undefined) {
    return Device.NotSet;
  }

  let newDevice: Device;

  if (isMobile) {
    newDevice = Device.Mobile;
  } else if (
    LocalStorageService.IsDesktopVersionSet() &&
    LocalStorageService.getIsDesktopVersion()
  ) {
    newDevice = Device.Desktop;
  } else {
    newDevice = Device.Default;
  }

  if (newDevice !== device) {
    setDevice(newDevice);
  }

  return newDevice;
}

export { useDevice };
