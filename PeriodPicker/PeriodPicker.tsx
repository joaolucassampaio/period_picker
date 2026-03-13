import * as React from "react";
import { MantineProvider, Paper, Stack, Text, Group, Badge, SegmentedControl } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "dayjs/locale/pt-br";

// ─── Preset definitions ────────────────────────────────────────────────────────

export type PresetValue =
  | "custom"
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear";

interface PresetOption {
  value: PresetValue;
  label: string;
}

const PRESETS: PresetOption[] = [
  { value: "custom",    label: "Personalizado" },
  { value: "today",     label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "last7days", label: "Últimos 7 dias" },
  { value: "last30days",label: "Últimos 30 dias" },
  { value: "thisMonth", label: "Este mês" },
  { value: "lastMonth", label: "Mês passado" },
  { value: "thisYear",  label: "Este ano" },
  { value: "lastYear",  label: "Ano passado" },
];

function calcPresetRange(preset: PresetValue): DateRangeTuple {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = (offset: number): Date => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt;
  };

  switch (preset) {
    case "today":
      return [today, today];
    case "yesterday":
      return [d(-1), d(-1)];
    case "last7days":
      return [d(-6), today];
    case "last30days":
      return [d(-29), today];
    case "thisMonth": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [start, end];
    }
    case "lastMonth": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end   = new Date(today.getFullYear(), today.getMonth(), 0);
      return [start, end];
    }
    case "thisYear": {
      const start = new Date(today.getFullYear(), 0, 1);
      const end   = new Date(today.getFullYear(), 11, 31);
      return [start, end];
    }
    case "lastYear": {
      const start = new Date(today.getFullYear() - 1, 0, 1);
      const end   = new Date(today.getFullYear() - 1, 11, 31);
      return [start, end];
    }
    default:
      return [null, null];
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

type DateRangeTuple = [Date | null, Date | null];

function formatDateRange(range: DateRangeTuple): string {
  const [start, end] = range;
  if (!start && !end) return "";
  const startStr = start ? start.toISOString().split("T")[0] : "";
  const endStr   = end   ? end.toISOString().split("T")[0]   : "";
  return `${startStr},${endStr}`;
}

function parseDateRange(value: string): DateRangeTuple {
  if (!value) return [null, null];
  const parts = value.split(",");
  if (parts.length !== 2) return [null, null];
  const start = parts[0] ? new Date(parts[0] + "T00:00:00") : null;
  const end   = parts[1] ? new Date(parts[1] + "T00:00:00") : null;
  return [
    start && !isNaN(start.getTime()) ? start : null,
    end   && !isNaN(end.getTime())   ? end   : null,
  ];
}

function isDateInRange(date: Date | null, range: DateRangeTuple): boolean {
  if (!date) return false;
  const [start, end] = range;
  if (!start || !end) return false;
  const d = date.getTime();
  return d >= start.getTime() && d <= end.getTime();
}

function formatDisplayDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface PeriodPickerProps {
  dateRange: string;
  singleDateInRange: Date | null;
  preset: string;
  onDateRangeChange: (range: string) => void;
  onSingleDateInRangeChange: (date: Date | null) => void;
  onPresetChange: (preset: string) => void;
  disabled?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const PeriodPickerComponent: React.FC<PeriodPickerProps> = ({
  dateRange,
  singleDateInRange,
  preset,
  onDateRangeChange,
  onSingleDateInRangeChange,
  onPresetChange,
  disabled = false,
}) => {
  const currentPreset = (PRESETS.some((p) => p.value === preset) ? preset : "custom") as PresetValue;

  const parsedRange = React.useMemo(() => parseDateRange(dateRange), [dateRange]);

  const handlePresetChange = React.useCallback(
    (value: string) => {
      const p = value as PresetValue;
      onPresetChange(p);

      if (p !== "custom") {
        const range = calcPresetRange(p);
        onDateRangeChange(formatDateRange(range));
        // clear single date if it falls outside the new range
        if (singleDateInRange && !isDateInRange(singleDateInRange, range)) {
          onSingleDateInRangeChange(null);
        }
      }
    },
    [onPresetChange, onDateRangeChange, onSingleDateInRangeChange, singleDateInRange]
  );

  const handleRangeChange = React.useCallback(
    (value: DateRangeTuple) => {
      // Manual change → switch to custom
      onPresetChange("custom");
      onDateRangeChange(formatDateRange(value));

      if (singleDateInRange && !isDateInRange(singleDateInRange, value)) {
        onSingleDateInRangeChange(null);
      }
    },
    [onPresetChange, onDateRangeChange, onSingleDateInRangeChange, singleDateInRange]
  );

  const handleSingleDateChange = React.useCallback(
    (value: Date | null) => {
      if (!value || !isDateInRange(value, parsedRange)) {
        onSingleDateInRangeChange(null);
        return;
      }
      onSingleDateInRangeChange(value);
    },
    [onSingleDateInRangeChange, parsedRange]
  );

  const [rangeStart, rangeEnd] = parsedRange;
  const isSingleDateValid = isDateInRange(singleDateInRange, parsedRange);

  return (
    <MantineProvider>
      <Paper p="md" radius="md" withBorder style={{ maxWidth: 720, margin: "0 auto" }}>
        <Stack gap="xl">
          {/* Header */}
          <Text fw={600} size="lg" c="blue.7">
            Período
          </Text>

          {/* Preset selector */}
          <Stack gap="xs">
            <Text size="sm" fw={500} c="dimmed">
              Atalho de Período
            </Text>
            <SegmentedControl
              value={currentPreset}
              onChange={handlePresetChange}
              data={PRESETS.map((p) => ({ value: p.value, label: p.label }))}
              disabled={disabled}
              size="xs"
              style={{ flexWrap: "wrap" }}
            />
          </Stack>

          {/* Date Range Picker — shown only when preset is "custom" */}
          {currentPreset === "custom" && (
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                Intervalo de Datas
              </Text>
              <DatePicker
                type="range"
                value={parsedRange}
                onChange={handleRangeChange}
                locale="pt-br"
                numberOfColumns={2}
                style={disabled ? { pointerEvents: "none", opacity: 0.6 } : undefined}
                getDayProps={(date) => {
                  const isSelected =
                    singleDateInRange &&
                    date.toDateString() === singleDateInRange.toDateString();
                  return {
                    style: isSelected
                      ? { backgroundColor: "var(--mantine-color-orange-5)", color: "white", borderRadius: "50%" }
                      : {},
                  };
                }}
              />
            </Stack>
          )}

          {/* Range Summary */}
          {(rangeStart || rangeEnd) && (
            <Group gap="sm">
              <Badge size="md" variant="light" color="blue">
                Início: {formatDisplayDate(rangeStart)}
              </Badge>
              <Text size="sm" c="dimmed">→</Text>
              <Badge size="md" variant="light" color="blue">
                Fim: {formatDisplayDate(rangeEnd)}
              </Badge>
            </Group>
          )}

          {/* Single Date In Range Picker */}
          <Stack gap="xs">
            <Text size="sm" fw={500} c="dimmed">
              Data Pontual no Intervalo
            </Text>
            {!rangeStart || !rangeEnd ? (
              <Text size="sm" c="orange.6" fs="italic">
                Selecione um intervalo de datas primeiro.
              </Text>
            ) : (
              <>
                <DatePicker
                  type="default"
                  value={isSingleDateValid ? singleDateInRange : null}
                  onChange={handleSingleDateChange}
                  locale="pt-br"
                  minDate={rangeStart ?? undefined}
                  maxDate={rangeEnd ?? undefined}
                  style={disabled ? { pointerEvents: "none", opacity: 0.6 } : undefined}
                  getDayProps={(date) => {
                    const isSelected =
                      singleDateInRange &&
                      date.toDateString() === singleDateInRange.toDateString();
                    return {
                      style: isSelected
                        ? { backgroundColor: "var(--mantine-color-orange-5)", color: "white", borderRadius: "50%" }
                        : {},
                    };
                  }}
                />
                {isSingleDateValid && singleDateInRange && (
                  <Badge size="md" variant="light" color="orange">
                    Selecionado: {formatDisplayDate(singleDateInRange)}
                  </Badge>
                )}
              </>
            )}
          </Stack>
        </Stack>
      </Paper>
    </MantineProvider>
  );
};
