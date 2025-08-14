let disabled = false;

function disable() {
  disabled = true;
}

export const StorageKeys = {
  Workspaces: "workspaces",
  CurrentWorkspaceId: "currentWorkspaceId",
  CustomAssets: "customAssets",
  AccountNumber: "accountNumber",
  DesktopVersion: "isDesktop",
  AppChartSymbol: "chart-last-symbol",
};

function saveAccountNumber(accountNumber: string) {
  if (typeof accountNumber === "number") {
    localStorage.setItem(
      StorageKeys.AccountNumber,
      (accountNumber as number).toString()
    );
  } else {
    localStorage.setItem(StorageKeys.AccountNumber, accountNumber);
  }
}

function getAccountNumber(): string {
  const accNumber = localStorage.getItem(StorageKeys.AccountNumber);
  return accNumber;
}

function purgeAccountNumber(): void {
  localStorage.removeItem(StorageKeys.AccountNumber);
}

function getWorkspaces(): any {
  return JSON.parse(localStorage.getItem(StorageKeys.Workspaces));
}

function getCurrentWorkspaceId(): string {
  return localStorage.getItem(StorageKeys.CurrentWorkspaceId);
}

function saveWorkspaces(workspaces: any[]) {
  if (disabled) {
    return;
  }
  localStorage.setItem(StorageKeys.Workspaces, JSON.stringify(workspaces));
}

function saveCurrentWorkspaceId(id: string) {
  if (disabled) {
    return;
  }
  localStorage.setItem(StorageKeys.CurrentWorkspaceId, id);
}

function getCustomAssets(): any {
  return JSON.parse(localStorage.getItem(StorageKeys.CustomAssets));
}

function saveCustomAssets(assets: string[]) {
  localStorage.setItem(StorageKeys.CustomAssets, JSON.stringify(assets));
}

function deleteWorkspaces() {
  localStorage.removeItem(StorageKeys.CurrentWorkspaceId);
  localStorage.removeItem(StorageKeys.Workspaces);
}

function IsDesktopVersionSet(): boolean {
  return localStorage.getItem(StorageKeys.DesktopVersion) !== null;
}

function setIsDesktopVersion(isDesktop: boolean): void {
  localStorage.setItem(StorageKeys.DesktopVersion, isDesktop.toString());
}

function saveAppChartSymbol(symbol: string): void {
  localStorage.setItem(StorageKeys.AppChartSymbol, symbol);
}

function getIsDesktopVersion(): boolean {
  return localStorage.getItem(StorageKeys.DesktopVersion) === "true";
}

const LocalStorageService = {
  disable,
  saveAccountNumber,
  getAccountNumber,
  purgeAccountNumber,
  getWorkspaces,
  getCurrentWorkspaceId,
  saveWorkspaces,
  saveCurrentWorkspaceId,
  getCustomAssets,
  saveCustomAssets,
  deleteWorkspaces,
  setIsDesktopVersion,
  getIsDesktopVersion,
  IsDesktopVersionSet,
  saveAppChartSymbol,
};

export default LocalStorageService;
