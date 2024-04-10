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
import moment from 'moment'
import { getAllDIDData } from 'app/views/material-kit/projecttest/StoreDataDid';
import { CheckSubscription } from 'app/views/material-kit/projecttest/CheckSubscription';
import $ from 'jquery'
import "datatables.net-dt/js/dataTables.dataTables"
import "datatables.net-dt/css/jquery.dataTables.min.css"
let message;
let recieverAddress = [];
// let arrr = [];
export default function MessageDashboard() {
    const [status, setStatus] = useState(false);
    useEffect(() => {
        (async () => {
            await fetchRecords();
            setTimeout(() => {
                setStatus(true)
                $('#message-table').dataTable({
                    destroy: true, scrollX: true, columnDefs: [
                        { "type": "date", "targets": 4 }
                    ]
                });
            }, 3000)
        })()
    })
    async function fetchRecords() {
        try {
            const data = JSON.parse(localStorage.getItem("did_data"));
            message = data.mailrecord;
            Object.keys(message).map((key, value) => {
                // const address = message[key].to.split(",")
                // console.log(address)
                // console.log(JSON.parse(message[key].to))
                Object.keys(message[key].to).map((k, v) => {
                    recieverAddress.push(message[key].to[k])
                })
            })
            setStatus(true)
        } catch (e) { }
    }
    setTimeout(function () {
        try {
        } catch (e) { }
    }, 3000)
    function handleRefresh() {
        setStatus(false);
        fetchRecords();
        setTimeout(function () {
            setStatus(true)
        }, 3000)
    }
    return (
        <Card elevation={3} className="pt-5 mb-6">
            <div className="flex justify-between items-center px-6 mb-3">
                <span className="card-title">Messages
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
            <table
                id="message-table"
                style={{ width: "100%" }}
            >
                <thead>
                    <tr>
                        <th className="px-8">
                            SNo.
                        </th>
                        <th className="px-9">
                            From
                        </th>
                        <th className="px-9">
                            To
                        </th>
                        <th className="px-9">
                            Subject
                        </th>
                        <th className="px-9">
                            Date
                        </th>
                    </tr>
                </thead>
                {!status ?
                    <div>
                        <CircularProgress />
                    </div>
                    :
                    <tbody>
                        {/**
                             * shown all messages 
                             */}
                        {message ?
                            Object.keys(message).map((item, i) => (
                                <tr key={i} hover>
                                    <td
                                        align="left"
                                    >
                                        <p className="m-0">
                                            {i + 1}
                                        </p>
                                    </td>
                                    <td
                                    >
                                        {message[item].from}
                                    </td>
                                    <td
                                    >
                                        {
                                            Object.keys(message[item].to).map((k, v) => (
                                                `${message[item].to[k].split("@")[0]} `
                                            ))
                                        }
                                    </td>
                                    <td
                                    >
                                        {message[item].subject}
                                    </td>
                                    <td
                                    >
                                        {new moment(message[item].date).format()}
                                    </td>
                                </tr>
                            ))
                            :
                            ""
                        }
                    </tbody>
                }
            </table>

        </Card >
    )
}