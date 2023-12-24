import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import System from "../models/system.js";

export const fetchUserSettings = createAsyncThunk(
  'fetchUserSettings',
  async () => {
    return await System.keys();
  }
)

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    settings: {}
  },
  reducers: {
    setSettings: (state, action) => {
      state.settings = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserSettings.fulfilled, (state, action) => {
      console.log('extraReducers', action);
      state.settings = action.payload;
    })
  },
})

export const {showModal, hideModal} = settingsSlice.actions;

export default settingsSlice.reducer;
