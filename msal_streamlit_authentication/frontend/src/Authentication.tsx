import React, { useCallback, useEffect, useState } from "react"
import {
    withStreamlitConnection,
    Streamlit,
    ComponentProps,
} from "streamlit-component-lib"
import { useMsalInstance } from "./auth/msal-auth";

const Authentication = ({ args }: ComponentProps) => {
    const msalInstance = useMsalInstance(args["auth"], args["cache"])
    const loginRequest = args["login_request"] ?? undefined
    const logoutRequest = args["logout_request"] ?? undefined
    const loginButtonText = args["login_button_text"] ?? ""
    const logoutButtonText = args["logout_button_text"] ?? ""
    const buttonClass = args["class_name"] ?? ""
    const buttonId = args["html_id"] ?? ""

    const [loginToken, setLoginToken] = useState(null)
    const isAuthenticated = useCallback(() => {
        return msalInstance.getAllAccounts().length > 0
    }, [])

    useEffect(() => {
        if (msalInstance.getAllAccounts().length > 0) {
            msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: msalInstance.getAllAccounts()[0]
            }).then(function (response) {
                // @ts-ignore
                setLoginToken(response)
            })
        } else {
            setLoginToken(null)
        }
    }, [])

    useEffect(() => {
        Streamlit.setComponentValue(loginToken)
        Streamlit.setFrameHeight()
        Streamlit.setComponentReady()
    }, [loginToken])

    const loginPopup = useCallback(() => {
        msalInstance.loginPopup(loginRequest).then(function (response) {
            // @ts-ignore
            setLoginToken(response)
        }).catch(console.error)
    }, [])

    const logoutPopup = useCallback(() => {
        // @ts-ignore
        msalInstance.logoutPopup(logoutRequest).then(function (response) {
            setLoginToken(null)
        }).catch(console.error)
    }, [])

    return (
        <div className="card">
            {isAuthenticated() ? (
                <div>
                    <p style={{
                        color: '#a20066',
                        marginTop: '0px',
                        marginBottom: '3px',
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontWeight: 600,
                        letterSpacing: '-0.005em',
                        lineHeight: 1.2
                    }}>
                        You are logged in now, go to the sidebar to access the Chatbot.
                    </p>
                    <p style={{ display: 'inline-block', marginRight: '10px' }}>
                        Do you want to log out? Please click the logout button on the right.
                    </p>
                    <button onClick={logoutPopup} style={{ display: 'inline-block' }} className={buttonClass} id={buttonId}>
                        {logoutButtonText}
                    </button>
                </div>
            ) : (
                <button onClick={loginPopup} className={buttonClass} id={buttonId}>
                    {loginButtonText}
                </button>
            )}
        </div>


    )

}

export default withStreamlitConnection(Authentication)
