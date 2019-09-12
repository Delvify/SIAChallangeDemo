import {
  SET_CURRENT_USER,
  LOG_OUT_USER,
} from "../actions/types";

const initialState = {
  admin: {},
  token: null,
};

export default function(state = initialState, { type, payload }) {
  switch (type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        admin: payload.admin,
        token: payload.token,
      };
    case LOG_OUT_USER:
      return {
        ...state,
        admin: {},
        token: null,
      };
    default:
      return state;
  }
}
