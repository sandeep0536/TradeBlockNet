import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import React, { useState, useEffect } from "react";
import Button from "components/CustomButtons/Button.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import { showMetaData } from "actions/AllActions.js"
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
let rows = {};
const MetaDataPopup = (props) => {
    const handleClose = () => {
        localStorage.removeItem("metapopup")
    };
    useEffect(async () => {
        try {
            showMetaData(props.hash)
                .then((res) => {
                    rows = res;
                })
        } catch (err) {
        }
    }, [rows]);
    return (
        <Dialog
            open={rows.hash == "" ? null : localStorage.getItem("metapopup")}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle id="alert-dialog-slide-title">
                {"File"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    <p><b>FileName : </b>{rows.fileName}</p>
                    <p><b>FileHash : </b>{rows.hash}</p>
                    <p><b>File Extension : </b>{rows.fileExt}</p>
                    <p><b>Owner : </b>{rows.uploadedBy}</p>
                    <p><b>Time: </b>{rows.uploadTime}</p>
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
export default MetaDataPopup;