import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
let rows = {};
const SharedHashPopup = (props) => {
    const handleClose = () => {
        localStorage.removeItem("sharedPopup")
    };
    useEffect(async () => {
        try {
            getFileDetails(props.hash)
                .then((res) => {
                    rows = res;
                })
        } catch (err) {
        }
    }, [rows]);
    return (
        <Dialog
            open={localStorage.getItem("sharedPopup")}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle id="alert-dialog-slide-title">
                {"File Details"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    <p><b>FileHash : </b>{rows.hash}</p>
                    <p><b>From : </b>{rows.from}</p>
                    <p><b>To : </b>{rows.to}</p>
                    <p><b>Date : </b>{rows.date}</p>
                    <p><b>Time : </b>{rows.time}</p>
                    <p><b>Comment : </b>{rows.comment}</p>
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
export default SharedHashPopup;