import React from "react";
import Snackbar from '@material-ui/core/Snackbar'
import MySnackbarContentWrapper from "./SnackbarComponent";

export default function WaitSnackbar({ message }) {
    const [state, setState] = React.useState({
        open: true,
        vertical: 'top',
        horizontal: 'right',
    })
    const { vertical, horizontal, open } = state
    function handleClose() {
        setState({ ...state, open: false })
    }

    return (
        <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            key={`${vertical},${horizontal}`}
            open={open}

            onClose={handleClose}
            ContentProps={{
                'aria-describedby': 'message-id',
            }}
        >
            <MySnackbarContentWrapper
                onClose={handleClose}
                variant="info"
                message={message}
            /></Snackbar>
    );
}