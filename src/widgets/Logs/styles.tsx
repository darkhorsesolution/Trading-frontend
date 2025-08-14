import { createStyles } from "@mantine/core";

const styles = createStyles((theme) => ({
    wrapper: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        height: "100%",
        ".mantine-ScrollArea-scrollbar": {
            zIndex: 1000,
        }
    },
    table: {
        borderCollapse: "collapse",
        width: "100%",
        paddingTop: "5px",
        tbody: {
            tr: {
                "&:nth-of-type(odd) ": {
                    background:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[6]
                            : theme.colors.gray[1],
                },
            },
        },
        td: {
            fontSize: theme.fontSizes.sm,
            padding: theme.spacing.xs,
        },
    },
}));

export default styles;
