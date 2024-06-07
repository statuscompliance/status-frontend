import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export const controlSlice = createSlice({
  name: "controls",
  initialState: {
    controls: [],
    lastAddedId: null,
  },
  reducers: {
    addEmptyControl: (state) => {
      const controlId = uuidv4();

      const emptyControl = {
        id: controlId,
        name: "",
        description: "",
        period: "DAILY",
        startDate: null,
        endDate: null,
        mashup_id: null,
        catalog_id: null,
      };
      state.controls.push(emptyControl);
      state.lastAddedId = controlId;
    },
    editControl: (state, action) => {
      const { controlId, field, value } = action.payload;
      const index = state.controls.findIndex(
        (control) => control.id === controlId
      );
      if (index !== -1) {
        if (field === "mashup_id" && value === "") {
          state.controls[index][field] = -1;
        } else {
          state.controls[index][field] = value;
        }
      }
    },
    setControls: (state, action) => {
      state.controls = action.payload;
    },
    clearControls: (state) => {
      state.controls = [];
    },
    removeControl: (state, action) => {
      const { id } = action.payload;
      state.controls = state.controls.filter((control) => control.id !== id);
    },
  },
});

export const {
  lastAddedId,
  addEmptyControl,
  editControl,
  setControls,
  clearControls,
  removeControl,
} = controlSlice.actions;

export default controlSlice.reducer;
