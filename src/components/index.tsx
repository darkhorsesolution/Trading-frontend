import {Size, Variant} from "@/interfaces/components";

const cssClasses = {
    scrollbar: 'transition duration-300 scrollbar-thin ' +
        'scrollbar-thumb-primary-200 hover:scrollbar-thumb-primary-600 ' +
        'scrollbar-track-primary-100 hover:scrollbar-track-primary-700',
    textMuted: 'dark:text-primary-500',
    transitionWithDuration: `transition duration-200`,
    input: 'focus:ring-accent focus:ring-4 px-4 w-full py-4 block w-full bg-primary-800 rounded-md border-0 outline-none ',
    checkbox: `p-2 border-0 outline-none block w-full bg-primary-800 hover:bg-black focus:bg-black focus:ring-4 focus:ring-purple-500 focus:border-purple-500 rounded-md transition duration-200`,
};

const ErrorMsg = ({children}) => (
    <div className="bg-red-500/50 border-red-500 border text-white p-4 rounded-lg">
        {children}
    </div>
);

const SuccessMsg = ({children}) => (
    <div className="bg-green-500/50 border-green-500 border text-white p-4 rounded-lg">
        {children}
    </div>
);

export type ComponentProps = {
    className?: string
    key?: any,
    size?: Size,
    variant?: Variant,
    children?: any,
    style?: any,
    onClickOrderPanel?: (e: any) => void
};

export {cssClasses, ErrorMsg, SuccessMsg};