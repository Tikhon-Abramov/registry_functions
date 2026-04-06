import { useMemo, useCallback, useRef, Fragment } from "react";
import {
  Dialog, DialogTitle, DialogContent, Box, Typography,
  IconButton, Tab, Tabs, Snackbar, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, useTheme,
} from "@mui/material";
import { Close, Undo, RestartAlt } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "src/store";
import { selectFunctionById, updateFunctionDetails } from "src/store/functionsRegistrySlice";
import {
  selectModalFunctionId, selectSelectedRowId, selectRightTab, selectSnackbar,
  closeModal, toggleSelectedRow, setSelectedRowId, setRightTab as setRightTabAction,
  showSnackbar, hideSnackbar, selectRowAndOpenLinkPicker,
} from "src/store/uiSlice";
import { generateFunctionDetails } from "src/data/mockData";
import type { Row, Link, LinkKind, Category, ActionLabel, FunctionDetails } from "src/data/types";
import { createRowId, createLinkId } from "src/data/idGenerators";
import { CATEGORIES, ROW_HEIGHT, HEAD_HEIGHT, STEP_TITLE_HEIGHT, CATEGORY_ROW_HEIGHT } from "src/data/constants";
import {
  useActionChipColors, useCategoryColors,
} from "./StepTable";
import LinksPanel from "./LinksPanel";
import RowDetailsPanel from "./RowDetailsPanel";
import AddItemForm from "./AddItemForm";
import LinkPicker from "./LinkPicker";

