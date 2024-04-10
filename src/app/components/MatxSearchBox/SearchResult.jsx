import React from "react";
import { makeStyles } from '@material-ui/core/styles'
import {
    Grid
} from '@material-ui/core';
import { Button } from '@material-ui/core'
import { LibraryBooks, Photo, PictureAsPdf } from "@material-ui/icons";
import Menu from '@material-ui/core/Menu'
import { Icon } from "@material-ui/core";
import MenuItem from '@material-ui/core/MenuItem'
import { Link } from "@material-ui/core";
import DetailsDialog from "app/views/material-kit/projecttest/DetailsDialog";
import { useState } from "react";
const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
    progress: {
        margin: theme.spacing(2),
    },
    thumb: {
        width: "150px",
        height: "150px"
    },
    innerthumb: {
        position: "absolute",
        marginTop: "105px",
        width: "150px",
        height: "44px"
    },
    folder: {
        marginTop: "-30px"
    },
    file: {
        width: "70px",
        fontSize: "12px",
        marginLeft: "10px",
        marginTop: "1px"
    },
    grid: {
        float: "left !important",
        marginTop: 0
    }
}))

export default function SearchResult({ extension, fileName, filehash, sender }) {
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [detailsOpen, setDetailsOpen] = useState(false);

    const classes = useStyles()
    function handleMenuClick(event) {
        setAnchorEl(event.currentTarget)
    }
    function handleMenuClose() {
        setAnchorEl(null)
    }
    const showFileDetails = (sender, comment) => {
        setDetailsOpen(true);
    }
    const handleClose = () => {
        setDetailsOpen(false)
    }
    return (
        <Grid item md={2} key={filehash}>
            <DetailsDialog
                sender={sender}
                fileName={fileName}
                detailsOpen={detailsOpen}
                handleClose={handleClose}
            >
            </DetailsDialog>
            <Button
                className={classes.thumb}
                variant="outlined"
                color="primary"
            //onClick={}
            >
                <div>
                    {
                        (extension === "image/jpg" || extension === "image/png"
                            || extension === "image/jpeg" ||
                            extension === "image/gif")
                            ?
                            <Photo></Photo>
                            :
                            (extension === "text/plain")
                                ?
                                <LibraryBooks></LibraryBooks>
                                :
                                (extension === "application/pdf")
                                    ?
                                    <PictureAsPdf></PictureAsPdf>
                                    :
                                    "other"
                    }
                </div>
                <Button
                    className={classes.innerthumb}
                    variant="outlined"
                    color="primary"
                >
                    <div>
                        {
                            fileName.length > 10 ?
                                <div>
                                    <span className={classes.file}>{`${fileName.substring(0, 9)}...`}</span>
                                </div>
                                :
                                <div>
                                    <span className={classes.file}>{fileName}</span>
                                </div>
                        }
                    </div>
                </Button>
                <div>
                    <Icon style={{
                        position: "absolute",
                        marginLeft: "32px",
                        marginTop: "-65px"
                    }}
                        variant="outlined"
                        aria-owns={anchorEl ? 'simple-menu' : undefined}
                        aria-haspopup="true"
                        onClick={handleMenuClick}
                    >more_vert</Icon>
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        style={{ marginLeft: "-60px", marginTop: "6px" }}
                    >
                        <Link
                            href={`/project/show/${filehash}`}
                            target="_"
                            style={{ textDecoration: "initial", color: "inherit" }}
                        >
                            <MenuItem>Open</MenuItem>
                        </Link>
                        <MenuItem onClick={() => {
                            showFileDetails(sender,
                                fileName)
                        }}>Details</MenuItem>
                    </Menu>
                </div>
            </Button>
        </Grid>

    );
}