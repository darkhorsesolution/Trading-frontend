import { Box, Button, Group, TextInput, createStyles } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons";

const useStyles = createStyles((theme) => ({
    search: {
        "input:focus, input:focus-within": {
            outline: "none",
        },
    },
    inputWrapper: {
        position: "relative",
        "input": {
            cursor: "pointer",
            outlineWidth: "0px !important"
        }
    },
    bottomGroup: {
        alignItems: "center",
        gap: 0,
    }
}));

interface AccountsFilterProps {
    onSearch: (searchInput?: string) => void;
}

const AccountsFilter = React.memo(({ onSearch }: AccountsFilterProps) => {
    const { classes, cx } = useStyles();
    const [searchInput, setSearchInput] = useState<string>("");

    useEffect(() => {
        onSearch(searchInput);
    }, [searchInput]);

    return (
        <Group position="left" py={"xs"} align="end" noWrap={false} className={classes.bottomGroup}>
            <Box style={{ display: "flex", alignItems: "end" }}>
                <TextInput size="xs"
                    placeholder="Search"
                    icon={<IconSearch size={16} />}
                    rightSectionWidth={90}
                    mx={"xs"}
                    className={classes.search}
                    onChange={(e) => setSearchInput(e.currentTarget.value)}

                />
            </Box>
        </Group>
    );
}, (prevProps, nextProps) => {
    return true;
});

export default AccountsFilter;