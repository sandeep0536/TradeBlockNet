import React, { useState } from "react";
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { Button } from '@material-ui/core'
import StripeCheckOut from 'react-stripe-checkout';
import { API_URL, Publishable_Key } from 'ServerConfig';

export default function TopupPopup(props) {
    const [amount, setAmount] = useState(0);
    function handleChange(event) {
        setAmount(event.target.value);
    }
    async function handleTopup(amount) {
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: localStorage.getItem("userEmail"),
                tokens: amount
            })
        }
        await fetch(`${API_URL}/updateNXFTTokens`, opts)
    }
    return (
        <div>
            <Dialog
                open={props.status}
                onClose={props.close}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Topup TBN Amount</DialogTitle>
                <center>
                    1 TBN = $1
                </center>
                <DialogContent>
                    <TextField
                        error={amount < 10}
                        helperText={amount < 10 ? "Min amount should be 10 Tokens" : ""}
                        margin="dense"
                        id="amount"
                        label="TBN Token Amount"
                        type="number"
                        name="nxft-amount"
                        fullWidth
                        variant="outlined"
                        value={amount}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    {amount >= 10 &&
                        <StripeCheckOut
                            description={"Payable to $" + amount}
                            stripeKey={Publishable_Key}
                            name={"Topup NXFT"}
                            token={(token) => handleTopup(amount)}
                            amount={amount * 100}
                            allowRememberMe
                            ComponentClass="div"
                        >
                            <Button
                                className="capitalize"
                                variant="contained"
                                color="primary"
                                type="submit"
                                onClick={props.close}
                            >
                                Topup
                            </Button>
                        </StripeCheckOut>
                    }
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