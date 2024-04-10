import React from "react";
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import {
    Grid,
    Button,
} from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import { useEffect } from "react";
import { CircularProgress } from '@material-ui/core';

export default function PasswordPopup(props) {
    return (
        <Dialog
            open={props.status}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title" >Wallet Password</DialogTitle>

            <DialogContent style={{ minWidth: "300px" }}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="file-password"
                    label="file password"
                    type="password"
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                {props.popupStatus &&
                    <CircularProgress style={{ color: "blue" }} />
                }
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={props.close}
                >
                    Cancel
                </Button>
                <Button onClick={props.submit} disabled={props.popupStatus}>
                    Submit
                </Button>
            </DialogActions>
            <br />
            {props.forgot &&
                <div>
                    <center>
                        <span style={{ color: "blue", cursor: "pointer" }} onClick={props.forgotSubmit}>Forgot password ?</span>
                    </center>
                </div>
            }
            <br />
        </Dialog >

    );
}