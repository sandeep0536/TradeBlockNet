import React, { useEffect, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Grid } from '@material-ui/core'
import { Button } from '@material-ui/core'
import { Icon } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from '../../material-kit/projecttest/SnackbarComponent';
import QRCode from 'qrcode.react'

//Local URL
// const URL = "http://localhost:3000";
//Server URL
const URL = "https://www.tradeblocknet.com"

export default function QrPopup(props) {
    console.log("props",props)
    // const qrLink= `${URL}/${props.fileId != null && Buffer.from("" + props.fileId).toString('base64')}`
    const qrLink = props.fileId;
    // console.log("qrlink",qrLink)
    const [copied, setCopied] = useState(false)
    function handleSnackbarClose() {
        setCopied(false)
    }
    return (
        <div>
            <Dialog
                open={props.status}
                onClose={props.close}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">File Data</DialogTitle>
                <DialogContent>
                    <QRCode
                        value={qrLink}
                        style={{
                            marginRight: 'auto',
                            marginLeft: 'auto',
                            display: 'block',
                            marginTop: '10px',
                        }}
                    />
                    <div style={{ marginTop: '15px' }}>
                        <Grid item xs={12} md={12}>
                            <TextField
                                margin="dense"
                                id="did"
                                label="File DID"
                                type="text"
                                name="did"
                                fullWidth
                                value={props.fileId}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                            <CopyToClipboard
                                text={props.fileId}
                                onCopy={() => setCopied(true)}
                            >
                                <Icon
                                    style={{
                                        position: 'absolute',
                                        marginLeft: '-30px',
                                        marginTop: '20px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    content_copy
                                </Icon>
                            </CopyToClipboard>
                        </Grid>
                        {props.fileTx != null && props.fileTx !="undefined"? (
                        <Grid item xs={12} md={12}>
                            <TextField
                                margin="dense"
                                id="transactionTx"
                                label="TransactionReciept"
                                type="text"
                                name="transactionTx"
                                fullWidth
                                value={props.fileTx}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                            <CopyToClipboard
                                text={props.fileTx}
                                onCopy={() => setCopied(true)}
                            >
                                <Icon
                                    style={{
                                        position: 'absolute',
                                        marginLeft: '-30px',
                                        marginTop: '20px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    content_copy
                                </Icon>
                            </CopyToClipboard>
                        </Grid>
                                                ) : null}

                        <Snackbar
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={copied}
                            autoHideDuration={3000}
                            onClose={handleSnackbarClose}
                        >
                            <MySnackbarContentWrapper
                                onClose={handleSnackbarClose}
                                variant="success"
                                message="Copied"
                            />
                        </Snackbar>
                        {props.size != null ? (
                            <TextField
                                margin="dense"
                                id="size"
                                label="File Size"
                                type="text"
                                name="size"
                                fullWidth
                                value={props.size}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        ) : null}

                        <TextField
                            margin="dense"
                            id="status"
                            label="File Status"
                            type="text"
                            name="status"
                            fullWidth
                            value={props.filestatus}
                            InputProps={{ readOnly: true }}
                            variant="outlined"
                        />
                    </div>
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
    )
}
