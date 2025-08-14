import {PrismaClient} from "@prisma/client";
import {DockviewApi} from "dockview";

declare global {
    // eslint-disable-next-line no-var
    var layout: DockviewApi | undefined;
}

global.layout = globalThis.layout;

export const setLayout = (l: DockviewApi) => global.layout = l;

export default layout;