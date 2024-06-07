import { createSlice } from "@reduxjs/toolkit";

export const inputSlice = createSlice({
  name: "inputs",
  initialState: { inputs: {} },
  reducers: {
    addEmptyInput: (state, action) => {
      const { controlId } = action.payload;
      state.inputs[controlId] = [];
    },
    editInput: (state, action) => {
      const { controlId, inputId, data } = action.payload;
      if (state.inputs[controlId]) {
        const index = state.inputs[controlId].findIndex(
          (input) => input.id === inputId
        );
        if (index !== -1) {
          state.inputs[controlId][index] = {
            ...state.inputs[controlId][index],
            ...data,
          };
        }
      }
    },
    setInputs: (state, action) => {
      const { controlId, inputs } = action.payload;
      state.inputs[controlId] = inputs;
    },
    clearInputs: (state) => {
      state.inputs = {};
    },
    updateInputAtIndex: (state, action) => {
      const { index, field, value } = action.payload;
      if (state[index]) {
        if (field === "mashup_id" && value === "") {
          state[index][field] = -1;
        } else {
          state[index][field] = value;
        }
      }
    },
    removeInput: (state, action) => {
      const { index } = action.payload;
      if (index !== -1) {
        delete state.inputs[index];
      }
    },
  },
});

export const {
  addInput,
  addEmptyInput,
  editInput,
  setInputs,
  clearInputs,
  updateInputAtIndex,
  removeInput,
} = inputSlice.actions;

export default inputSlice.reducer;
