import * as React from "react";

import WidgetRegistry from "@/lib/WidgetRegister/lib/WidgetRegistry";
import { Arguments, IArguments } from "./util/Arguments";
import { logger } from "@/lib/logger";
import { PanelProps } from "@/lib/WidgetRegister/lib/ComponentEntry";

export default class Widgets {
  /**
   * Validates and registers an object or function using supplied {@link Arguments}
   *
   * For usage: {@link https://www.devnet.io/libs/react-registry/doc/#/registering}
   *
   * @param component the object or function to be registered
   * @param params options, parsed to {@link Arguments}
   * @param panelProps PanelProps, parsed to {@link PanelProps}
   * @param tabComponent the object or function to be registered
   */
  public static register(
    component: any,
    params?: string | IArguments,
    panelProps?: PanelProps
  ): void {
    if (
      (typeof component === "object" || typeof component === "function") &&
      (typeof params === "undefined" ||
        typeof params !== "object" ||
        typeof params !== "string")
    ) {
      const args: IArguments = Arguments.parseComponentArgs(
        component,
        params || {}
      );

      WidgetRegistry.getInstance().register(
        component,
        args.id,
        args.conditions,
        args.registry,
        panelProps
      );
    } else {
      logger.error("arguments.register");
    }
  }

  /**
   * Retrieves an object or function from the registry using supplied {@link Arguments}
   *
   * For usage: {@link https://www.devnet.io/libs/react-registry/docs/#/retrieving}
   *
   * @param params options, parsed to {@link Arguments}
   */
  public static get(params: string | IArguments): object | undefined {
    const args: IArguments = Arguments.parseArgs(params);

    return WidgetRegistry.getInstance().get(
      args.id,
      args.conditions,
      args.registry
    );
  }

  /**
   * Retrieves an object or function from the registry using supplied {@link Arguments}
   * and creates a React element with it. The item retrieved must be a function.
   *
   * For usage: {@link https://www.devnet.io/libs/react-registry/docs/#/retrieving}
   *
   * @param params options, parsed to {@link Arguments}
   * @param props properties for the React component
   */
  public static render(
    params: string | IArguments,
    props?: object
  ): React.ReactElement<any> | undefined {
    const args: IArguments = Arguments.parseArgs(params);
    const component = WidgetRegistry.getInstance().get(
      args.id,
      args.conditions,
      args.registry
    );

    if (typeof component === "function") {
      // class or function
      return React.createElement(component as React.ComponentClass, props);
    }

    logger.warn("component.invalid");
  }

  public static getPanelProps(params: string | IArguments): PanelProps {
    const args: IArguments = Arguments.parseArgs(params);
    return WidgetRegistry.getInstance().getPanelProps(
      args.id,
      args.conditions,
      args.registry
    );
  }

  /**
   * Alias for render()
   *
   * Retrieves an object or function from the registry using supplied {@link Arguments}
   * and creates a React element with it. The item retrieved must be a function.
   *
   * For usage: {@link https://www.devnet.io/libs/react-registry/docs/#/retrieving}
   *
   * @param params options, parsed to {@link Arguments}
   * @param props properties for the React component
   */
  public static createElement(
    params: string | IArguments,
    props?: object
  ): React.ReactElement<any> | undefined {
    return Widgets.render(params, props);
  }

  public static getAllPanelConfigs() {
    const all = WidgetRegistry.getInstance().getWidgets();

    return Object.keys(all).reduce((acc: any, key: string) => {
      acc[key] = Widgets.getPanelConfig(key);
    }, {});
  }

  public static getPanelConfig(params: string | IArguments) {
    const args: IArguments = Arguments.parseArgs(params);
    const panelProps = this.getPanelProps(params);

    return {
      id: args.id,
      ...panelProps,
      content: Widgets.render(args) as JSX.Element,
    };
  }

  public static getLayout(params: any) {
    return {
      ...params,
      ...(params.children
        ? { children: params.children.map((child) => this.getLayout(child)) }
        : null),
      ...(params.tabs
        ? { tabs: params.tabs.map((tab) => this.getPanelConfig(tab)) }
        : null),
    };
  }
}
