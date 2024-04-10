import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import SearchResult from './SearchResult'
import { IconButton, Icon } from "@material-ui/core";
import {
    Grid
} from '@material-ui/core';

const useStyles = makeStyles(({ palette, ...theme }) => ({
    root: {
        backgroundColor: palette.primary.main,
        color: palette.primary.contrastText,
        '&::placeholder': {
            color: palette.primary.contrastText,
        },
    },
    searchBoxHolder: {
        position: 'absolute',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 9,
        height: 'var(--topbar-height)',
    },
    searchBox: {
        outline: 'none',
        border: 'none',
        fontSize: '1rem',
        height: 'calc(100% - 5px)',
    },
}))
const MatxSearchBox = ({ rows }) => {
    const [open, setOpen] = useState(false)
    const [filter, setFilter] = useState(null)
    const [showSearch, setShowSearch] = useState(false)

    const classes = useStyles()
    const toggle = () => {
        setFilter(null)
        document.getElementById("recievedfiles").style.display = "block";
        setOpen(!open)
    }
    const searchData = (value) => {
        setShowSearch(true)
        if (value !== "") {
            document.getElementById("recievedfiles").style.display = "none";
            document.getElementById("recievedfileshead").style.display = "none";
        }
        else {
            setShowSearch(false)
            document.getElementById("recievedfiles").style.display = "block";
            document.getElementById("recievedfileshead").style.display = "block";
        }
        setFilter(value)
    }


    return (
        <React.Fragment>
            {!open && (
                <IconButton
                    onClick={toggle}
                    style={{ width: "55px", height: "55px", float: "right", marginTop: "-55px" }}
                >
                    <Icon>search</Icon>
                </IconButton>
            )}
            {open && (
                <div
                    className={clsx(
                        'flex items-center',
                        classes.root,
                        classes.searchBoxHolder
                    )}
                >
                    <input
                        className={clsx(
                            'px-4 search-box w-full',
                            classes.root,
                            classes.searchBox
                        )}
                        type="text"
                        placeholder="Search here..."
                        autoFocus
                        onInput={(event) => searchData(event.target.value)}
                    />
                    <IconButton onClick={toggle} className="align-middle mx-4">
                        <Icon>close</Icon>
                    </IconButton>
                </div>
            )}
            {showSearch &&
                <Grid container spacing={2} style={{
                    marginTop: "35px",
                    marginRight: "210px"
                }}
                >
                    {rows && rows.map((item, i) => (
                        rows[i].fileName.toLowerCase().includes(filter) ?
                            <SearchResult
                                extension={rows[i].extension}
                                fileName={rows[i].fileName}
                                filehash={rows[i].filehash}
                                sender={rows[i].senderName}
                            ></SearchResult>
                            :
                            ""
                    ))}
                </Grid>
            }
        </React.Fragment>

    )
}

export default MatxSearchBox
