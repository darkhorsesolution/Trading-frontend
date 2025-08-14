import ObjectMap from "../util/ObjectMap";
import RegistryEntry from "./RegistryEntry";
import { PanelProps } from "@/lib/WidgetRegister/lib/ComponentEntry";

/**
 * A collection of components with conditions
 * For full documentation: {@link https://www.devnet.io/libs/react-registry/docs}
 *
 * @author Joe Esposito <joe@devnet.io>
 */
export default class Registry {
  private registry: ObjectMap;

  constructor() {
    this.registry = new ObjectMap();
  }

  public register(
    component: object,
    key: string,
    conditions?: object,
    panelProps?: PanelProps
  ): void {
    const entry = this.getEntry(key);

    if (entry) {
      entry.add(component, conditions);
    } else {
      const newEntry = new RegistryEntry();
      newEntry.add(component, conditions, panelProps);
      this.registry.put(key, newEntry);
    }
  }

  public getEntry(key: string): RegistryEntry | undefined {
    return this.registry.get(key);
  }

  public get(key: string, conditions?: object): object | undefined {
    const entry = this.getEntry(key);

    if (entry) {
      return entry.get(false, conditions); // TODO implement mustMatch
    }

    return undefined;
  }

  public getPanelProps(
    key: string,
    conditions?: object
  ): PanelProps | undefined {
    const entry = this.getEntry(key);

    if (entry) {
      return entry.getPanelProps(false, conditions); // TODO implement mustMatch
    }

    return undefined;
  }

  public getWidgets(): { [key: string]: RegistryEntry } {
    return this.registry.list();
  }
}
