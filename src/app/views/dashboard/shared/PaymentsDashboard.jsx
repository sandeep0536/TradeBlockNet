import React, { useEffect } from 'react'
import {
    Card,
    Icon,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    MenuItem,
    Select,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import Web3 from "web3";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from 'ServerConfig';
import { CircularProgress } from '@material-ui/core';
import { useState } from 'react';
import { getAllDIDData } from 'app/views/material-kit/projecttest/StoreDataDid';
import { CheckSubscription } from 'app/views/material-kit/projecttest/CheckSubscription';
import $ from 'jquery'
import "datatables.net-dt/js/dataTables.dataTables"
import "datatables.net-dt/css/jquery.dataTables.min.css"
import { API_URL } from 'ServerConfig';
import history from 'history.js';
let payments = [];
export default function PaymentDashboard() {
    const [status, setStatus] = useState(false);
    useEffect(() => {
        (async () => {
            const status = await fetchRecords();
            if (status) {
                setTimeout(() => {
                    $('#payment-table').dataTable({ destroy: true, scrollX: true });
                }, 4000)
            }
        })()
    })
    async function fetchRecords() {
        try {
            const opts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "email": localStorage.getItem("userEmail"),
                }),
            }
            const res = await fetch(`${API_URL}/getsubscriptionstatus`, opts);
            await res.json()
                .then((res) => {
                    const data = JSON.parse(res.result);
                    var date_ob = new Date();
                    var day = ("0" + date_ob.getDate()).slice(-2);
                    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                    var year = date_ob.getFullYear();
                    var hours = date_ob.getHours();
                    var minutes = date_ob.getMinutes();
                    var seconds = date_ob.getSeconds();
                    const startDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                    if (Object.keys(data).length < 1) {
                        history.push("/subscription")
                    }
                    else if (new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                        history.push("/subscription")
                    }
                    else if (data[0].plan == "sandbox" || data[0].plan == "bronze" || data[0].plan == "silver") {
                        history.push("/dashboard")
                    }
                })

            const data = JSON.parse(localStorage.getItem("did_data"));
            payments = data.paymentsrecord;
            return true;
        } catch (e) {
            console.log(e)
        }
    }
    setTimeout(function () {
        try {
            setStatus(true)
        } catch (e) { }
    }, 3000)
    function handleRefresh() {
        setStatus(false);
        fetchRecords();
        setTimeout(function () {
            setStatus(true)
        }, 3000)
    }
    // console.log("pay",payments)
    return (
        <Card elevation={3} className="pt-5 mb-6">
            <div className="flex justify-between items-center px-6 mb-3">
                <span className="card-title">Payments
                    <Icon style={{
                        position: "absolute",
                        marginLeft: "20px",
                    }}
                        variant="outlined"
                        onClick={handleRefresh}
                    >refresh</Icon>
                </span>
                <Select size="small" defaultValue="this_month" disableUnderline>
                    <MenuItem value="this_month">This Month</MenuItem>
                    <MenuItem value="last_month">Last Month</MenuItem>
                </Select>
            </div>
            <Table
                id="payment-table"
                style={{ width: "100%" }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            SNo.
                        </TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            From
                        </TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            To
                        </TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            Amount
                        </TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            Transaction
                        </TableCell>
                    </TableRow>
                </TableHead>
                {!status ?
                    <div>
                        <CircularProgress />
                    </div>
                    :
                    <TableBody>
                        {/**
                             * shown all payments data
                             */}
                        {payments ?
                            Object.keys(payments).map((item, i) => (
                                <TableRow key={i} hover>
                                    <TableCell
                                        className="px-4 capitalize"
                                        align="left"
                                        // style={{ whiteSpace: "nowrap" }}
                                    >
                                        <div className="flex items-center">
                                            <p className="m-0 ml-4">
                                                {i + 1}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        className="px-4 capitalize"
                                        align="left"
                                        // style={{ whiteSpace: "nowrap" }}
                                    >
                                        {payments[item].from}
                                    </TableCell>
                                    <TableCell
                                        className="px-4 capitalize"
                                        align="left"
                                        // style={{ whiteSpace: "nowrap" }}
                                    >
                                        {payments[item].to}
                                    </TableCell>
                                    <TableCell
                                        className="px-4 capitalize"
                                        align="left"
                                        // style={{ whiteSpace: "nowrap" }}
                                    >
                                        {payments[item].value}
                                    </TableCell>
                                    <TableCell
                                        className="px-4 capitalize"
                                        align="left"
                                        // style={{ whiteSpace: "nowrap" }}
                                    >
                                        <a href={`https://testnet.bscscan.com/tx/${payments[item].blockHash}`} target="_blank">
                                            {payments[item].blockHash}
                                        </a>
                                    </TableCell>
                                </TableRow>
                            ))
                            :
                            ""
                        }
                    </TableBody>
                }
            </Table>

        </Card>
    )
}