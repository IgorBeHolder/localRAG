import {configureStore} from "@reduxjs/toolkit";

import popupReducer from "./popupSlice.js";
import settingsReducer from "./settingsSlice.js";

export default configureStore({
  reducer: {
    popup: popupReducer,
    settings: settingsReducer
  }
});
