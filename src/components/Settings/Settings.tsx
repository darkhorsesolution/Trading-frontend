import { accountSelector, updateSettings } from "@/store/account";
import { ComponentProps } from "@/components";
import React, { useEffect, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  createStyles,
  Group,
  Image,
  Input,
  LoadingOverlay,
  NumberInput,
  SegmentedControl,
  Slider,
  Switch,
  Table,
  Text,
} from "@mantine/core";
import { format } from "timeago.js";
import QRCode from "qrcode";
import { ApiFetch } from "@/utils/network";
import { showNotification } from "@mantine/notifications";
import { useAppDispatch, useAppSelector } from "@/pages/_app";
import { ISettings } from "@/interfaces/account";
import { Session } from "next-auth";
import ThemeSwitch from "../Layout/ThemeSwitch";

const useStyles = createStyles((theme) => ({
  box: {
    padding: theme.spacing.lg,
    width: "100%",
    overflow: "hidden",
  },
  image: {
    fit: "contain",
  },
  table: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    th: {
      width: "200px",
      verticalAlign: "middle",
      textAlign: "left",
      paddingRight: "1rem",
      paddingBottom: "1.5rem",
    },
    td: {
      verticalAlign: "middle",
    },
  },
  tabPanel: {
    minHeight: "300px",
  },
}));

// max X values in predefined volume sizes
const MAX_CONSTANT_VOLUMES = 4;
const QUOTE_RATE = [
  { value: 1, label: "Power save", ms: 1000 },
  { value: 2, label: "Default", ms: 500 },
  { value: 3, label: "Fastest", ms: 100 },
];

const POLLING_RATE = [
  { value: 1, label: "Power save", ms: 10000 },
  { value: 2, label: "Default", ms: 5000 },
  { value: 3, label: "Fastest", ms: 2500 },
];

const assetGroups = [
  {
    name: "forex",
    switch: "forexAssets",
    fixedSizes: "forexAssetsVolumes",
    defaultSize: "lotSizeForex",
    sizeStep: 1000
  },
  {
    name: "metals",
    switch: "metalsAssets",
    fixedSizes: "metalsAssetsVolumes",
    defaultSize: "lotSizeMetals",
    sizeStep: 10
  },
  {
    name: "indices",
    switch: "indicesAssets",
    fixedSizes: "indicesAssetsVolumes",
    defaultSize: "lotSizeIndices",
    sizeStep: 0.1
  },
  {
    name: "energies",
    switch: "energiesAssets",
    fixedSizes: "energiesAssetsVolumes",
    defaultSize: "lotSizeEnergies",
    sizeStep: 10
  },
  {
    name: "crypto",
    switch: "cryptoAssets",
    fixedSizes: "cryptoAssetsVolumes",
    defaultSize: "lotSizeCrypto",
    sizeStep: 1
  },
];

export type SettingsProps = {
  session: Session;
  closeAction?: () => void;
} & ComponentProps;

