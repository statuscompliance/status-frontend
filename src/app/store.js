import { configureStore } from "@reduxjs/toolkit";
import controlReducer from "../features/controls/controlSlice";
import inputReducer from "../features/inputs/inputSlice";

export const store = configureStore({
  reducer: {
    controls: controlReducer,
    inputs: inputReducer,
  },
});
