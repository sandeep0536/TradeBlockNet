import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import React, { useState, useEffect } from "react";
import Button from "components/CustomButtons/Button.js";
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const AlertPopup = (props) => {
    const [open, setOpen] = useState(true);
    const handleClose = () => {
        setOpen(false);
        localStorage.removeItem("dialogStatus");
    };
    return (
        <Dialog
            open={open || localStorage.getItem("dialogStatus")}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle id="alert-dialog-slide-title">
                {props.heading}
            </DialogTitle>
            <DialogContent style={{ width: 500 }}>
                <DialogContentText id="alert-dialog-slide-description">
                    <b>{props.message}</b>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog >
    );


}
export default AlertPopup;