export default function DetailizationModal() {
  const theme = useTheme();
  const c = theme.custom;
  const actionColors = useActionChipColors();
  const categoryColors = useCategoryColors();
  const fallbackCategoryColor = {
    bg: "transparent",
    border: c.borderMedium,
    text: c.textSecondary,
  };

  const dispatch = useAppDispatch();

  const modalFunctionId = useAppSelector(selectModalFunctionId);
  const functionRecord = useAppSelector(state =>
      modalFunctionId ? selectFunctionById(state, modalFunctionId) : null
  );
  const selectedId = useAppSelector(selectSelectedRowId);
  const rightTab = useAppSelector(selectRightTab);
  const snackbar = useAppSelector(selectSnackbar);

  const open = !!modalFunctionId;

  const normalizedDetails = useMemo<FunctionDetails>(() => {
    return {
      rows: Array.isArray(functionRecord?.details?.rows)
          ? functionRecord.details.rows.map((row) => ({
            id: row?.id ?? "",
            step: Number(row?.step) === 2 ? 2 : 1,
            category: row?.category ?? "",
            detailText: row?.detailText ?? "",
            who: row?.who ?? "",
            actionLabel: row?.actionLabel ?? "",
            periodicity: row?.periodicity ?? "",
            complexity: row?.complexity ?? "",
            artifact: row?.artifact ?? "",
            basis: row?.basis ?? "",
            artifactUsage: row?.artifactUsage ?? "",
            purpose: row?.purpose ?? "",
            efficiency: row?.efficiency ?? "",
            transferTo: row?.transferTo ?? "",
            controlPoint: row?.controlPoint ?? "",
            nextAction: row?.nextAction ?? "",
          })) as Row[]
          : [],
      links: Array.isArray(functionRecord?.details?.links)
          ? functionRecord.details.links.map((link) => ({
            id: link?.id ?? "",
            fromId: link?.fromId ?? "",
            toId: link?.toId ?? "",
            kind: link?.kind ?? "related",
            note: link?.note ?? "",
          })) as Link[]
          : [],
    };
  }, [functionRecord]);

  const updateDetails = useCallback((updater: (prev: FunctionDetails) => FunctionDetails) => {
    if (!functionRecord) return;

    const safeDetails: FunctionDetails = {
      rows: Array.isArray(functionRecord.details?.rows) ? functionRecord.details.rows : [],
      links: Array.isArray(functionRecord.details?.links) ? functionRecord.details.links : [],
    };

    const next = updater(safeDetails);

    dispatch(updateFunctionDetails({
      id: functionRecord.id,
      details: {
        rows: Array.isArray(next?.rows) ? next.rows : [],
        links: Array.isArray(next?.links) ? next.links : [],
      },
    }));
  }, [functionRecord, dispatch]);

  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  const headCellBase = {
    py: 0,
    height: HEAD_HEIGHT,
    maxHeight: HEAD_HEIGHT,
    boxSizing: "border-box" as const,
    bgcolor: c.bgPaper,
    borderBottom: `1px solid ${c.borderMain}`,
    color: c.textMuted,
    fontSize: "0.65rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    verticalAlign: "middle" as const,
  };

  const cellBase = {
    py: 0,
    height: ROW_HEIGHT,
    maxHeight: ROW_HEIGHT,
    boxSizing: "border-box" as const,
    borderBottom: `1px solid ${c.borderLight}`,
    verticalAlign: "middle" as const,
  };

  const rows = normalizedDetails.rows;
  const links = normalizedDetails.links;

  const step1Rows = useMemo(() => rows.filter(r => r?.step === 1), [rows]);
  const step2Rows = useMemo(() => rows.filter(r => r?.step === 2), [rows]);

  const step1Count = step1Rows.length;
  const step2Count = step2Rows.length;

  const step1IndexMap = useMemo(() => {
    const map = new Map<string, number>();
    step1Rows.forEach((row, index) => {
      map.set(row.id, index + 1);
    });
    return map;
  }, [step1Rows]);

  const step2IndexMap = useMemo(() => {
    const map = new Map<string, number>();
    step2Rows.forEach((row, index) => {
      map.set(row.id, index + 1);
    });
    return map;
  }, [step2Rows]);

  const step1ByCategory = useMemo(() => {
    const groups: Record<Category, Row[]> = {
      "Методология": [],
      "Фактическое действие": [],
      "Контроль/Аналитика": [],
    };

    step1Rows.forEach(r => {
      const category = r?.category;
      if (category && category in groups) {
        groups[category as Category].push(r);
      }
    });

    return groups;
  }, [step1Rows]);

  const step2ByCategory = useMemo(() => {
    const groups: Record<Category, Row[]> = {
      "Методология": [],
      "Фактическое действие": [],
      "Контроль/Аналитика": [],
    };

    step2Rows.forEach(r => {
      const category = r?.category;
      if (category && category in groups) {
        groups[category as Category].push(r);
      }
    });

    return groups;
  }, [step2Rows]);

  const rowMap = useMemo(() => {
    const m = new Map<string, Row>();
    rows.forEach(r => {
      if (r?.id) {
        m.set(r.id, r);
      }
    });
    return m;
  }, [rows]);

  const linkedIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const ids = new Set<string>();

    links.forEach(l => {
      if (!l) return;
      if (l.fromId === selectedId && l.toId) ids.add(l.toId);
      if (l.toId === selectedId && l.fromId) ids.add(l.fromId);
    });

    return ids;
  }, [selectedId, links]);

  const selectedLinks = useMemo(() => {
    if (!selectedId) return [];
    return links.filter(l => l?.fromId === selectedId || l?.toId === selectedId);
  }, [selectedId, links]);

  const selectedRow = selectedId ? rowMap.get(selectedId) ?? null : null;

  const linkCountsPerCategory = useMemo(() => {
    const counts: Record<Category, number> = {
      "Методология": 0,
      "Фактическое действие": 0,
      "Контроль/Аналитика": 0,
    };

    const step1Ids = new Set(step1Rows.map(r => r.id).filter(Boolean));

    links.forEach(l => {
      if (!l?.fromId) return;
      const from = rowMap.get(l.fromId);
      if (from && step1Ids.has(from.id) && from.category && from.category in counts) {
        counts[from.category as Category]++;
      }
    });

    return counts;
  }, [step1Rows, links, rowMap]);

  const handleRowClick = useCallback((id: string) => {
    dispatch(toggleSelectedRow(id));
  }, [dispatch]);

  const handleNavigate = useCallback((id: string) => {
    dispatch(setSelectedRowId(id));
    const el = rowRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [dispatch]);

  const handleAddRow = useCallback((item: Partial<Row> & { step: 1 | 2; category: Category; detailText: string; who: string; actionLabel: ActionLabel }): string => {
    const newId = createRowId(item.step);
    const newRow: Row = {
      ...item,
      id: newId,
      periodicity: item.periodicity ?? "",
      complexity: item.complexity ?? "",
      artifact: item.artifact ?? "",
      basis: item.basis ?? "",
      artifactUsage: item.artifactUsage ?? "",
      purpose: item.purpose ?? "",
      efficiency: item.efficiency ?? "",
      transferTo: item.transferTo ?? "",
      controlPoint: item.controlPoint ?? "",
      nextAction: item.nextAction ?? "",
    };

    updateDetails(prev => ({
      rows: [...(prev?.rows ?? []), newRow],
      links: prev?.links ?? [],
    }));

    dispatch(showSnackbar({
      message: "Добавлено",
      undoAction: { type: "add_row", payload: newId },
    }));

    return newId;
  }, [updateDetails, dispatch]);

  const handleUpdateRow = useCallback((id: string, updates: Partial<Row>) => {
    updateDetails(prev => ({
      rows: (prev?.rows ?? []).map(r => r.id === id ? { ...r, ...updates } : r),
      links: prev?.links ?? [],
    }));
    dispatch(showSnackbar({ message: "Сведения обновлены" }));
  }, [updateDetails, dispatch]);

  const handleRemoveRow = useCallback((rowId: string) => {
    const removedRow = rows.find(r => r.id === rowId);
    if (!removedRow) return;

    const removedLinks = links.filter(l => l.fromId === rowId || l.toId === rowId);

    updateDetails(prev => ({
      rows: (prev?.rows ?? []).filter(r => r.id !== rowId),
      links: (prev?.links ?? []).filter(l => l.fromId !== rowId && l.toId !== rowId),
    }));

    if (selectedId === rowId) {
      dispatch(setSelectedRowId(null));
    }

    dispatch(showSnackbar({
      message: "Строка удалена",
      undoAction: {
        type: "remove_row",
        payload: {
          row: removedRow,
          links: removedLinks,
        },
      },
    }));
  }, [rows, links, updateDetails, selectedId, dispatch]);

  const handleRemoveLink = useCallback((linkId: string) => {
    const removedLink = links.find(l => l.id === linkId);
    if (!removedLink) return;

    updateDetails(prev => ({
      rows: prev?.rows ?? [],
      links: (prev?.links ?? []).filter(l => l.id !== linkId),
    }));

    dispatch(showSnackbar({
      message: "Связь удалена",
      undoAction: { type: "remove_link", payload: removedLink },
    }));
  }, [links, updateDetails, dispatch]);

  const handleCreateLinks = useCallback((targets: string[], kind: LinkKind) => {
    if (!selectedId) return;

    const newLinks: Link[] = targets.map(toId => ({
      id: createLinkId(),
      fromId: selectedId,
      toId,
      kind,
    }));

    updateDetails(prev => ({
      rows: prev?.rows ?? [],
      links: [...(prev?.links ?? []), ...newLinks],
    }));

    dispatch(showSnackbar({
      message: `Добавлено ${newLinks.length} связей`,
      undoAction: { type: "add_links", payload: newLinks.map(l => l.id) },
    }));

    dispatch(setRightTabAction(0));
  }, [selectedId, updateDetails, dispatch]);

  const handleUndo = useCallback(() => {
    if (!snackbar.undoAction) return;
    const { type, payload } = snackbar.undoAction;

    if (type === "add_row") {
      updateDetails(prev => ({
        rows: (prev?.rows ?? []).filter(r => r.id !== payload),
        links: (prev?.links ?? []).filter(l => l.fromId !== payload && l.toId !== payload),
      }));
    } else if (type === "remove_link") {
      updateDetails(prev => ({
        rows: prev?.rows ?? [],
        links: [...(prev?.links ?? []), payload as Link],
      }));
    } else if (type === "add_links") {
      const idsToRemove = new Set(payload as string[]);
      updateDetails(prev => ({
        rows: prev?.rows ?? [],
        links: (prev?.links ?? []).filter(l => !idsToRemove.has(l.id)),
      }));
    } else if (type === "add_dual") {
      const { s1Id, s2Id, linkId } = payload as { s1Id: string; s2Id: string; linkId: string };
      updateDetails(prev => ({
        rows: (prev?.rows ?? []).filter(r => r.id !== s1Id && r.id !== s2Id),
        links: (prev?.links ?? []).filter(l => l.id !== linkId),
      }));
    } else if (type === "remove_row") {
      const { row, links: removedLinks } = payload as { row: Row; links: Link[] };

      updateDetails(prev => ({
        rows: [...(prev?.rows ?? []), row],
        links: [...(prev?.links ?? []), ...removedLinks],
      }));
    }

    dispatch(hideSnackbar());
  }, [snackbar.undoAction, updateDetails, dispatch]);

  const handleReset = useCallback(() => {
    if (!functionRecord) return;
    dispatch(updateFunctionDetails({ id: functionRecord.id, details: generateFunctionDetails() }));
    dispatch(setSelectedRowId(null));
    dispatch(setRightTabAction(0));
    dispatch(showSnackbar({ message: "Данные сброшены" }));
  }, [functionRecord, dispatch]);

  const handleQuickLink = useCallback((id: string) => {
    dispatch(selectRowAndOpenLinkPicker(id));
  }, [dispatch]);

  const handleSaveDual = useCallback((
      s1Data: Omit<Partial<Row> & { category: Category; detailText: string; who: string; actionLabel: ActionLabel }, "id" | "step">,
      s2Data: Omit<Partial<Row> & { category: Category; detailText: string; who: string; actionLabel: ActionLabel }, "id" | "step">,
  ) => {
    const s1Id = createRowId(1);
    const s2Id = createRowId(2);
    const linkId = createLinkId();

    const newS1: Row = {
      ...s1Data,
      id: s1Id,
      step: 1,
      periodicity: s1Data.periodicity ?? "",
      complexity: s1Data.complexity ?? "",
      artifact: s1Data.artifact ?? "",
      basis: s1Data.basis ?? "",
      artifactUsage: s1Data.artifactUsage ?? "",
      purpose: s1Data.purpose ?? "",
      efficiency: s1Data.efficiency ?? "",
      transferTo: s1Data.transferTo ?? "",
      controlPoint: s1Data.controlPoint ?? "",
      nextAction: s1Data.nextAction ?? "",
    };

    const newS2: Row = {
      ...s2Data,
      id: s2Id,
      step: 2,
      periodicity: s2Data.periodicity ?? "",
      complexity: s2Data.complexity ?? "",
      artifact: s2Data.artifact ?? "",
      basis: s2Data.basis ?? "",
      artifactUsage: s2Data.artifactUsage ?? "",
      purpose: s2Data.purpose ?? "",
      efficiency: s2Data.efficiency ?? "",
      transferTo: s2Data.transferTo ?? "",
      controlPoint: s2Data.controlPoint ?? "",
      nextAction: s2Data.nextAction ?? "",
    };

    const newLink: Link = { id: linkId, fromId: s1Id, toId: s2Id, kind: "related" };

    updateDetails(prev => ({
      rows: [...(prev?.rows ?? []), newS1, newS2],
      links: [...(prev?.links ?? []), newLink],
    }));

    dispatch(setSelectedRowId(s1Id));
    dispatch(setRightTabAction(0));

    dispatch(showSnackbar({
      message: "Добавлены Шаг 1 + Шаг 2 со связью",
      undoAction: { type: "add_dual", payload: { s1Id, s2Id, linkId } },
    }));
  }, [updateDetails, dispatch]);

  const setRef = useCallback((id: string) => (el: HTMLTableRowElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  }, []);

  const renderActionChip = (action: ActionLabel | "" | undefined) => {
    if (!action || !actionColors[action as ActionLabel]) {
      return (
          <Chip
              label="Не указано"
              size="small"
              sx={{
                fontSize: "0.68rem",
                height: 22,
                fontWeight: 500,
                "& .MuiChip-label": { px: 1 },
              }}
          />
      );
    }

    const ac = actionColors[action as ActionLabel];

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
        />
    );
  };

  const renderDataRow = (row: Row, indexNumber?: number) => {
    const isSelected = row.id === selectedId;
    const isLinked = linkedIds.has(row.id);
    const isDimmed = selectedId !== null && !isSelected && !isLinked;

    return (
        <TableRow
            key={row.id}
            ref={setRef(row.id)}
            onClick={() => handleRowClick(row.id)}
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
          <TableCell sx={{ ...cellBase, width: 56, px: 1 }}>
            <Typography
                variant="body2"
                sx={{
                  color: c.textSecondary,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textAlign: "center",
                }}
            >
              {indexNumber ?? ""}
            </Typography>
          </TableCell>

          <TableCell sx={{ ...cellBase, px: 1.5 }}>
            <Tooltip title={row.detailText || ""} placement="top" enterDelay={400}>
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
                {row.detailText || ""}
              </Typography>
            </Tooltip>
          </TableCell>


          <TableCell sx={{ ...cellBase, width: 80, px: 1 }}>
            <Typography variant="body2" sx={{ color: c.textSecondary, fontSize: "0.72rem", fontFamily: "monospace" }}>
              {row.who || ""}
            </Typography>
          </TableCell>

          <TableCell sx={{ ...cellBase, width: 140, px: 1 }}>
            {renderActionChip(row.actionLabel)}
          </TableCell>
          <TableCell
              sx={{
                ...cellBase,
                width: 32,
                px: 0.25,
                position: "relative",
                verticalAlign: "top",
              }}
          >
            <Tooltip title="Удалить строку">
              <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRow(row.id);
                  }}
                  sx={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    p: 0.25,
                    width: 18,
                    height: 18,
                    minWidth: 18,
                    minHeight: 18,
                    color: c.textMuted,
                    opacity: 0.65,
                    "&:hover": {
                      color: theme.palette.error.main,
                      bgcolor: "transparent",
                      opacity: 1,
                    },
                  }}
                  data-testid={`button-delete-row-${row.id}`}
              >
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
    );
  };

  const renderColumnHeaders = () => (
      <TableHead>
        <TableRow sx={{ height: HEAD_HEIGHT, maxHeight: HEAD_HEIGHT }}>
          <TableCell sx={{ ...headCellBase, width: 56 }}>№</TableCell>
          <TableCell sx={{ ...headCellBase }}>Детализация функций</TableCell>
          <TableCell sx={{ ...headCellBase, width: 80 }}>Кто делает</TableCell>
          <TableCell sx={{ ...headCellBase, width: 140 }}>Что делать</TableCell>
          <TableCell sx={{ ...headCellBase, width: 32, px: 0.25 }} />
        </TableRow>
      </TableHead>
  );

  const renderTableForCategory = (catRows: Row[], step: 1 | 2) => (
      <TableContainer sx={{ overflow: "visible" }}>
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableBody>
            {catRows.map(row =>
                renderDataRow(
                    row,
                    step === 1 ? step1IndexMap.get(row.id) : step2IndexMap.get(row.id)
                )
            )}
          </TableBody>
        </Table>
      </TableContainer>
  );

  if (!open || !functionRecord) return null;

  return (
      <>
        <Dialog
            open={open}
            onClose={() => dispatch(closeModal())}
            fullScreen
            PaperProps={{
              sx: {
                bgcolor: c.bgPaper,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },
            }}
            slotProps={{
              backdrop: { sx: { bgcolor: theme.palette.mode === "dark" ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)" } },
            }}
        >
          <DialogTitle
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                px: 3,
                py: 1.5,
                borderBottom: `1px solid ${c.borderMain}`,
                flexShrink: 0,
              }}
          >
            <Box>
              <Typography variant="h6" sx={{ color: c.textBright, fontWeight: 600, fontSize: "1.1rem" }} data-testid="text-modal-title">
                Детализация
              </Typography>
              <Typography variant="body2" sx={{ color: c.textMuted, fontSize: "0.75rem" }} data-testid="text-modal-subtitle">
                {functionRecord?.name || "Аресты имущества должников"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="caption" sx={{ color: c.textDim, fontSize: "0.7rem" }} data-testid="text-step1-row-count">
                Шаг 1: {step1Count}
              </Typography>
              <Typography variant="caption" sx={{ color: c.textDim, fontSize: "0.7rem" }} data-testid="text-step2-row-count">
                Шаг 2: {step2Count}
              </Typography>
              <Typography variant="caption" sx={{ color: c.textDim, fontSize: "0.7rem" }} data-testid="text-link-count">
                Связей: {links.length}
              </Typography>
              {/*<Button*/}
              {/*    size="small"*/}
              {/*    onClick={handleReset}*/}
              {/*    startIcon={<RestartAlt sx={{ fontSize: 16 }} />}*/}
              {/*    sx={{*/}
              {/*      textTransform: "none",*/}
              {/*      fontSize: "0.72rem",*/}
              {/*      color: c.textSecondary,*/}
              {/*      borderColor: c.borderMedium,*/}
              {/*      "&:hover": { borderColor: c.borderHover, bgcolor: c.hoverOverlayStrong },*/}
              {/*    }}*/}
              {/*    variant="outlined"*/}
              {/*    data-testid="button-reset"*/}
              {/*>*/}
              {/*  Сбросить*/}
              {/*</Button>*/}
              <IconButton onClick={() => dispatch(closeModal())} sx={{ color: c.textSecondary, "&:hover": { color: c.textBright } }} data-testid="button-close-modal">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 0, flex: 1, display: "grid", gridTemplateColumns: "1fr 340px", overflow: "hidden" }}>
            <Box sx={{ overflow: "auto", minWidth: 0 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2px 1fr", gap: 0, minWidth: 0, position: "sticky", top: 0, zIndex: 5 }}>
                <Box sx={{
                  bgcolor: c.bgPaper,
                  px: 2, height: STEP_TITLE_HEIGHT,
                  display: "flex", alignItems: "center", gap: 1,
                  borderBottom: `1px solid ${c.borderMain}`,
                }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: theme.palette.primary.main, flexShrink: 0 }} />
                  <Typography variant="subtitle2" sx={{ color: c.textBody, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }} data-testid="text-step1-title">
                    Шаг 1: Выбор объекта
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: c.borderDivider }} />
                <Box sx={{
                  bgcolor: c.bgPaper,
                  px: 2, height: STEP_TITLE_HEIGHT,
                  display: "flex", alignItems: "center", gap: 1,
                  borderBottom: `1px solid ${c.borderMain}`,
                }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: theme.palette.success.main, flexShrink: 0 }} />
                  <Typography variant="subtitle2" sx={{ color: c.textBody, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }} data-testid="text-step2-title">
                    Шаг 2: Кластеризация / Воздействие
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2px 1fr", gap: 0, minWidth: 0, position: "sticky", top: STEP_TITLE_HEIGHT, zIndex: 4 }}>
                <TableContainer sx={{ overflow: "visible" }}>
                  <Table size="small" sx={{ tableLayout: "fixed" }}>
                    {renderColumnHeaders()}
                  </Table>
                </TableContainer>
                <Box sx={{ bgcolor: c.borderDivider }} />
                <TableContainer sx={{ overflow: "visible" }}>
                  <Table size="small" sx={{ tableLayout: "fixed" }}>
                    {renderColumnHeaders()}
                  </Table>
                </TableContainer>
              </Box>

              {CATEGORIES.map(cat => {
                const s1 = step1ByCategory[cat] ?? [];
                const s2 = step2ByCategory[cat] ?? [];
                if (s1.length === 0 && s2.length === 0) return null;

                const cc = categoryColors?.[cat] ?? fallbackCategoryColor;
                const linkCount = linkCountsPerCategory[cat] ?? 0;

                return (
                    <Fragment key={cat}>
                      <Box
                          sx={{
                            height: CATEGORY_ROW_HEIGHT,
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            gap: 1,
                            bgcolor: cc.bg,
                            borderLeft: `3px solid ${cc.border}`,
                            borderBottom: `1px solid ${c.borderLight}`,
                          }}
                          data-testid={`header-cat-${cat}`}
                      >
                        <Typography sx={{ color: cc.text, fontWeight: 600, fontSize: "0.75rem" }}>
                          {cat}
                        </Typography>
                        <Chip
                            label={`Ш1: ${s1.length}`}
                            size="small"
                            sx={{ fontSize: "0.6rem", height: 18, bgcolor: c.chipSubtle, color: c.textSecondary, "& .MuiChip-label": { px: 0.5 } }}
                        />
                        <Chip
                            label={`Ш2: ${s2.length}`}
                            size="small"
                            sx={{ fontSize: "0.6rem", height: 18, bgcolor: c.chipSubtle, color: c.textSecondary, "& .MuiChip-label": { px: 0.5 } }}
                        />
                        {linkCount > 0 && (
                            <Chip
                                label={`${linkCount} связей`}
                                size="small"
                                sx={{ fontSize: "0.6rem", height: 18, bgcolor: c.linkCountChipBg, color: c.accentBlue, "& .MuiChip-label": { px: 0.5 } }}
                            />
                        )}
                      </Box>

                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2px 1fr", gap: 0, minWidth: 0 }}>
                        <Box sx={{ minWidth: 0 }}>
                          {renderTableForCategory(s1, 1)}
                        </Box>
                        <Box sx={{ bgcolor: c.borderDivider }} />
                        <Box sx={{ minWidth: 0 }}>
                          {renderTableForCategory(s2, 2)}
                        </Box>
                      </Box>
                    </Fragment>
                );
              })}
            </Box>

            <Box
                sx={{
                  borderLeft: `1px solid ${c.borderMain}`,
                  bgcolor: c.bgSurface,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
            >
              <Tabs
                  value={rightTab}
                  onChange={(_, v) => dispatch(setRightTabAction(v))}
                  variant="fullWidth"
                  sx={{
                    minHeight: 36,
                    borderBottom: `1px solid ${c.borderMain}`,
                    flexShrink: 0,
                    "& .MuiTab-root": {
                      minHeight: 36,
                      py: 0.5,
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      color: c.textMuted,
                      textTransform: "none",
                      "&.Mui-selected": { color: c.textPrimary },
                    },
                    "& .MuiTabs-indicator": { bgcolor: theme.palette.primary.main, height: 2 },
                  }}
              >
                <Tab label="Связи" data-testid="tab-links" />
                <Tab label="Сведения" data-testid="tab-details" />
                <Tab label="Добавить" data-testid="tab-add" />
                <Tab label="Связать" disabled={!selectedRow} data-testid="tab-link-picker" />
              </Tabs>

              <Box sx={{ flex: 1, overflow: "hidden" }}>
                {rightTab === 0 && (
                    <LinksPanel
                        selectedRow={selectedRow}
                        allLinks={selectedLinks}
                        rowMap={rowMap}
                        onNavigate={handleNavigate}
                        onRemoveLink={handleRemoveLink}
                    />
                )}
                {rightTab === 1 && (
                    <RowDetailsPanel
                        row={selectedRow}
                        onUpdateRow={handleUpdateRow}
                    />
                )}
                {rightTab === 2 && (
                    <AddItemForm
                        allRows={rows}
                        onSaveSingle={handleAddRow}
                        onSaveDual={handleSaveDual}
                        onQuickLink={handleQuickLink}
                    />
                )}
                {rightTab === 3 && selectedRow && (
                    <LinkPicker
                        sourceRow={selectedRow}
                        allRows={rows}
                        existingLinks={links}
                        onCreateLinks={handleCreateLinks}
                    />
                )}
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={() => dispatch(hideSnackbar())}
            message={snackbar.message}
            action={
              snackbar.undoAction ? (
                  <Button
                      size="small"
                      onClick={handleUndo}
                      startIcon={<Undo sx={{ fontSize: 14 }} />}
                      sx={{ color: c.accentBlue, fontSize: "0.72rem", textTransform: "none" }}
                  >
                    Отменить
                  </Button>
              ) : undefined
            }
            sx={{
              "& .MuiSnackbarContent-root": {
                bgcolor: c.bgSnack,
                color: c.textPrimary,
                border: `1px solid ${c.borderMedium}`,
                fontSize: "0.8rem",
              },
            }}
        />
      </>
  );
}