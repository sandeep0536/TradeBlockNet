import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'

export default function ResponsiveDialog(props) {
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    return (
        <div>
            <Dialog
                fullScreen={fullScreen}
                open={props.status}
                onClose={props.close}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                    {props.color ? <div style={{ color: props.color ? props.color : "" }}>{props.content}</div> : props.header}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {props.transfer ?
                            <div>
                                <b>File Id : </b>{props.content[0].file_id}<br />
                                <b>From    : </b>{props.content[0].from}<br />
                                <b>To    : </b>{props.content[0].to}<br />
                                <b>Time    : </b>{new Date(props.content[0].time * 1000).toLocaleString('en-GB')}<br />
                            </div>
                            :
                            props.color ? props.header : props.content
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {props.transfer ?
                        <Button onClick={props.close} style={{ color: "#1976d2" }}>
                            {"Cancel"}
                        </Button>
                        :
                        props.sync ?
                            <div>
                                <Button onClick={props.warning} style={{ color: "#1976d2" }} disabled={props.disableStatus}>
                                    {"Cancel"}
                                </Button>
                                <Button onClick={props.syncWithContract} style={{ color: "#1976d2" }} disabled={props.disableStatus}>
                                    {"Sync"}
                                </Button>
                            </div>
                            :
                            props.synced ?
                                <Button onClick={props.submit} style={{ color: "#1976d2" }}>
                                    {"Cancel"}
                                </Button>
                                :
                                <div>
                                    <Button onClick={props.close} style={{ color: "#1976d2" }}>
                                        {"No"}
                                    </Button>
                                    <Button onClick={props.submit} style={{ color: "#1976d2" }}>
                                        {"Yes"}
                                    </Button>
                                </div>
                    }
                </DialogActions>
            </Dialog>
        </div>
    )
}
