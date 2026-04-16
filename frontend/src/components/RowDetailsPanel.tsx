import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, useTheme, Chip, Divider,
} from "@mui/material";
import { Edit, Save, Close } from "@mui/icons-material";
import type { Row, Category, ActionLabel, Periodicity, Complexity, Efficiency } from "src/data/types";
import {
  PERIODICITIES, COMPLEXITIES, EFFICIENCIES,
  TRANSFER_TO_OPTIONS, CONTROL_POINTS, NEXT_ACTIONS, EXTRA_FIELD_LABELS,
} from "src/data/constants";

interface RowDetailsPanelProps {
  row: Row | null;
  onUpdateRow: (id: string, updates: Partial<Row>) => void;
}


export default function RowDetailsPanel({ row, onUpdateRow }: RowDetailsPanelProps) {
  const theme = useTheme();
  const c = theme.custom;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Row>>({});

  useEffect(() => {
    setEditing(false);
    setDraft({});
  }, [row?.id]);

  if (!row) {
    return (
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: c.textDim }}>
        <Typography variant="body2" sx={{ fontSize: "0.78rem", textAlign: "center" }} data-testid="text-no-row-selected">
          Выберите строку в таблице,{"\n"}чтобы увидеть сведения
        </Typography>
      </Box>
    );
  }

  const startEdit = () => {
    setDraft({
      periodicity: row.periodicity || "Разово",
      complexity: row.complexity || "Средняя",
      artifact: row.artifact || "",
      basis: row.basis || "",
      artifactUsage: row.artifactUsage || "",
      purpose: row.purpose || "",
      efficiency: row.efficiency || "Средняя",
      transferTo: row.transferTo || "",
      controlPoint: row.controlPoint || "",
      nextAction: row.nextAction || "",
    });
    setEditing(true);
  };

  const handleSave = () => {
    onUpdateRow(row.id, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft({});
  };

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

  const renderReadField = (label: string, value: string | undefined) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      <Typography variant="caption" sx={{ color: c.textDim, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: value ? c.textBody : c.textDim, fontSize: "0.78rem", fontStyle: value ? "normal" : "italic" }}>
        {value || "Не заполнено"}
      </Typography>
    </Box>
  );

  const renderEditSelect = (label: string, value: string, options: readonly string[], key: string, testId: string, allowEmpty = false) => (
    <FormControl size="small" fullWidth>
      <InputLabel sx={labelSx}>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
        label={label}
        sx={selectSx}
        MenuProps={menuSx}
        data-testid={testId}
      >
        {allowEmpty && (
          <MenuItem value="" sx={{ fontSize: "0.78rem", fontStyle: "italic", color: c.textDim }}>
            — не выбрано —
          </MenuItem>
        )}
        {options.map(o => (
          <MenuItem key={o} value={o} sx={{ fontSize: "0.78rem" }}>{o}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderEditTextField = (label: string, value: string, key: string, testId: string, multiline = false) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
      fullWidth
      size="small"
      multiline={multiline}
      rows={multiline ? 2 : undefined}
      sx={inputSx}
      data-testid={testId}
    />
  );

  const stepLabel = row.step === 1 ? "Шаг 1" : "Шаг 2";
  const stepColor = row.step === 1 ? theme.palette.primary.main : theme.palette.success.main;

  const filledCount = EXTRA_FIELD_LABELS.filter(f => {
    const val = row[f.key];
    return val !== undefined && val !== null && String(val).trim() !== "";
  }).length;

  if (editing) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <Box sx={{ px: 2, pt: 1.5, pb: 1, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="caption" sx={{ color: c.textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
            Редактирование
          </Typography>
          <Button size="small" onClick={handleCancel} startIcon={<Close sx={{ fontSize: 14 }} />}
            sx={{ textTransform: "none", fontSize: "0.7rem", color: c.textSecondary }}
            data-testid="button-cancel-edit"
          >
            Отмена
          </Button>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto", px: 2, pt:2, display: "flex", flexDirection: "column", gap: 1.5, pb: 1 }}>
          {renderEditSelect("Периодичность", (draft.periodicity as string) || "", PERIODICITIES, "periodicity", "edit-periodicity")}
          {renderEditSelect("Сложность", (draft.complexity as string) || "", COMPLEXITIES, "complexity", "edit-complexity")}
          {renderEditTextField("Артефакт", (draft.artifact as string) || "", "artifact", "edit-artifact")}
          {renderEditTextField("Основание", (draft.basis as string) || "", "basis", "edit-basis")}
          {renderEditTextField("Как используется артефакт", (draft.artifactUsage as string) || "", "artifactUsage", "edit-artifact-usage", true)}
          {renderEditTextField("Зачем выполняется", (draft.purpose as string) || "", "purpose", "edit-purpose", true)}
          {renderEditSelect("Эффективность", (draft.efficiency as string) || "", EFFICIENCIES, "efficiency", "edit-efficiency")}
          {/*{renderEditSelect("Кому передать", (draft.transferTo as string) || "", TRANSFER_TO_OPTIONS, "transferTo", "edit-transfer-to", true)}*/}
          {/*{renderEditSelect("Пункт контроля", (draft.controlPoint as string) || "", CONTROL_POINTS, "controlPoint", "edit-control-point", true)}*/}
          {/*{renderEditSelect("Следующее действие", (draft.nextAction as string) || "", NEXT_ACTIONS, "nextAction", "edit-next-action", true)}*/}
        </Box>

        <Box sx={{ px: 2, py: 1.5, flexShrink: 0, borderTop: `1px solid ${c.borderLight}` }}>
          <Button
            variant="contained"
            onClick={handleSave}
            fullWidth
            startIcon={<Save sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none", fontSize: "0.8rem",
              bgcolor: c.saveBtn, "&:hover": { bgcolor: c.saveBtnHover },
            }}
            data-testid="button-save-edit"
          >
            Сохранить изменения
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ px: 2, pt: 1.5, pb: 1, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: stepColor, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: c.textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.63rem" }}>
            {stepLabel} — Паспорт
          </Typography>
          <Chip
            label={`${filledCount}/${EXTRA_FIELD_LABELS.length}`}
            size="small"
            sx={{ height: 18, fontSize: "0.58rem", bgcolor: c.chipSubtle, color: c.textSecondary, "& .MuiChip-label": { px: 0.5 } }}
          />
        </Box>
        <Button
          size="small"
          onClick={startEdit}
          startIcon={<Edit sx={{ fontSize: 14 }} />}
          sx={{ textTransform: "none", fontSize: "0.7rem", color: c.accentBlue, flexShrink: 0 }}
          data-testid="button-edit-details"
        >
          Редактировать
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", px: 2, pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: c.textDim, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Категория
          </Typography>
          <Typography variant="body2" sx={{ color: c.textBody, fontSize: "0.78rem", fontWeight: 500 }}>
            {row.category}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: c.textDim, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Детализация
          </Typography>
          <Typography variant="body2" sx={{ color: c.textBody, fontSize: "0.78rem" }}>
            {row.detailText}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 3, mb: 1.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            <Typography variant="caption" sx={{ color: c.textDim, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Кто делает
            </Typography>
            <Typography variant="body2" sx={{ color: c.textBody, fontSize: "0.78rem", fontFamily: "monospace" }}>
              {row.who}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            <Typography variant="caption" sx={{ color: c.textDim, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Что делать
            </Typography>
            <Typography variant="body2" sx={{ color: c.textBody, fontSize: "0.78rem" }}>
              {row.actionLabel}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: c.borderLight, my: 1.5 }} />

        <Typography variant="caption" sx={{ color: c.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.58rem", mb: 1, display: "block" }}>
          Дополнительные сведения
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {EXTRA_FIELD_LABELS.map(f => renderReadField(f.label, row[f.key] as string | undefined))}
        </Box>
      </Box>
    </Box>
  );
}