const Settings = ({ closeAction }: SettingsProps) => {
  const { classes, cx } = useStyles();
  const dispatch = useAppDispatch();

  const { settings, loading, currentSubAccount, subUsers, loginAccount } =
    useAppSelector(accountSelector);
  const account = subUsers[loginAccount].admin
    ? loginAccount
    : currentSubAccount;

  const [settingsData, setSettingsData] = useState<ISettings>({ ...settings });
  const [qrcodeUrl, setqrCodeUrl] = useState("");
  const [loader, setLoader] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  useEffect(() => {
    if (!settings) {
      return;
    }

    setSettingsData({
      ...settings,
    });

    if (settings.twoFactorUrl) {
      QRCode.toDataURL(settings.twoFactorUrl).then(setqrCodeUrl);
    } else {
      setqrCodeUrl("");
    }
  }, [settings]);

  useEffect(() => {
    setLoader(loading);
  }, [loading]);

  function saveSettings() {
    dispatch(updateSettings(settingsData)).then(closeAction);
  }

  return (
    <>
      <LoadingOverlay visible={loader} overlayBlur={2} />
      {settings && (
        <>
          <Box className={classes.box}>
            <Text size={"lg"} mb={"md"} weight={"bold"}>
              Info
            </Text>
            <Table className={classes.table}>
              <tbody>
                <tr>
                  <th>Account</th>
                  <td>{account}</td>
                </tr>
                <tr>
                  <th>Last updated</th>
                  <td>{format(settings.updatedAt)}</td>
                </tr>
                <tr>
                  <th>2FA</th>
                  <td>
                    <Switch
                      checked={!!settingsData.twoFactorUrl}
                      onChange={(evt) => {
                        setSettingsData({
                          ...settingsData,
                          twoFactorUrl: evt.currentTarget.checked ? "true" : "",
                        });
                      }}
                    />
                  </td>
                </tr>
                {qrcodeUrl && (
                  <>
                    <tr>
                      <th>Configuring Google Authenticator or Authy</th>
                      <td>
                        <ol
                          style={{
                            margin: 0,
                            padding: 0,
                            marginLeft: "12px",
                          }}
                        >
                          <li>
                            Install Google Authenticator (IOS - Android) or
                            Authy (IOS - Android).
                          </li>
                          <li>In the authenticator app, select "+" icon.</li>
                          <li>
                            Select "Scan a barcode (or QR code)" and use the
                            phone's camera to scan this barcode.
                          </li>
                        </ol>
                        {qrcodeUrl && (
                          <Box mt={"sm"}>
                            <Image width={200} src={qrcodeUrl} />
                          </Box>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>Test code</th>
                      <td>
                        <Input
                          onChange={(val) => setTwoFactorCode(val.target.value)}
                        />
                        <Button
                          mt={"sm"}
                          onClick={async () => {
                            try {
                              const data = await ApiFetch<{
                                success: boolean;
                              }>(`/api/auth/validate?token=${twoFactorCode}`);
                              if (data.success) {
                                showNotification({
                                  title: "Code valid",
                                  message: "",
                                  color: "green",
                                });
                              } else {
                                showNotification({
                                  title: "Code invalid",
                                  message: "",
                                  color: "red",
                                });
                              }
                            } catch (e) {
                              showNotification({
                                title: "Cannot validate code",
                                message: e.toString(),
                                color: "red",
                              });
                            }
                          }}
                        >
                          Test
                        </Button>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </Table>
          </Box>
          <Box className={classes.box}>
            <Text size={"lg"} mb={"md"} weight={"bold"}>
              Platform settings
            </Text>
            <Table className={classes.table}>
              <tbody>
                <tr>
                  <th>Order execution</th>
                  <td>
                    <SegmentedControl
                      data={[
                        { label: "Single click", value: "single" },
                        { label: "Double", value: "double" },
                      ]}
                      value={
                        settingsData.tableRowDblClick ? "double" : "single"
                      }
                      onChange={(val) => {
                        setSettingsData({
                          ...settingsData,
                          tableRowDblClick: val === "double",
                        });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Order routing</th>
                  <td>
                    <SegmentedControl
                      data={[
                        { label: "Default", value: "false" },
                        { label: "Direct", value: "true" },
                      ]}
                      value={settingsData.directOrders ? "true" : "false"}
                      onChange={(val) => {
                        setSettingsData({
                          ...settingsData,
                          directOrders: val === "true",
                        });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Sound effects</th>
                  <td>
                    <Switch
                      checked={settingsData.sounds}
                      onChange={(evt) => {
                        setSettingsData({
                          ...settingsData,
                          sounds: evt.currentTarget.checked,
                        });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Data refresh interval</th>
                  <td style={{ paddingLeft: "22px", paddingRight: "22px" }}>
                    <div>
                      <Slider
                        key={JSON.stringify(settingsData)}
                        label={(val) =>
                          QUOTE_RATE.find((mark) => mark.value === val).label
                        }
                        min={1}
                        max={QUOTE_RATE[QUOTE_RATE.length - 1].value}
                        marks={QUOTE_RATE}
                        step={1}
                        value={
                          QUOTE_RATE.find(
                            (e) => e.ms === settingsData.quotesRate
                          ).value
                        }
                        onChange={(val) =>
                          setSettingsData({
                            ...settingsData,
                            quotesRate: QUOTE_RATE.find((e) => e.value === val)
                              .ms,
                          })
                        }
                        px={"2rem"}
                        mb={"xl"}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>Polling rate interval</th>
                  <td style={{ paddingLeft: "22px", paddingRight: "22px" }}>
                    <div>
                      <Slider
                        key={JSON.stringify(settingsData)}
                        label={(val) =>
                          POLLING_RATE.find((mark) => mark.value === val).label
                        }
                        min={1}
                        max={POLLING_RATE[POLLING_RATE.length - 1].value}
                        marks={POLLING_RATE}
                        step={1}
                        value={
                          POLLING_RATE.find(
                            (e) => e.ms === settingsData.pollingRate
                          ).value
                        }
                        onChange={(val) => {
                          setSettingsData({
                            ...settingsData,
                            pollingRate: POLLING_RATE.find(
                              (e) => e.value === val
                            ).ms,
                          });
                        }}
                        px={"2rem"}
                        mb={"xl"}
                      />
                    </div>
                  </td>
                </tr>
                {subUsers[currentSubAccount].admin ||
                  subUsers[currentSubAccount].institutional ? (
                  <tr>
                    <th>Show internal closing action in open orders</th>
                    <td>
                      <Switch
                        checked={settingsData.enableInternalActions}
                        onChange={(evt) => {
                          setSettingsData({
                            ...settingsData,
                            enableInternalActions: evt.currentTarget.checked,
                          });
                        }}
                      />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </Box>
          <Box className={classes.box}>
            <Text size={"lg"} mb={"md"} weight={"bold"}>
              UI settings
            </Text>
            <Table className={classes.table}>
              <tbody>
                <tr>
                  <th>Dark theme</th>
                  <td>
                    <ActionIcon>
                      <ThemeSwitch switch={true} />
                    </ActionIcon>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Box>
          <Box className={classes.box}>
            <Text size={"lg"} mb={"md"} weight={"bold"}>
              Market settings
            </Text>
            <Table className={classes.table}>
              <tbody>
                {
                  assetGroups.map(grp => (
                    <tr key={grp.name}>
                      <th>Show {grp.name} group</th>
                      <td>
                        <Switch
                          checked={settingsData[grp.switch]}
                          onChange={(evt) => {
                            setSettingsData({
                              ...settingsData,
                              [grp.switch]: evt.currentTarget.checked,
                            });
                          }}
                        />
                      </td>
                      <td>
                        <Input.Wrapper mb={"sm"} label="Default lot size / step">
                          <NumberInput
                            size="xs"
                            min={0}
                            step={grp.sizeStep}
                            precision={1}
                            removeTrailingZeros={false}
                            onChange={(val) => {
                              setSettingsData({
                                ...settingsData,
                                [grp.defaultSize]: val || 0,
                              });
                            }}
                            value={settingsData[grp.defaultSize]}
                            noClampOnBlur
                          />
                        </Input.Wrapper>
                        <Input.Wrapper label="Trade Panel lot Sizes">
                          <Input size={"xs"} placeholder="1000,2000,3000" value={(settingsData[grp.fixedSizes] || []).join(",")} onChange={(evt) => {
                            setSettingsData({
                              ...settingsData,
                              [grp.fixedSizes]: evt.currentTarget.value.split(",").map(v => v.trim()).slice(0, MAX_CONSTANT_VOLUMES),
                            });
                          }}
                          />
                        </Input.Wrapper>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </Box>
          <Group grow={true} className={classes.box}>
            {closeAction && (
              <Button variant={"subtle"} size="sm" onClick={closeAction}>
                Cancel
              </Button>
            )}
            <Button size="sm" mt="sm" onClick={saveSettings}>
              Save
            </Button>
          </Group>
        </>
      )}
    </>
  );
};

export default Settings;
