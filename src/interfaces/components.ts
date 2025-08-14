import Theme from "./theme";

export const variants = ['clean', 'primary', 'secondary', 'accent', 'border'] as const;
export const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const;
export const themes = [Theme.Light, Theme.Dark] as const;

export type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'custom';
export type Variant =
    'clean'
    | 'primary'
    | 'muted'
    | 'secondary'
    | 'accent'
    | 'border'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';
export type Alignment = 'top' | 'bottom' | 'left' | 'right';
