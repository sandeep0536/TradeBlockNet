import React from "react";
import { LibraryBooks, Photo, PictureAsPdf } from "@material-ui/icons";
import {
    Grid
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'
import { MenuItem } from '@material-ui/core'
import { IconButton, Icon } from "@material-ui/core";
import { Link } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
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
}))

export default function GridView({ rows, open, close, index }) {
    const classes = useStyles()
    return (

        <div>
        </div>

        // <GridView
        //     rows={rows}
        //     open={handleShareOpen(handleShareOpen(rows[i].hash, rows[i].fileExt, rows[i].fileName))}
        //     close={handleClose}
        //     handleMenuClick={handleMenuClick}
        //     handleMenuClose={handleMenuClose}
        // />
    );
}