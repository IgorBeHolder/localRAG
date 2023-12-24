import {configureStore} from "@reduxjs/toolkit";

import popupReducer from "./popupSlice.js";

export default configureStore({
  reducer: {
    popup: popupReducer
  }
});
