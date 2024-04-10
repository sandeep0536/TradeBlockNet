import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import React, { useState, useEffect, useCallback } from "react";
import Button from "components/CustomButtons/Button.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import { KeyGeneratorAction } from "actions/KeyGeneratorAction";
import EthCrypto from "eth-crypto";
import { generateMnemonic, EthHdWallet } from "eth-hd-wallet"
import crypt from "crypto-js";
import { forgetPassword } from "actions/KeyGeneratorAction";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ForgotPasswordPopup({ hide }) {
    return (
        <Dialog
            open={true}
            TransitionComponent={Transition}
            keepMounted
            onClose={hide}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle id="alert-dialog-slide-title">
                {"Reset Password"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">

                    <GridContainer>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-1"
                                id="w-1"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-2"
                                id="w-2"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-3"
                                id="w-3"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-4"
                                id="w-4"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-5"
                                id="w-5"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-6"
                                id="w-6"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-7"
                                id="w-7"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-8"
                                id="w-8"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-9"
                                id="w-9"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-10"
                                id="w-10"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-11"
                                id="w-11"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={3}>
                            <CustomInput
                                labelText="word-12"
                                id="w-12"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="Password"
                                id="new-password"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    type: "password",
                                }}
                            />
                        </GridItem>
                    </GridContainer>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => forgetPassword()} color="primary">
                    Reset
            </Button>
                <Button onClick={hide} color="primary">
                    Close
            </Button>
                <br />
            </DialogActions>
        </Dialog >
    );
}