import { useState, useMemo } from "react";
import {
  Box, Typography, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, Checkbox, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Chip, InputAdornment, useTheme,
} from "@mui/material";
import { Search, AddLink } from "@mui/icons-material";
import type { Row, Link, LinkKind, Category } from "src/data/types";
import { CATEGORIES, KINDS, KIND_LABELS } from "src/data/constants";

interface LinkPickerProps {
  sourceRow: Row;
  allRows: Row[];
  existingLinks: Link[];
  onCreateLinks: (targets: string[], kind: LinkKind) => void;
}

export default function LinkPicker({ sourceRow, allRows, existingLinks, onCreateLinks }: LinkPickerProps) {
  const theme = useTheme();
  const c = theme.custom;

  const categoryChip: Record<Category, { bg: string; color: string }> = {
    "Методология": c.catMethodologyChip,
    "Фактическое действие": c.catActionChip,
    "Контроль/Аналитика": c.catControlChip,
  };

  const [kind, setKind] = useState<LinkKind>("related");
  const [targetStep, setTargetStep] = useState<1 | 2>(sourceRow.step === 1 ? 2 : 1);
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const existingPairs = useMemo(() => {
    const pairs = new Set<string>();
    existingLinks.forEach(l => {
      pairs.add(`${l.fromId}|${l.toId}|${l.kind}`);
      pairs.add(`${l.toId}|${l.fromId}|${l.kind}`);
    });
    return pairs;
  }, [existingLinks]);

  const candidates = useMemo(() => {
    const searchLower = search.toLowerCase();
    return allRows.filter(r => {
      if (r.id === sourceRow.id) return false;
      if (r.step !== targetStep) return false;
      if (search && !r.detailText.toLowerCase().includes(searchLower)) return false;
      return true;
    });
  }, [allRows, sourceRow.id, targetStep, search]);

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = () => {
    const targets = Array.from(checked).filter(id => {
      const pairKey = `${sourceRow.id}|${id}|${kind}`;
      return !existingPairs.has(pairKey);
    });
    if (targets.length > 0) {
      onCreateLinks(targets, kind);
    }
    setChecked(new Set());
  };

  const newCount = Array.from(checked).filter(id => !existingPairs.has(`${sourceRow.id}|${id}|${kind}`)).length;

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: c.bgInput,
      color: c.textBody,
      fontSize: "0.8rem",
      "& fieldset": { borderColor: c.borderMedium },
      "&:hover fieldset": { borderColor: c.borderHover },
      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
    },
    "& .MuiInputLabel-root": { color: c.textMuted, fontSize: "0.75rem" },
  };

  const selectSx = {
    bgcolor: c.bgInput,
    color: c.textBody,
    fontSize: "0.8rem",
    "& fieldset": { borderColor: c.borderMedium },
    "&:hover fieldset": { borderColor: c.borderHover },
    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
    "& .MuiSelect-icon": { color: c.textMuted },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${c.borderMain}`, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.6rem" }}>
          Источник
        </Typography>
        <Typography variant="body2" sx={{ color: c.textPrimary, mt: 0.5, fontSize: "0.75rem", lineHeight: 1.3 }}>
          {sourceRow.detailText.length > 100 ? sourceRow.detailText.slice(0, 100) + "..." : sourceRow.detailText}
        </Typography>
      </Box>

      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5, flexShrink: 0 }}>
        <FormControl size="small" fullWidth>
          <InputLabel sx={{ color: c.textMuted, fontSize: "0.75rem", "&.Mui-focused": { color: theme.palette.primary.main } }}>Тип связи</InputLabel>
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value as LinkKind)}
            label="Тип связи"
            sx={selectSx}
            MenuProps={{ PaperProps: { sx: { bgcolor: c.bgMenu, color: c.textBody, border: `1px solid ${c.borderMain}`, "& .MuiMenuItem-root": { "&:hover": { bgcolor: c.hoverOverlayStrong }, "&.Mui-selected": { bgcolor: c.selectedBg } } } } }}
            data-testid="select-link-kind"
          >
            {KINDS.map(k => (
              <MenuItem key={k} value={k} sx={{ fontSize: "0.8rem" }}>{KIND_LABELS[k]}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={targetStep === 1 ? "contained" : "outlined"}
            size="small"
            onClick={() => setTargetStep(1)}
            sx={{
              flex: 1, fontSize: "0.7rem", textTransform: "none",
              ...(targetStep === 1
                ? { bgcolor: theme.palette.primary.main, "&:hover": { bgcolor: theme.palette.primary.dark } }
                : { borderColor: c.borderMedium, color: c.textSecondary, "&:hover": { borderColor: c.borderHover } }),
            }}
            data-testid="button-target-step-1"
          >
            Шаг 1
          </Button>
          <Button
            variant={targetStep === 2 ? "contained" : "outlined"}
            size="small"
            onClick={() => setTargetStep(2)}
            sx={{
              flex: 1, fontSize: "0.7rem", textTransform: "none",
              ...(targetStep === 2
                ? { bgcolor: theme.palette.primary.main, "&:hover": { bgcolor: theme.palette.primary.dark } }
                : { borderColor: c.borderMedium, color: c.textSecondary, "&:hover": { borderColor: c.borderHover } }),
            }}
            data-testid="button-target-step-2"
          >
            Шаг 2
          </Button>
        </Box>

        <TextField
          placeholder="Поиск по детализации..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          size="small"
          sx={inputSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 16, color: c.textMuted }} />
              </InputAdornment>
            ),
          }}
          data-testid="input-link-search"
        />
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", px: 0.5 }}>
        <List dense disablePadding>
          {candidates.map(row => {
            const isAlreadyLinked = existingPairs.has(`${sourceRow.id}|${row.id}|${kind}`);
            const isChecked = checked.has(row.id);

            return (
              <ListItem key={row.id} disablePadding sx={{ my: 0.25 }}>
                <ListItemButton
                  onClick={() => !isAlreadyLinked && toggleCheck(row.id)}
                  disabled={isAlreadyLinked}
                  sx={{
                    py: 0.5, px: 1, borderRadius: 1,
                    opacity: isAlreadyLinked ? 0.5 : 1,
                    "&:hover": { bgcolor: c.hoverOverlayStrong },
                  }}
                  data-testid={`target-${row.id}`}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Checkbox
                      checked={isChecked || isAlreadyLinked}
                      disabled={isAlreadyLinked}
                      size="small"
                      sx={{
                        color: c.textDim,
                        "&.Mui-checked": { color: isAlreadyLinked ? c.textDim : theme.palette.primary.main },
                        p: 0.25,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                        <Chip
                          label={row.category.length > 8 ? row.category.slice(0, 8) + "." : row.category}
                          size="small"
                          sx={{
                            fontSize: "0.55rem", height: 16, flexShrink: 0, mt: 0.25,
                            bgcolor: categoryChip[row.category].bg,
                            color: categoryChip[row.category].color,
                            "& .MuiChip-label": { px: 0.5 },
                          }}
                        />
                        <Typography variant="body2" sx={{
                          color: c.textBody, fontSize: "0.7rem", lineHeight: 1.3,
                          overflow: "hidden", textOverflow: "ellipsis",
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        }}>
                          {row.detailText}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                        <Typography variant="caption" sx={{ color: c.textMuted, fontSize: "0.6rem" }}>
                          {row.who}
                        </Typography>
                        {isAlreadyLinked && (
                          <Chip label="Уже связано" size="small" sx={{ fontSize: "0.5rem", height: 14, bgcolor: c.actionOptimize.bg, color: c.actionOptimize.color, "& .MuiChip-label": { px: 0.5 } }} />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
          {candidates.length === 0 && (
            <Box sx={{ p: 2, textAlign: "center", color: c.textMuted }}>
              <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>Нет подходящих элементов</Typography>
            </Box>
          )}
        </List>
      </Box>

      {checked.size > 0 && (
        <Box sx={{ p: 2, borderTop: `1px solid ${c.borderMain}`, flexShrink: 0 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleCreate}
            disabled={newCount === 0}
            startIcon={<AddLink sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none", fontSize: "0.8rem",
              bgcolor: theme.palette.primary.main, "&:hover": { bgcolor: theme.palette.primary.dark },
              "&.Mui-disabled": { bgcolor: c.borderMain, color: c.textDim },
            }}
            data-testid="button-create-links"
          >
            Добавить {newCount} связей
          </Button>
        </Box>
      )}
    </Box>
  );
}
