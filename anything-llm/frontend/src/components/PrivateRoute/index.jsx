import {useEffect, useState} from "react";
import {Navigate} from "react-router-dom";
import {FullScreenLoader} from "../Preloader";
import validateSessionTokenForUser from "../../utils/session";
import paths from "../../utils/paths";
import {AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER} from "../../utils/constants";
import {userFromStorage} from "../../utils/request";
import System from "../../models/system";

// Used only for Multi-user mode only as we permission specific pages based on auth role.
// When in single user mode we just bypass any authchecks.
function useIsAuthenticated() {
  const [isAuthd, setIsAuthed] = useState(null);
  const [isCoder, setIsCoder] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const settings = await System.keys();
      const multiUserMode = settings?.MultiUserMode;

      setIsCoder(Boolean(settings?.isCoder))

      if (!multiUserMode) {
        setIsAuthed(true);
        return;
      }

      const localUser = localStorage.getItem(AUTH_USER);
      const localAuthToken = localStorage.getItem(AUTH_TOKEN);
      if (!localUser || !localAuthToken) {
        setIsAuthed(false);
        return;
      }

      const isValid = await validateSessionTokenForUser();
      if (!isValid) {
        localStorage.removeItem(AUTH_USER);
        localStorage.removeItem(AUTH_TOKEN);
        localStorage.removeItem(AUTH_TIMESTAMP);
        setIsAuthed(false);
        return;
      }

      setIsAuthed(true);
    };
    validateSession();
  }, []);

  return {isAuthd, isCoder};
}

export function AdminRoute({Component}) {
  const userAuth = useIsAuthenticated();
  const authed = userAuth.isAuthd;
  const isCoder = userAuth.isCoder;
  if (authed === null) return <FullScreenLoader/>;

  const user = userFromStorage();
  return authed && user?.role === "admin" ? (
    <Component isCoder={isCoder}/>
  ) : (
    <Navigate to={paths.home()}/>
  );
}

export default function PrivateRoute(props) {
  const {Component, analystRoute, termRoute} = props;
  const userAuth = useIsAuthenticated();
  const authed = userAuth.isAuthd;
  const isCoder = userAuth.isCoder;
  if (authed === null) return <FullScreenLoader/>;

  return authed ? <Component isCoder={isCoder} termRoute={termRoute} analystRoute={analystRoute}/> :
    <Navigate to={paths.home()}/>;
}
