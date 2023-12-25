import {createSlice} from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "popup",
  initialState: {
    modalCoderWorkspace: false,
    modalCoderFiles: false
  },
  reducers: {
    showModal: (state, data) => {
      state[data.payload] = true;
    },
    hideModal: (state, data) => {
      state[data.payload] = false;
    }
  }
})

export const {showModal, hideModal} = counterSlice.actions;

export default counterSlice.reducer;
