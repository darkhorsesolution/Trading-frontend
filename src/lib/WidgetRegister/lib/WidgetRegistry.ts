import ObjectMap from "../util/ObjectMap";
import IComponentRegistry from "./IComponentRegistry";
import Registry from "./Registry";
import { PanelProps } from "@/lib/WidgetRegister/lib/ComponentEntry";
import RegistryEntry from "@/lib/WidgetRegister/lib/RegistryEntry";

/**
 * Core functionality of the react-registry library. Use through {@link Registry} instead of directly.
 * For full documentation: {@link https://www.devnet.io/libs/react-registry/docs}
 *
 * @author Joe Esposito <joe@devnet.io>
 */
export default class WidgetRegistry implements IComponentRegistry {
  public static DEFAULT_TARGET: string = "default";

  public static getInstance() {
    if (!WidgetRegistry.instance) {
      WidgetRegistry.instance = new WidgetRegistry();
    }
    return WidgetRegistry.instance;
  }

  private static instance: WidgetRegistry;
  private registries: ObjectMap;

  private constructor() {
    // Initialize the registries container and default target
    const defaultRegistry: Registry = new Registry();

    this.registries = new ObjectMap();
    this.registries.put(WidgetRegistry.DEFAULT_TARGET, defaultRegistry);
  }

  public getWidgets(target?: string): { [key: string]: RegistryEntry } {
    const registry: Registry = this.getRegistry(target);

    return registry.getWidgets();
  }

  public getRegistry(target?: string): Registry {
    target = target ? target : WidgetRegistry.DEFAULT_TARGET;

    if (this.registries.has(target)) {
      return this.registries.get(target) as Registry;
    }

    const newRegistry: Registry = new Registry();
    this.registries.put(target, newRegistry);

    return newRegistry;
  }

  public register(
    component: object,
    key: string,
    conditions?: object,
    target?: string,
    panelProps?: PanelProps
  ): void {
    const registry: Registry = this.getRegistry(target);

    registry.register(component, key, conditions, panelProps);
  }

  public get(
    key: string,
    conditions?: object,
    target?: string
  ): object | undefined {
    const registry = this.getRegistry(target);

    if (registry) {
      return registry.get(key, conditions);
    }

    return undefined;
  }

  public getPanelProps(
    key: string,
    conditions?: object,
    target?: string
  ): PanelProps {
    const registry = this.getRegistry(target);
    if (registry) {
      return registry.getPanelProps(key, conditions);
    }

    return undefined;
  }
}
