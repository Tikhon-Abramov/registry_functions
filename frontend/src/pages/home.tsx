import { useCallback } from "react";
import {
  Box, Typography, Button, TextField, MenuItem, Select,
  InputLabel, FormControl, Chip, Collapse,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Paper, OutlinedInput, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { Add, RestartAlt, Delete, Layers, OpenInNew, ExpandMore, ExpandLess, DarkMode, LightMode } from "@mui/icons-material";
import DetailizationModal from "src/components/detailization-modal";
import { useAppDispatch, useAppSelector } from "src/store";
import { selectAllFunctions, selectFunctionById, addFunction, removeFunction } from "src/store/functionsRegistrySlice";
import {
  selectThemeMode, selectFormExpanded, selectFunctionForm, selectModalFunctionId, selectDeleteDialog,
  toggleTheme, toggleFormExpanded, updateFunctionForm, resetFunctionForm,
  openModal, closeModal, openDeleteDialog, closeDeleteDialog, setDeleteStep, setCaptchaInput, setFormExpanded,
} from "src/store/uiSlice";
import type { FunctionRecord } from "src/data/types";
import {
  MARKERS, CENTRALIZATIONS, COMPETENCE_CENTERS,
  STRATEGY_PROJECTS, CURATORS_CA, NU_ZNU,
  MANAGERS_MIUDOL, NI_ZNI, DELETE_CAPTCHA,
  TABLE_PIN_W_NUM, TABLE_PIN_W_ACT, TABLE_COL_W, FUNCTION_NAMES,
} from "src/data/constants";
import { createFunctionId } from "src/data/idGenerators";
import { generateFunctionDetails } from "src/data/mockData";
import { isFunctionFormValid } from "src/data/validation";

export default function Home() {
  const theme = useTheme();
  const c = theme.custom;
  const dispatch = useAppDispatch();

  const mode = useAppSelector(selectThemeMode);
  const functions = useAppSelector(selectAllFunctions);
  const formExpanded = useAppSelector(selectFormExpanded);
  const form = useAppSelector(selectFunctionForm);
  const modalFunctionId = useAppSelector(selectModalFunctionId);
  const deleteDialog = useAppSelector(selectDeleteDialog);

  const deleteTarget = useAppSelector(state => deleteDialog.targetId ? selectFunctionById(state, deleteDialog.targetId) : null);

  const deleteStep = deleteDialog.step;
  const captchaInput = deleteDialog.captchaInput;

  const sxField = {
    "& .MuiOutlinedInput-root": {
      fontSize: "0.82rem",
      bgcolor: c.hoverOverlay,
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.82rem",
    },
  };

  const sxSelect = {
    fontSize: "0.82rem",
    bgcolor: c.hoverOverlay,
  };

  const isFormValid = isFunctionFormValid(form);

  const handleTextChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateFunctionForm({ [field]: e.target.value }));
  }, [dispatch]);

  const handleSelectChange = useCallback((field: string) => (e: SelectChangeEvent<string>) => {
    dispatch(updateFunctionForm({ [field]: e.target.value }));
  }, [dispatch]);

  const handleMultiSelectChange = useCallback((e: SelectChangeEvent<string[]>) => {
    const val = e.target.value;
    dispatch(updateFunctionForm({ strategyProjects: typeof val === "string" ? val.split(",") : val }));
  }, [dispatch]);

  const handleAdd = useCallback(() => {
    if (!isFormValid) return;
    const newFn: FunctionRecord = {
      id: createFunctionId(),
      name: form.name.trim(),
      marker: form.marker,
      centralization: form.centralization,
      competenceCenter: form.competenceCenter,
      strategyProjects: [...form.strategyProjects],
      curatorCA: form.curatorCA,
      nuZnu: form.nuZnu,
      managerMiudol: form.managerMiudol,
      niZni: form.niZni,
      details: {},
      //details: generateFunctionDetails(),
    };
    dispatch(addFunction(newFn));
    dispatch(resetFunctionForm());
    dispatch(setFormExpanded(false));
  }, [form, isFormValid, dispatch]);

  const confirmDelete = useCallback(() => {
    if (!deleteDialog.targetId || captchaInput !== DELETE_CAPTCHA) return;
    dispatch(removeFunction(deleteDialog.targetId));
    dispatch(closeDeleteDialog());
  }, [deleteDialog.targetId, captchaInput, dispatch]);

  const handleClear = useCallback(() => {
    dispatch(resetFunctionForm());
  }, [dispatch]);



  const PIN_W_NUM = TABLE_PIN_W_NUM;
  const PIN_W_ACT = TABLE_PIN_W_ACT;
  const COL_W = TABLE_COL_W;

  const headCell = {
    color: c.textMuted,
    fontSize: "0.65rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    whiteSpace: "normal" as const,
    overflowWrap: "anywhere" as const,
    wordBreak: "break-word" as const,
    py: 1,
    px: 1,
    borderBottom: `1px solid ${c.borderMain}`,
    bgcolor: c.bgPaper,
    position: "sticky" as const,
    top: 0,
    zIndex: 2,
    overflow: "hidden" as const,
  };

  const bodyCell = {
    fontSize: "0.78rem",
    color: c.textBody,
    py: 1,
    px: 1,
    borderBottom: `1px solid ${c.borderLight}`,
    verticalAlign: "top" as const,
    whiteSpace: "normal" as const,
    overflowWrap: "break-word" as const,
    wordBreak: "normal" as const,
  };

  return (
    <Box sx={{ height: "100vh", bgcolor: c.bgDeep, px: 3, py: 3, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ maxWidth: 1600, mx: "auto", width: "100%", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexShrink: 0 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 1.5,
            background: `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Layers sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: c.textBright, fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.2 }} data-testid="text-page-title">
              Реестр функций
            </Typography>
            <Typography variant="caption" sx={{ color: c.textMuted, fontSize: "0.7rem" }}>
              Функциональный анализ · Управление функциями и детализация
            </Typography>
          </Box>
          <IconButton
            onClick={() => dispatch(toggleTheme())}
            sx={{ color: c.textSecondary, "&:hover": { color: c.textPrimary } }}
            data-testid="button-toggle-theme"
          >
            {mode === "dark" ? <LightMode sx={{ fontSize: 20 }} /> : <DarkMode sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>

        <Paper
          elevation={0}
          sx={{
            bgcolor: c.bgPaper,
            border: `1px solid ${c.borderMain}`,
            borderRadius: 2,
            mb: 2,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Box
            onClick={() => dispatch(toggleFormExpanded())}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              px: 2.5, py: 1.5, cursor: "pointer",
              "&:hover": { bgcolor: c.hoverOverlay },
              transition: "background-color 0.15s",
            }}
            data-testid="button-toggle-form"
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Add sx={{ fontSize: 18, color: c.accentBlue }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: c.textPrimary, fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.3 }} data-testid="text-form-title">
                  Добавить функцию
                </Typography>
                {!formExpanded && (
                  <Typography variant="caption" sx={{ color: c.textMuted, fontSize: "0.68rem" }}>
                    Нажмите, чтобы добавить новую функцию
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton size="small" sx={{ color: c.textMuted }} data-testid="button-expand-form">
              {formExpanded ? <ExpandLess sx={{ fontSize: 20 }} /> : <ExpandMore sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>

          <Collapse in={formExpanded} timeout={250}>
          <Box sx={{ px: 2.5, pb: 2.5, pt: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2, mb: 2 }}>


            {/*<TextField*/}
            {/*  label="Наименование функции"*/}
            {/*  value={form.name}*/}
            {/*  onChange={handleTextChange("name")}*/}
            {/*  size="small"*/}
            {/*  fullWidth*/}
            {/*  sx={{ ...sxField, gridColumn: "1 / -1" }}*/}
            {/*  data-testid="input-name"*/}
            {/*/>*/}

            <FormControl size="small" fullWidth sx={{ ...sxField, gridColumn: "1 / -1" }}>
              <InputLabel sx={{ fontSize: "0.82rem" }}>Наименование функции</InputLabel>
              <Select
                  value={form.name}
                  onChange={handleSelectChange("name")}
                  label="Наименование функции"
                  sx={sxSelect}
                  data-testid="select-name"
              >
                {FUNCTION_NAMES.map(m => <MenuItem key={m} value={m} sx={{ fontSize: "0.82rem" }}>{m}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={sxField}>
              <InputLabel sx={{ fontSize: "0.82rem" }}>Маркер функции</InputLabel>
              <Select
                value={form.marker}
                onChange={handleSelectChange("marker")}
                label="Маркер функции"
                sx={sxSelect}
                data-testid="select-marker"
              >
                {MARKERS.map(m => <MenuItem key={m} value={m} sx={{ fontSize: "0.82rem" }}>{m}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={sxField}>
              <InputLabel sx={{ fontSize: "0.82rem" }}>Централизация функции</InputLabel>
              <Select
                value={form.centralization}
                onChange={handleSelectChange("centralization")}
                label="Централизация функции"
                sx={sxSelect}
                data-testid="select-centralization"
              >
                {CENTRALIZATIONS.map(c => <MenuItem key={c} value={c} sx={{ fontSize: "0.82rem" }}>{c}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={sxField}>
              <InputLabel sx={{ fontSize: "0.82rem" }}>Центр компетенций</InputLabel>
              <Select
                value={form.competenceCenter}
                onChange={handleSelectChange("competenceCenter")}
                label="Центр компетенций"
                sx={sxSelect}
                data-testid="select-competence-center"
              >
                {COMPETENCE_CENTERS.map(c => (
                  <MenuItem key={c} value={c} sx={{ fontSize: "0.78rem", whiteSpace: "normal", maxWidth: 500 }}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={{ ...sxField, gridColumn: "1 / -1" }}>
              <InputLabel sx={{ fontSize: "0.82rem" }}>Проект «Стратегия Д»</InputLabel>
              <Select
                multiple
                value={form.strategyProjects}
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="Проект «Стратегия Д»" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map(v => (
                      <Chip key={v} label={v} size="small" sx={{ height: 20, fontSize: "0.68rem", bgcolor: c.strategyChipBg, color: c.strategyChipColor, "& .MuiChip-label": { px: 0.75 } }} />
                    ))}
                  </Box>
                )}
                sx={sxSelect}
                data-testid="select-strategy-projects"
              >
                {STRATEGY_PROJECTS.map(p => <MenuItem key={p} value={p} sx={{ fontSize: "0.82rem" }}>{p}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={sxField}>
              <InputLabel sx={{ fontSize: "0.82rem" }}>Куратор ЦА</InputLabel>
              <Select
                value={form.curatorCA}
                onChange={handleSelectChange("curatorCA")}
                label="Куратор ЦА"
                sx={sxSelect}
                data-testid="select-curator-ca"
              >
                {CURATORS_CA.map(c => <MenuItem key={c} value={c} sx={{ fontSize: "0.82rem" }}>{c}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={sxField}>
              <InputLabel sx={{ fontSize: "0.82rem" }}>НУ/ЗНУ</InputLabel>
              <Select
                //value={form.competenceCenter === "РАУ" ? "Шляпин И.Г." : form.competenceCenter === "ПРД" ? "Мещеряков С.В." : form.nuZnu}
                value={form.nuZnu}
                onChange={handleSelectChange("nuZnu")}
                label="НУ/ЗНУ"
                sx={sxSelect}
                data-testid="select-nu-znu"
              >
                {NU_ZNU.map(n => <MenuItem key={n} value={n} sx={{ fontSize: "0.82rem" }}>{n}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={sxField}>
              <InputLabel sx={{ fontSize: "0.82rem" }}>Менеджер МИУДОЛ</InputLabel>
              <Select
                value={form.managerMiudol}
                onChange={handleSelectChange("managerMiudol")}
                label="Менеджер МИУДОЛ"
                sx={sxSelect}
                data-testid="select-manager-miudol"
              >
                {MANAGERS_MIUDOL.map(m => <MenuItem key={m} value={m} sx={{ fontSize: "0.82rem" }}>{m}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={sxField}>
              <InputLabel sx={{ fontSize: "0.82rem" }}>НИ/ЗНИ</InputLabel>
              <Select
                value={form.niZni}
                onChange={handleSelectChange("niZni")}
                label="НИ/ЗНИ"
                sx={sxSelect}
                data-testid="select-ni-zni"
              >
                {NI_ZNI.map(n => <MenuItem key={n} value={n} sx={{ fontSize: "0.82rem" }}>{n}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={!isFormValid}
              startIcon={<Add sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                fontSize: "0.78rem",
                px: 2.5,
                background: isFormValid ? `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})` : undefined,
                "&:hover": { background: `linear-gradient(135deg, ${c.gradientFromHover}, ${c.gradientToHover})` },
              }}
              data-testid="button-add-function"
            >
              Добавить функцию
            </Button>
            <Button
              variant="outlined"
              onClick={handleClear}
              startIcon={<RestartAlt sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                fontSize: "0.78rem",
                color: c.textSecondary,
                borderColor: c.borderMedium,
                "&:hover": { borderColor: c.borderHover, bgcolor: c.hoverOverlayStrong },
              }}
              data-testid="button-clear-form"
            >
              Очистить
            </Button>
          </Box>
          </Box>
          </Collapse>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            bgcolor: c.bgPaper,
            border: `1px solid ${c.borderMain}`,
            borderRadius: 2,
            overflow: "hidden",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${c.borderMain}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <Typography variant="subtitle2" sx={{ color: c.textPrimary, fontSize: "0.82rem", fontWeight: 600 }} data-testid="text-table-title">
              Список функций
            </Typography>
            <Typography variant="caption" sx={{ color: c.textDim, fontSize: "0.7rem" }} data-testid="text-fn-count">
              {functions.length} {functions.length === 1 ? "функция" : functions.length >= 2 && functions.length <= 4 ? "функции" : "функций"}
            </Typography>
          </Box>

          {functions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center", color: c.textMuted, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="body2" sx={{ fontSize: "0.82rem" }} data-testid="text-empty-table">
                Функции не добавлены. Заполните форму выше и нажмите «Добавить функцию».
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ flex: 1, overflow: "auto" }}>
              <Table size="small" stickyHeader sx={{ tableLayout: "fixed", minWidth: PIN_W_NUM + PIN_W_ACT + COL_W * 9, width: "100%" }}>
                <colgroup>
                  <col style={{ width: PIN_W_NUM }} />
                  <col style={{ width: PIN_W_ACT }} />
                  <col style={{ width: COL_W }} />
                  <col style={{ width: COL_W }} />
                  <col style={{ width: COL_W }} />
                  <col style={{ width: COL_W }} />
                  <col style={{ width: COL_W }} />
                  <col style={{ width: COL_W }} />
                  <col style={{ width: COL_W }} />
                  <col style={{ width: COL_W }} />
                  <col />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...headCell, position: "sticky", left: 0, zIndex: 4, bgcolor: c.bgPaper, px: 0.5, textAlign: "center", borderRight: `1px solid ${c.borderDivider}` }}>№</TableCell>
                    <TableCell sx={{ ...headCell, position: "sticky", left: PIN_W_NUM, zIndex: 4, bgcolor: c.bgPaper, borderRight: `1px solid ${c.borderMain}`, px: 0.5, textAlign: "center" }}>Действия</TableCell>
                    <TableCell sx={headCell}>Наименование</TableCell>
                    <TableCell sx={headCell}>Маркер</TableCell>
                    <TableCell sx={headCell}>Центр.</TableCell>
                    <TableCell sx={headCell}>Центр комп.</TableCell>
                    <TableCell sx={headCell}>Стратегия Д</TableCell>
                    <TableCell sx={headCell}>Куратор ЦА</TableCell>
                    <TableCell sx={headCell}>НУ/ЗНУ</TableCell>
                    <TableCell sx={headCell}>Менеджер</TableCell>
                    <TableCell sx={headCell}>НИ/ЗНИ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {functions.map((fn, idx) => (
                    <TableRow
                      key={fn.id}
                      sx={{
                        "&:hover": { bgcolor: c.hoverOverlay },
                      }}
                      data-testid={`row-fn-${fn.id}`}
                    >
                      <TableCell sx={{ ...bodyCell, position: "sticky", left: 0, zIndex: 2, bgcolor: c.bgPaper, px: 0.5, textAlign: "center", verticalAlign: "middle", color: c.textMuted, fontSize: "0.72rem", borderRight: `1px solid ${c.borderDivider}` }}>
                        {idx + 1}
                      </TableCell>
                      <TableCell sx={{ ...bodyCell, position: "sticky", left: PIN_W_NUM, zIndex: 2, bgcolor: c.bgPaper, borderRight: `1px solid ${c.borderMain}`, px: 0.5, verticalAlign: "middle" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.25 }}>
                          <IconButton
                            size="small"
                            onClick={() => dispatch(openDeleteDialog(fn.id))}
                            sx={{ color: c.textMuted, "&:hover": { color: c.dangerHover } }}
                            data-testid={`button-delete-${fn.id}`}
                          >
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => dispatch(openModal(fn.id))}
                            sx={{ color: c.accentBlue, "&:hover": { bgcolor: c.detailBtnHover } }}
                            data-testid={`button-detail-${fn.id}`}
                          >
                            <OpenInNew sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ ...bodyCell, fontWeight: 500, color: c.textPrimary, lineHeight: 1.35 }}>
                        {fn.name}
                      </TableCell>
                      <TableCell sx={{ ...bodyCell, fontSize: "0.72rem", color: fn.marker === MARKERS[0] ? c.markerGreen : c.markerPink, lineHeight: 1.35 }}>
                        {fn.marker}
                      </TableCell>
                      <TableCell sx={bodyCell}>
                        <Chip
                          label={fn.centralization}
                          size="small"
                          sx={{
                            fontSize: "0.66rem", height: 20,
                            bgcolor: fn.centralization === "Да" ? c.centralYesBg : c.chipSubtle,
                            color: fn.centralization === "Да" ? c.accentBlue : c.textSecondary,
                            "& .MuiChip-label": { px: 0.5 },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ ...bodyCell, fontSize: "0.75rem", lineHeight: 1.35 }}>
                        {fn.competenceCenter}
                      </TableCell>
                      <TableCell sx={bodyCell}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {fn.strategyProjects.map(p => (
                            <Chip
                              key={p}
                              label={p}
                              size="small"
                              sx={{
                                fontSize: "0.62rem", height: 20,
                                bgcolor: c.strategyChipBg, color: c.strategyChipColor,
                                "& .MuiChip-label": { px: 0.5 },
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell sx={bodyCell}>{fn.curatorCA}</TableCell>
                      <TableCell sx={bodyCell}>{fn.nuZnu}</TableCell>
                      <TableCell sx={bodyCell}>{fn.managerMiudol}</TableCell>
                      <TableCell sx={bodyCell}>{fn.niZni}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <DetailizationModal />

      <Dialog
        open={!!deleteTarget}
        onClose={() => dispatch(closeDeleteDialog())}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: c.bgPaper,
            border: `1px solid ${c.borderMain}`,
            borderRadius: 2,
          },
        }}
        slotProps={{
          backdrop: { sx: { bgcolor: theme.palette.mode === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)" } },
        }}
      >
        <DialogTitle sx={{ color: c.textBright, fontSize: "1rem", fontWeight: 600, pb: 0.5 }} data-testid="text-delete-dialog-title">
          Подтверждение удаления
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          {deleteTarget && (
            <Typography variant="body2" sx={{ color: c.textSecondary, fontSize: "0.8rem", mb: 2 }} data-testid="text-delete-function-name">
              Наименование функции: <Box component="span" sx={{ color: c.textPrimary, fontWeight: 500 }}>{deleteTarget.name}</Box>
            </Typography>
          )}

          {deleteStep === 1 && (
            <Typography variant="body1" sx={{ color: c.textBody, fontSize: "0.9rem" }} data-testid="text-delete-confirm-question">
              Вы точно хотите удалить функцию?
            </Typography>
          )}

          {deleteStep === 2 && (
            <Box>
              <Typography variant="body1" sx={{ color: c.textBody, fontSize: "0.85rem", mb: 2 }} data-testid="text-delete-captcha-prompt">
                Для подтверждения удаления введите код: <Box component="span" sx={{ fontWeight: 700, color: c.textBright }}>9967</Box>
              </Typography>
              <TextField
                label="Код подтверждения"
                value={captchaInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  dispatch(setCaptchaInput(val));
                }}
                fullWidth
                size="small"
                autoFocus
                inputProps={{ maxLength: 4, inputMode: "numeric" }}
                error={captchaInput.length === 4 && captchaInput !== DELETE_CAPTCHA}
                helperText={captchaInput.length === 4 && captchaInput !== DELETE_CAPTCHA ? "Неверный код" : " "}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: c.bgInput,
                    color: c.textBody,
                    fontSize: "1rem",
                    letterSpacing: "0.3em",
                    "& fieldset": { borderColor: c.borderMedium },
                    "&:hover fieldset": { borderColor: c.borderHover },
                    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                  },
                  "& .MuiInputLabel-root": { color: c.textMuted, fontSize: "0.82rem" },
                  "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.primary.main },
                }}
                data-testid="input-captcha"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {deleteStep === 1 && (
            <>
              <Button
                onClick={() => dispatch(closeDeleteDialog())}
                sx={{ textTransform: "none", color: c.textSecondary, fontSize: "0.82rem" }}
                data-testid="button-delete-no"
              >
                Нет
              </Button>
              <Button
                variant="contained"
                onClick={() => dispatch(setDeleteStep(2))}
                sx={{
                  textTransform: "none", fontSize: "0.82rem",
                  bgcolor: c.dangerHover, "&:hover": { bgcolor: theme.palette.mode === "dark" ? "#dc2626" : "#b91c1c" },
                }}
                data-testid="button-delete-yes"
              >
                Да
              </Button>
            </>
          )}
          {deleteStep === 2 && (
            <>
              <Button
                onClick={() => dispatch(closeDeleteDialog())}
                sx={{ textTransform: "none", color: c.textSecondary, fontSize: "0.82rem" }}
                data-testid="button-delete-cancel"
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={confirmDelete}
                disabled={captchaInput !== DELETE_CAPTCHA}
                sx={{
                  textTransform: "none", fontSize: "0.82rem",
                  bgcolor: c.dangerHover, "&:hover": { bgcolor: theme.palette.mode === "dark" ? "#dc2626" : "#b91c1c" },
                  "&.Mui-disabled": { bgcolor: c.borderMain, color: c.textDim },
                }}
                data-testid="button-delete-confirm"
              >
                Удалить
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
