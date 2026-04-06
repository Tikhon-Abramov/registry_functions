import { useState, useMemo } from "react";
import {
  Box, Typography, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, useTheme, Chip, Divider,
} from "@mui/material";
import { Save, Link as LinkIcon } from "@mui/icons-material";
import type { Category, ActionLabel, Row, Periodicity, Complexity, Efficiency } from "src/data/types";
import {
    CATEGORIES, ACTIONS, PERIODICITIES, COMPLEXITIES, EFFICIENCIES,
    TRANSFER_TO_OPTIONS, CONTROL_POINTS, NEXT_ACTIONS, MAX_PER_CATEGORY, WHO_OPTIONS,
} from "src/data/constants";

interface StepFields {
  category: Category;
  detailText: string;
  who: string;
  actionLabel: ActionLabel;
  periodicity: Periodicity;
  complexity: Complexity;
  artifact: string;
  basis: string;
  artifactUsage: string;
  purpose: string;
  efficiency: Efficiency;
  transferTo: string;
  controlPoint: string;
  nextAction: string;
}

const emptyStep = (): StepFields => ({
  category: "Методология",
  detailText: "",
  who: "",
  actionLabel: "Оставить",
  periodicity: "Разово",
  complexity: "Средняя",
  artifact: "",
  basis: "",
  artifactUsage: "",
  purpose: "",
  efficiency: "Средняя",
  transferTo: "",
  controlPoint: "",
  nextAction: "",
});

const isStepFilled = (s: StepFields) =>
  s.detailText.trim().length > 0 && s.who.trim().length > 0;

export type NewRowData = {
  step: 1 | 2;
  category: Category;
  detailText: string;
  who: string;
  actionLabel: ActionLabel;
  periodicity?: Periodicity;
  complexity?: Complexity;
  artifact?: string;
  basis?: string;
  artifactUsage?: string;
  purpose?: string;
  efficiency?: Efficiency;
  transferTo?: string;
  controlPoint?: string;
  nextAction?: string;
};

interface AddItemFormProps {
  allRows: Row[];
  onSaveSingle: (data: NewRowData) => string;
  onSaveDual: (
    s1: Omit<NewRowData, "step">,
    s2: Omit<NewRowData, "step">,
  ) => void;
  onQuickLink: (id: string) => void;
}

function fieldsToData(fields: StepFields): Omit<NewRowData, "step"> {
  return {
    category: fields.category,
    detailText: fields.detailText.trim(),
    who: fields.who.trim(),
    actionLabel: fields.actionLabel,
    periodicity: fields.periodicity,
    complexity: fields.complexity,
    artifact: fields.artifact.trim() || undefined,
    basis: fields.basis.trim() || undefined,
    artifactUsage: fields.artifactUsage.trim() || undefined,
    purpose: fields.purpose.trim() || undefined,
    efficiency: fields.efficiency,
    transferTo: fields.transferTo || undefined,
    controlPoint: fields.controlPoint || undefined,
    nextAction: fields.nextAction || undefined,
  };
}

