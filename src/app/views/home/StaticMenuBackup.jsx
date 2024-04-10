import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import {
  Button,
  Icon,
  TextField
} from '@material-ui/core';
import {
  ScrollingProvider,
  useScrollSection,
  Section,
} from 'react-scroll-section';
// import { WALLET_ADAPTERS, CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
// import { Web3AuthCore } from "@web3auth/core";
// import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import walletConnectProvider from '@walletconnect/web3-provider'
import {EventEmitter} from 'events';
import { SafeEventEmitterProvider } from '@openzeppelin/network/lib/react';
import Web3Modal from 'web3modal';
import {Auth0LockPasswordless} from 'auth0-lock';
import { Link } from 'react-router-dom';
// import { useAuth0 } from "@auth0/auth0-react";
// import RPC from "../../services/web3RPC";

const domain = "dev-xu3xkn368ayhmipm.us.auth0.com";
const clientId =
  "pEjZQvByw8bqb9hlarxJNVzROw2byANI";

const auth0Options = {
  auth: {
    redirectUrl: 'http://localhost:3000',
    responseType: 'token id_token',
    params: {
      scope: 'openid email profile',
    },
  },
  autoclose: true,
  rememberLastLogin: true,
  typeOfLogin: "jwt",
  allowedConnections: ['google-oauth2', 'email'],
  passwordlessMethod: 'code',
  initialScreen: 'login',
  languageDictionary: {
    title: 'Tradeblocknet',
  },
};

const web3Modal = new Web3Modal({
  network: 'testnet',
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: walletConnectProvider,
      options: {
        infuraId: "c00d9c7da02d477d84e8c00321e5f531",
      },
    },
  },
});

const StaticMenu = (props) => {
  const [provider, setProvider] = useState(null);
  const homeSection = useScrollSection('home');
  const pricingSection = useScrollSection('pricingTable');
  const helpSection = useScrollSection('help');

  const handleLogin = async () => {
    try{
      const auth0 = new Auth0LockPasswordless(
        clientId,
        domain,
        auth0Options,
      );
      auth0.show();
      console.log("autho",auth0.show())
  
      const web3Provider = await web3Modal.connect();
      setProvider(web3Provider);

      // const res = await auth0.ready()
      // console.log('res',res)

      auth0.on('authenticated', async ({ idToken, accessToken }) => {
        const eventEmitter = new EventEmitter();
        web3Provider.on('accountsChanged', (accounts) => {
          eventEmitter.emit('accountsChanged', accounts);
        });
        web3Provider.on('chainChanged', (chainId) => {
          eventEmitter.emit('chainChanged', chainId);
        });
  
        const message = {
          idToken,
          accessToken,
          chainId: '0x5', // Ethereum mainnet
        };
       const res = await web3Provider.request({
          method: 'web3_auth',
          params: [message],
        });
       
      });
      
      auth0.on('authorization_error', (err) => {
        console.error('Auth0 authorization error', err);
      });
    }catch(error){
      console.log("error",error.message)
    }
    
  };
 

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top py-4 d-block" data-navbar-on-scroll="data-navbar-on-scroll">
      <div className="container">
        <img src={require('./Tradeblocknet.svg')} style={{ width: "62px", height: "62px" }}></img>
        <a className="navbar-brand" href="#"><span style={{ color: "white", marginLeft: "20px" }}>Tradeblocknet</span></a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"> </span></button>
        <div className="collapse navbar-collapse border-top border-lg-0 mt-4 mt-lg-0" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto pt-2 pt-lg-0 font-base">
            <li className="nav-item px-2" data-anchor="data-anchor" style={{ cursor: "pointer" }} onClick={homeSection.onClick} selected={homeSection.selected}>
              <a className="nav-link fw-medium active" aria-current="page" style={{ fontWeight: "600", fontSize: "22px" }}>Home</a></li>
            <li className="nav-item px-2" data-anchor="data-anchor" style={{ cursor: "pointer" }} onClick={helpSection.onClick} selected={helpSection.selected}>
              <a className="nav-link" style={{ fontWeight: "600", fontSize: "22px" }}>Help</a></li>
          </ul>
          {/* <div className='pt-3'>
                        {isAuthenticated ?
                            <button onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>
                            :
                            console.log("helllo")
                            // <button onClick={() => openloginAdapter()}>Log In</button>
                        }

                    </div> */}

          {/* <div className="grid">{unloggedInView}</div> */}

          <div className="StaticMenu">
       {/* {provider ? (
        <SafeEventEmitterProvider web3Auth={provider}>
            The child components that need access to the `web3auth` state go here
        </SafeEventEmitterProvider>
      ) : (
        <>
          <button onClick={handleLogin}>Login</button>
        </>
      )}  */}
       <>
          <button onClick={handleLogin}>Login</button>
        </>
    </div>
          {localStorage.getItem("accessToken") != null
            ?
            <Link
              to="/dashboard"
            >
              <form className="ps-lg-5">
                <span style={{ color: "white", fontSize: "20px", cursor: "pointer" }}>
                  {localStorage.getItem("userEmail")}
                </span>
              </form>
            </Link>
            :
            <Link
              to={{
                pathname: "/signin",
                state: { token: props.token }
              }}
            >
              <form className="ps-lg-5"><div className="btn btn-light order-1 order-lg-0">login
                <svg className="bi bi-person-fill" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
                </svg></div></form>
            </Link>
          }
        </div>
      </div>
    </nav>
  );
};
export default StaticMenu;