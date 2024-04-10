import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { Button } from '@material-ui/core'

export default function DetailsDialog({ sender, fileName, detailsOpen, handleClose }) {
    return (
        <Dialog
            open={detailsOpen}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">File Details</DialogTitle>
            <DialogContent>
                <p>Shared By   : {sender}</p>
                <p>File  Name  : {fileName}</p>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>

    );
}