import * as PropTypes from "prop-types";
import * as React from "react";

import Provider from "./Provider";
import Widgets from "@/lib/WidgetRegister/Widgets";
import { Arguments, IArguments } from "./util/Arguments";
import {
  IProviderArguments,
  ProviderArguments,
} from "./util/ProviderArguments";

/**
 * React component for retrieving other components form the registry
 * For full documentation: {@link https://www.devnet.io/libs/react-registry/docs/#/retrieving}
 *
 * @author Joe Esposito <joe@devnet.io>
 */

// Type of props any to allow passing of many props into the registered component
export default class Widget extends React.Component<IArguments, any> {
  public static contextTypes = {
    registryProviderArgs: PropTypes.object,
  };

  constructor(props: any) {
    super(props);
  }

  public render() {
    let args: IArguments = Arguments.parseArgs({ ...this.props });
    /** Determine if a {@link ProviderComponent} is present */
    // @ts-ignore
    if (this.context.registryProviderArgs) {
      // Supplement supplied arguments with those from the provider
      // @ts-ignore
      const providerArgs: IProviderArguments = ProviderArguments.parseArgs(
        (this.context as any).registryProviderArgs
      );
      args = Provider.getArgs(providerArgs, args);
    }
    return Widgets.render(args, { ...this.props }) as JSX.Element;
  }
}
