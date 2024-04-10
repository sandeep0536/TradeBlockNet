import React from "react";
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Menu from '@material-ui/core/Menu'
import { MenuItem } from '@material-ui/core'
import {
    Checkbox,
    InputLabel,
    ListItemIcon,
    ListItemText,
    FormControl,
    Select
} from "@material-ui/core";
import { MenuProps } from "./filecomponents/utils";
import {
    Grid
} from '@material-ui/core';
import { Button } from '@material-ui/core'

export default function LogPopup(props) {
    return (
        <div>
            <Dialog
                open={props.status}
                onClose={props.close}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">File TransferOwnership Logs</DialogTitle>
                <DialogContent>

                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={props.close}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}