import Registry from './Registry';
import RegistryEntry from "@/lib/WidgetRegister/lib/RegistryEntry";
import { PanelProps } from "@/lib/WidgetRegister/lib/ComponentEntry";

export default interface IComponentRegistry {

	getRegistry(target: string): Registry;

	register(component: object, key: string, conditions?: object, target?: string): void;

	get(key: string, conditions?: object, target?: string): object | undefined;

	getPanelProps(key: string, conditions?: object, target?: string): PanelProps | undefined;

	getWidgets(target?: string): { [key: string]: RegistryEntry; };
}