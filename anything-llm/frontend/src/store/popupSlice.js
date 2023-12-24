import {createSlice} from "@reduxjs/toolkit";

export const popupSlice = createSlice({
  name: "popup",
  initialState: {
    modalCoderWorkspace: false
  },
  reducers: {
    showModal: (state, action) => {
      state[action.payload] = true;
    },
    hideModal: (state, action) => {
      state[action.payload] = false;
    }
  }
})

export const {showModal, hideModal} = popupSlice.actions;

export default popupSlice.reducer;
