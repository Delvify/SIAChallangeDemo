import {
  SET_CURRENT_USER,
  LOG_OUT_USER,
} from "./types";

export const setCurrentUser = ({ admin, token }) => dispatch => {
  dispatch({
    type: SET_CURRENT_USER,
    payload: { admin, token },
  });
  return Promise.resolve();
};

export const logoutUser = () => dispatch => {
  localStorage.removeItem("jwtToken");
  dispatch({
    type: LOG_OUT_USER,
  });
  return Promise.resolve();
};
