import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UndoAction } from "src/data/types";
import type { FunctionFormFields } from "src/data/validation";
import { EMPTY_FUNCTION_FORM } from "src/data/validation";

type ThemeMode = "light" | "dark";

interface DeleteDialogState {
  targetId: string | null;
  step: 1 | 2;
  captchaInput: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  undoAction: UndoAction | null;
}

interface UiState {
  themeMode: ThemeMode;
  formExpanded: boolean;
  functionForm: FunctionFormFields;
  modalFunctionId: string | null;
  selectedRowId: string | null;
  rightTab: number;
  deleteDialog: DeleteDialogState;
  snackbar: SnackbarState;
}

function loadThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem("themeMode");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "dark";
}

const initialState: UiState = {
  themeMode: loadThemeMode(),
  formExpanded: false,
  functionForm: EMPTY_FUNCTION_FORM,
  modalFunctionId: null,
  selectedRowId: null,
  rightTab: 0,
  deleteDialog: { targetId: null, step: 1, captchaInput: "" },
  snackbar: { open: false, message: "", undoAction: null },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.themeMode = state.themeMode === "dark" ? "light" : "dark";
      try { localStorage.setItem("themeMode", state.themeMode); } catch {}
    },
    setFormExpanded(state, action: PayloadAction<boolean>) {
      state.formExpanded = action.payload;
    },
    toggleFormExpanded(state) {
      state.formExpanded = !state.formExpanded;
    },
    updateFunctionForm(state, action: PayloadAction<Partial<FunctionFormFields>>) {
      Object.assign(state.functionForm, action.payload);
    },
    resetFunctionForm(state) {
      state.functionForm = EMPTY_FUNCTION_FORM;
    },
    openModal(state, action: PayloadAction<string>) {
      state.modalFunctionId = action.payload;
      state.selectedRowId = null;
      state.rightTab = 0;
      state.snackbar = { open: false, message: "", undoAction: null };
    },
    closeModal(state) {
      state.modalFunctionId = null;
      state.selectedRowId = null;
      state.rightTab = 0;
    },
    setSelectedRowId(state, action: PayloadAction<string | null>) {
      state.selectedRowId = action.payload;
    },
    toggleSelectedRow(state, action: PayloadAction<string>) {
      if (state.selectedRowId === action.payload) {
        state.selectedRowId = null;
      } else {
        state.selectedRowId = action.payload;
      }
      state.rightTab = 0;
    },
    setRightTab(state, action: PayloadAction<number>) {
      state.rightTab = action.payload;
    },
    openDeleteDialog(state, action: PayloadAction<string>) {
      state.deleteDialog = { targetId: action.payload, step: 1, captchaInput: "" };
    },
    closeDeleteDialog(state) {
      state.deleteDialog = { targetId: null, step: 1, captchaInput: "" };
    },
    setDeleteStep(state, action: PayloadAction<1 | 2>) {
      state.deleteDialog.step = action.payload;
    },
    setCaptchaInput(state, action: PayloadAction<string>) {
      state.deleteDialog.captchaInput = action.payload;
    },
    showSnackbar(state, action: PayloadAction<{ message: string; undoAction?: UndoAction | null }>) {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        undoAction: action.payload.undoAction ?? null,
      };
    },
    hideSnackbar(state) {
      state.snackbar = { open: false, message: "", undoAction: null };
    },
    selectRowAndOpenLinkPicker(state, action: PayloadAction<string>) {
      state.selectedRowId = action.payload;
      state.rightTab = 3;
    },
  },
});

export const {
  toggleTheme, setFormExpanded, toggleFormExpanded,
  updateFunctionForm, resetFunctionForm,
  openModal, closeModal,
  setSelectedRowId, toggleSelectedRow, setRightTab,
  openDeleteDialog, closeDeleteDialog, setDeleteStep, setCaptchaInput,
  showSnackbar, hideSnackbar,
  selectRowAndOpenLinkPicker,
} = uiSlice.actions;

export const selectThemeMode = (state: { ui: UiState }) => state.ui.themeMode;
export const selectFormExpanded = (state: { ui: UiState }) => state.ui.formExpanded;
export const selectFunctionForm = (state: { ui: UiState }) => state.ui.functionForm;
export const selectModalFunctionId = (state: { ui: UiState }) => state.ui.modalFunctionId;
export const selectSelectedRowId = (state: { ui: UiState }) => state.ui.selectedRowId;
export const selectRightTab = (state: { ui: UiState }) => state.ui.rightTab;
export const selectDeleteDialog = (state: { ui: UiState }) => state.ui.deleteDialog;
export const selectSnackbar = (state: { ui: UiState }) => state.ui.snackbar;

export default uiSlice.reducer;
