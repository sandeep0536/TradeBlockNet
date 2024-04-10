import React from "react";
import {  WEB3AUTH_CLIENTID } from 'ServerConfig';
import OpenLogin from "@toruslabs/openlogin";

export const getUserInfo = () => {
    const openlogin = new OpenLogin({ clientId: WEB3AUTH_CLIENTID, network: "testnet" });
    return openlogin.getUserInfo();
}