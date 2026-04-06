import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import functionsRegistryReducer from "./functionsRegistrySlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    functionsRegistry: functionsRegistryReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