export default function AddItemForm({ allRows, onSaveSingle, onSaveDual, onQuickLink }: AddItemFormProps) {
  const theme = useTheme();
  const c = theme.custom;

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [s1, setS1] = useState<StepFields>(emptyStep());
  const [s2, setS2] = useState<StepFields>(emptyStep());
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  const s1Filled = isStepFilled(s1);
  const s2Filled = isStepFilled(s2);
  const bothFilled = s1Filled && s2Filled;

  const countByStepCategory = (step: 1 | 2, cat: Category) =>
    allRows.filter(r => r.step === step && r.category === cat).length;

  const s1Count = countByStepCategory(1, s1.category);
  const s2Count = countByStepCategory(2, s2.category);
  const s1LimitReached = s1Count >= MAX_PER_CATEGORY;
  const s2LimitReached = s2Count >= MAX_PER_CATEGORY;

  const canSave = useMemo(() => {
    if (bothFilled) return !s1LimitReached && !s2LimitReached;
    if (s1Filled) return !s1LimitReached;
    if (s2Filled) return !s2LimitReached;
    return false;
  }, [bothFilled, s1Filled, s2Filled, s1LimitReached, s2LimitReached]);

  const currentFields = activeStep === 1 ? s1 : s2;
  const setCurrentFields = activeStep === 1 ? setS1 : setS2;
  const currentCount = activeStep === 1 ? s1Count : s2Count;
  const currentLimitReached = activeStep === 1 ? s1LimitReached : s2LimitReached;
  const currentFilled = activeStep === 1 ? s1Filled : s2Filled;

  const handleSave = () => {
    if (!canSave) return;
    if (bothFilled) {
      onSaveDual(fieldsToData(s1), fieldsToData(s2));
      setLastSavedId(null);
    } else if (s1Filled) {
      const newId = onSaveSingle({ step: 1, ...fieldsToData(s1) });
      setLastSavedId(newId);
    } else if (s2Filled) {
      const newId = onSaveSingle({ step: 2, ...fieldsToData(s2) });
      setLastSavedId(newId);
    }
    setS1(emptyStep());
    setS2(emptyStep());
  };

  const saveLabel = bothFilled ? "Сохранить (Шаг 1 + Шаг 2)" : "Сохранить";

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: c.bgInput, color: c.textBody, fontSize: "0.78rem",
      "& fieldset": { borderColor: c.borderMedium },
      "&:hover fieldset": { borderColor: c.borderHover },
      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
    },
    "& .MuiInputLabel-root": { color: c.textMuted, fontSize: "0.72rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.primary.main },
  };

  const selectSx = {
    bgcolor: c.bgInput, color: c.textBody, fontSize: "0.78rem",
    "& fieldset": { borderColor: c.borderMedium },
    "&:hover fieldset": { borderColor: c.borderHover },
    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
    "& .MuiSelect-icon": { color: c.textMuted },
  };

  const labelSx = { color: c.textMuted, fontSize: "0.72rem", "&.Mui-focused": { color: theme.palette.primary.main } };
  const menuSx = { PaperProps: { sx: { bgcolor: c.bgMenu, color: c.textBody, maxHeight: 200, border: `1px solid ${c.borderMain}`, "& .MuiMenuItem-root": { "&:hover": { bgcolor: c.hoverOverlayStrong }, "&.Mui-selected": { bgcolor: c.selectedBg } } } } };

  const renderSelect = (label: string, value: string, options: readonly string[], key: keyof StepFields, testId: string) => (
    <FormControl size="small" fullWidth>
      <InputLabel sx={labelSx}>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => setCurrentFields(prev => ({ ...prev, [key]: e.target.value }))}
        label={label}
        sx={selectSx}
        MenuProps={menuSx}
        data-testid={testId}
      >
        {options.map(o => (
          <MenuItem key={o || "__empty__"} value={o} sx={{ fontSize: "0.78rem", fontStyle: o ? "normal" : "italic", color: o ? undefined : c.textDim }}>
            {o || "— не выбрано —"}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderTextField = (label: string, value: string, key: keyof StepFields, testId: string, multiline = false) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => setCurrentFields(prev => ({ ...prev, [key]: e.target.value }))}
      fullWidth
      size="small"
      multiline={multiline}
      rows={multiline ? 2 : undefined}
      sx={inputSx}
      data-testid={testId}
    />
  );

  const renderStepTab = (step: 1 | 2, label: string, filled: boolean) => {
    const isActive = activeStep === step;
    return (
      <Button
        variant={isActive ? "contained" : "outlined"}
        size="small"
        onClick={() => setActiveStep(step)}
        sx={{
          flex: 1, fontSize: "0.72rem", textTransform: "none", position: "relative",
          ...(isActive
            ? { bgcolor: theme.palette.primary.main, "&:hover": { bgcolor: theme.palette.primary.dark } }
            : { borderColor: c.borderMedium, color: c.textSecondary, "&:hover": { borderColor: c.borderHover, bgcolor: c.hoverOverlayMed } }),
        }}
        data-testid={`button-step-${step}`}
      >
        {label}
        {filled && (
          <Chip
            label="OK"
            size="small"
            sx={{
              ml: 0.5, height: 16, fontSize: "0.55rem", fontWeight: 700,
              bgcolor: isActive ? "rgba(255,255,255,0.25)" : theme.palette.success.main,
              color: "#fff",
              "& .MuiChip-label": { px: 0.5 },
            }}
            data-testid={`chip-filled-step-${step}`}
          />
        )}
      </Button>
    );
  };

  const sectionLabel = (text: string) => (
    <Typography variant="caption" sx={{ color: c.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.58rem", mt: 0.5 }}>
      {text}
    </Typography>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ p: 2, pb: 1, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: c.textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
          Новый элемент
        </Typography>
      </Box>

      <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {renderStepTab(1, "Шаг 1", s1Filled)}
          {renderStepTab(2, "Шаг 2", s2Filled)}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", px: 2, display: "flex", flexDirection: "column", gap: 1.5, pb: 1 }}>
        {currentLimitReached && currentFilled && (
          <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontSize: "0.68rem" }}>
            Лимит {MAX_PER_CATEGORY} в категории "{currentFields.category}" достигнут
          </Typography>
        )}

        {sectionLabel("Основные поля")}

        {renderSelect("Категория", currentFields.category, CATEGORIES, "category", "select-category")}

        <TextField
          label="Детализация *"
          multiline
          rows={2}
          value={currentFields.detailText}
          onChange={(e) => setCurrentFields(prev => ({ ...prev, detailText: e.target.value }))}
          fullWidth
          size="small"
          sx={inputSx}
          data-testid="input-detail-text"
        />

        {/*<TextField*/}
        {/*  label="Кто делает *"*/}
        {/*  value={currentFields.who}*/}
        {/*  onChange={(e) => setCurrentFields(prev => ({ ...prev, who: e.target.value }))}*/}
        {/*  fullWidth*/}
        {/*  size="small"*/}
        {/*  sx={inputSx}*/}
        {/*  data-testid="input-who"*/}
        {/*/>*/}

        {renderSelect("Кто делает", currentFields.who, WHO_OPTIONS, "who", "select-action")}
        {renderSelect("Что делать", currentFields.actionLabel, ACTIONS, "actionLabel", "select-action")}

        <Divider sx={{ borderColor: c.borderLight, my: 0.5 }} />
        {sectionLabel("Дополнительные сведения")}

        {renderSelect("Периодичность", currentFields.periodicity, PERIODICITIES, "periodicity", "select-periodicity")}
        {renderSelect("Сложность", currentFields.complexity, COMPLEXITIES, "complexity", "select-complexity")}
        {renderTextField("Артефакт", currentFields.artifact, "artifact", "input-artifact")}
        {renderTextField("Основание", currentFields.basis, "basis", "input-basis")}
        {renderTextField("Как используется артефакт", currentFields.artifactUsage, "artifactUsage", "input-artifact-usage", true)}
        {renderTextField("Зачем выполняется", currentFields.purpose, "purpose", "input-purpose", true)}
        {renderSelect("Эффективность", currentFields.efficiency, EFFICIENCIES, "efficiency", "select-efficiency")}
        {renderSelect("Кому передать", currentFields.transferTo, ["", ...TRANSFER_TO_OPTIONS], "transferTo", "select-transfer-to")}
        {/*{renderSelect("Пункт контроля", currentFields.controlPoint, ["", ...CONTROL_POINTS], "controlPoint", "select-control-point")}*/}
        {/*{renderSelect("Следующее действие", currentFields.nextAction, ["", ...NEXT_ACTIONS], "nextAction", "select-next-action")}*/}
      </Box>

      <Box sx={{ px: 2, py: 1.5, flexShrink: 0, borderTop: `1px solid ${c.borderLight}`, display: "flex", flexDirection: "column", gap: 1 }}>
        {bothFilled && (
          <Typography variant="caption" sx={{ color: theme.palette.success.main, fontSize: "0.68rem", textAlign: "center" }}>
            Оба шага заполнены — будут сохранены вместе со связью
          </Typography>
        )}

        <Typography variant="caption" sx={{ color: c.textDim, fontSize: "0.62rem" }}>
          В категории (Шаг {activeStep}): {currentCount} / {MAX_PER_CATEGORY}
        </Typography>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave}
          startIcon={<Save sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none", fontSize: "0.8rem",
            bgcolor: c.saveBtn, "&:hover": { bgcolor: c.saveBtnHover },
            "&.Mui-disabled": { bgcolor: c.borderMain, color: c.textDim },
          }}
          data-testid="button-save-item"
        >
          {saveLabel}
        </Button>

        {lastSavedId && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => onQuickLink(lastSavedId)}
            startIcon={<LinkIcon sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: "none", fontSize: "0.72rem",
              borderColor: theme.palette.primary.main, color: c.accentBlue,
              "&:hover": { borderColor: theme.palette.primary.dark, bgcolor: c.selectedBg },
            }}
            data-testid="button-quick-link"
          >
            Сразу связать
          </Button>
        )}
      </Box>
    </Box>
  );
}
