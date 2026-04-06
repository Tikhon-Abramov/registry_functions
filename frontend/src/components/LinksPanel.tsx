import {
  Box, Typography, List, ListItemButton, ListItemText,
  IconButton, Chip, useTheme,
} from "@mui/material";
import { Delete, LinkOff } from "@mui/icons-material";
import type { Row, Link, Category } from "src/data/types";
import { CATEGORIES } from "src/data/constants";
import { useCategoryColors } from "./StepTable";

interface LinksPanelProps {
  selectedRow: Row | null;
  allLinks: Link[];
  rowMap: Map<string, Row>;
  onNavigate: (id: string) => void;
  onRemoveLink: (linkId: string) => void;
}

export default function LinksPanel({ selectedRow, allLinks, rowMap, onNavigate, onRemoveLink }: LinksPanelProps) {
  const theme = useTheme();
  const c = theme.custom;
  const categoryColors = useCategoryColors();

  if (!selectedRow) {
    return (
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: c.textMuted }}>
        <LinkOff sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
        <Typography variant="body2" sx={{ textAlign: "center" }}>
          Выберите элемент в таблице для просмотра связей
        </Typography>
      </Box>
    );
  }

  const linkedItems: { linkId: string; targetRow: Row }[] = [];
  allLinks.forEach(link => {
    const targetId = link.fromId === selectedRow.id ? link.toId : link.fromId;
    const target = rowMap.get(targetId);
    if (target) {
      linkedItems.push({ linkId: link.id, targetRow: target });
    }
  });

  const byCategory: Record<Category, { linkId: string; targetRow: Row }[]> = {
    "Методология": [],
    "Фактическое действие": [],
    "Контроль/Аналитика": [],
  };
  linkedItems.forEach(item => {
    byCategory[item.targetRow.category].push(item);
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${c.borderMain}`, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.6rem" }}>
          Выбрано (Шаг {selectedRow.step})
        </Typography>
        <Typography variant="body2" sx={{ color: c.textPrimary, mt: 0.5, fontSize: "0.8rem", lineHeight: 1.4 }} data-testid="text-selected-detail">
          {selectedRow.detailText}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", px: 0.5 }}>
        {linkedItems.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", color: c.textMuted }}>
            <Typography variant="body2" data-testid="text-no-links">Связей нет</Typography>
          </Box>
        ) : (
          CATEGORIES.map(cat => {
            const items = byCategory[cat];
            if (items.length === 0) return null;
            const cc = categoryColors[cat];

            return (
              <Box key={cat} sx={{ mt: 1 }}>
                <Box sx={{ px: 1.5, display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                  <Box sx={{ width: 4, height: 14, borderRadius: 1, bgcolor: cc.border, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: cc.text, fontSize: "0.65rem", fontWeight: 600 }} data-testid={`links-cat-${cat}`}>
                    {cat} ({items.length})
                  </Typography>
                </Box>
                <List dense disablePadding>
                  {items.map(({ linkId, targetRow }) => (
                    <ListItemButton
                      key={linkId}
                      onClick={() => onNavigate(targetRow.id)}
                      sx={{
                        py: 0.5, px: 1.5, borderRadius: 1, mx: 0.5, my: 0.25,
                        "&:hover": { bgcolor: c.hoverOverlayStrong },
                      }}
                      data-testid={`link-item-${linkId}`}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Chip
                              label="Связь"
                              size="small"
                              sx={{
                                fontSize: "0.58rem", height: 18,
                                bgcolor: c.linkBadgeBg,
                                color: c.linkBadgeColor,
                                border: `1px solid ${c.linkBadgeBorder}`,
                                "& .MuiChip-label": { px: 0.5 },
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" sx={{
                              color: c.textBody, fontSize: "0.72rem", lineHeight: 1.3,
                              overflow: "hidden", textOverflow: "ellipsis",
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                            }}>
                              {targetRow.detailText}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: c.textMuted, fontSize: "0.6rem" }}>
                            Шаг {targetRow.step} · {targetRow.who} · {targetRow.actionLabel}
                          </Typography>
                        }
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onRemoveLink(linkId); }}
                        sx={{ color: c.textMuted, "&:hover": { color: theme.custom.dangerHover }, ml: 0.5, flexShrink: 0 }}
                        data-testid={`button-remove-link-${linkId}`}
                      >
                        <Delete sx={{ fontSize: 14 }} />
                      </IconButton>
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
