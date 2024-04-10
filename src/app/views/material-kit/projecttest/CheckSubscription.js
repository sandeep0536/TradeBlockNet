import React from 'react';
import { API_URL } from 'ServerConfig';
export const CheckSubscription = async () => {
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
            console.log(res);
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
                localStorage.setItem("subscription", "sandbox");
            } else if (new Date(startDate).getTime() > new Date(data[0].sub_end_date).getTime()) {
                localStorage.setItem("subscription", "notsubscribed");
            } else {
                localStorage.setItem("subscription", data[0].plan_type);
            }
        })
}