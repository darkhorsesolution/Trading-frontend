/**
 * Represents a component in the registry
 * For full documentation: {@link https://www.devnet.io/libs/react-registry/docs}
 *
 * @author Joe Esposito <joe@devnet.io>
 */

export type PanelProps = {
  title: string;
  closable?: boolean;
  icon?: any;
  tabComponent?: object;
  description?: string;
  admin?: boolean;
};

export default class ComponentEntry {
  public component: object;
  public conditions: object | undefined;
  public panelProps: PanelProps | undefined;

  constructor(component: object, conditions?: object, panelProps?: PanelProps) {
    this.component = component;
    this.conditions = conditions;
    this.panelProps = panelProps;
  }
}
