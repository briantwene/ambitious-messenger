import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import { setAuthStatus } from "./features/users/userSlice";
import "./App.scss";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { Navigate, useNavigate } from "react-router-dom";
import PublicRoute from "./components/routing/PublicRoute";

function App() {
  const { authStatus } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  // check if user is authenticated on page reload
  useEffect(() => {
    // get token expiration timestamp from localStorage
    const expirationTimestamp = localStorage.getItem("tokenExpires");
    if (expirationTimestamp) {
      const currentTime = Date.now();

      // compare current time to expiration timestamp
      if (currentTime < expirationTimestamp) {
        dispatch(setAuthStatus("auth"));
      } else {
        localStorage.removeItem("tokenExpires");
        dispatch(setAuthStatus("unauth"));
      }
    } else {
      dispatch(setAuthStatus("unauth"));
    }
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<PublicRoute authStatus={authStatus} />}>
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        <Route element={<ProtectedRoute authStatus={authStatus} />}>
          <Route path="/protectedTest" element={<Home />} />{" "}
          {/* The /protectedTest is here just for testing purposes, will remove soon */}
        </Route>
      </Routes>
    </>
  );
}

export default App;
