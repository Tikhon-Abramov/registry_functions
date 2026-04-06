import { useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Typography, Tooltip, useTheme,
} from "@mui/material";
import type { Row, ActionLabel } from "src/data/types";
import { ROW_HEIGHT, HEAD_HEIGHT, STEP_TITLE_HEIGHT, CATEGORY_ROW_HEIGHT } from "src/data/constants";

export { ROW_HEIGHT, HEAD_HEIGHT, STEP_TITLE_HEIGHT, CATEGORY_ROW_HEIGHT };

export function useActionChipColors() {
  const theme = useTheme();
  const c = theme.custom;
  return {
    "Оставить": c.actionLeave,
    "Передать": c.actionTransfer,
    "Оптимизировать": c.actionOptimize,
    "Оптимизировать / Передать": c.actionOptTransfer,
    "Убрать": c.actionRemove,
  } as Record<ActionLabel, { bg: string; color: string; border: string }>;
}

export function useCategoryColors() {
  const theme = useTheme();
  const c = theme.custom;
  return {
    "Методология": c.catMethodology,
    "Фактическое действие": c.catAction,
    "Контроль/Аналитика": c.catControl,
  } as Record<string, { bg: string; border: string; text: string }>;
}


interface StepTableProps {
  step: 1 | 2;
  rows: Row[];
  selectedId: string | null;
  linkedIds: Set<string>;
  onRowClick: (id: string) => void;
  rowRefs: React.MutableRefObject<Map<string, HTMLTableRowElement>>;
}

export default function StepTable({ step, rows, selectedId, linkedIds, onRowClick, rowRefs }: StepTableProps) {
  const theme = useTheme();
  const c = theme.custom;
  const actionColors = useActionChipColors();

  const cellBase = {
    py: 0,
    height: ROW_HEIGHT,
    maxHeight: ROW_HEIGHT,
    boxSizing: "border-box" as const,
    borderBottom: `1px solid ${c.borderLight}`,
    verticalAlign: "middle" as const,
  };

  const headCellBase = {
    py: 0,
    height: HEAD_HEIGHT,
    maxHeight: HEAD_HEIGHT,
    boxSizing: "border-box" as const,
    position: "sticky" as const,
    top: STEP_TITLE_HEIGHT,
    zIndex: 3,
    bgcolor: c.bgPaper,
    borderBottom: `1px solid ${c.borderMain}`,
    color: c.textMuted,
    fontSize: "0.65rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    verticalAlign: "middle" as const,
  };

  const setRef = useCallback((id: string) => (el: HTMLTableRowElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  }, [rowRefs]);

  const renderActionChip = (action: ActionLabel) => {
    const ac = actionColors[action];
    return (
      <Chip
        label={action}
        size="small"
        sx={{
          fontSize: "0.68rem",
          height: 22,
          bgcolor: ac.bg,
          color: ac.color,
          border: `1px solid ${ac.border}`,
          fontWeight: 500,
          "& .MuiChip-label": { px: 1 },
        }}
        data-testid={`chip-action-${action}`}
      />
    );
  };

  const renderDataRow = (row: Row) => {
    const isSelected = row.id === selectedId;
    const isLinked = linkedIds.has(row.id);
    const isDimmed = selectedId !== null && !isSelected && !isLinked;

    return (
      <TableRow
        key={row.id}
        ref={setRef(row.id)}
        onClick={() => onRowClick(row.id)}
        selected={isSelected}
        sx={{
          height: ROW_HEIGHT,
          maxHeight: ROW_HEIGHT,
          cursor: "pointer",
          opacity: isDimmed ? 0.3 : 1,
          transition: "all 0.15s",
          bgcolor: isSelected ? c.selectedBg : isLinked ? c.linkedBg : "transparent",
          "&:hover": {
            bgcolor: isSelected ? c.selectedBgHover : isLinked ? c.linkedBg : c.hoverOverlayMed,
          },
          ...(isSelected && {
            outline: `2px solid ${c.selectedOutline}`,
            outlineOffset: -2,
          }),
          ...(isLinked && !isSelected && {
            outline: `1px solid ${c.linkedOutline}`,
            outlineOffset: -1,
          }),
        }}
        data-testid={`row-${row.id}`}
      >
        <TableCell sx={{ ...cellBase, px: 1.5 }}>
          <Tooltip title={row.detailText} placement="top" enterDelay={400}>
            <Typography
              variant="body2"
              sx={{
                color: c.textBody,
                fontSize: "0.78rem",
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.detailText}
            </Typography>
          </Tooltip>
        </TableCell>
        <TableCell sx={{ ...cellBase, width: 80, px: 1 }}>
          <Typography variant="body2" sx={{ color: c.textSecondary, fontSize: "0.72rem", fontFamily: "monospace" }}>
            {row.who}
          </Typography>
        </TableCell>
        <TableCell sx={{ ...cellBase, width: 140, px: 1 }}>
          {renderActionChip(row.actionLabel)}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <TableContainer sx={{ overflow: "visible" }}>
      <Table size="small" sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow sx={{ height: HEAD_HEIGHT, maxHeight: HEAD_HEIGHT }}>
            <TableCell sx={{ ...headCellBase }}>
              Детализация функций
            </TableCell>
            <TableCell sx={{ ...headCellBase, width: 80 }}>
              Кто делает
            </TableCell>
            <TableCell sx={{ ...headCellBase, width: 140 }}>
              Что делать
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => renderDataRow(row))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
