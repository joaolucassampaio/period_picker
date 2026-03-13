import * as React from "react";
import { MantineProvider, Paper, Stack, Text, Group, Badge } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "dayjs/locale/pt-br";

export interface PeriodPickerProps {
  dateRange: string;
  singleDateInRange: Date | null;
  onDateRangeChange: (range: string) => void;
  onSingleDateInRangeChange: (date: Date | null) => void;
  disabled?: boolean;
}

type DateRangeTuple = [Date | null, Date | null];

function formatDateRange(range: DateRangeTuple): string {
  const [start, end] = range;
  if (!start && !end) return "";
  const startStr = start ? start.toISOString().split("T")[0] : "";
  const endStr = end ? end.toISOString().split("T")[0] : "";
  return `${startStr},${endStr}`;
}

function parseDateRange(value: string): DateRangeTuple {
  if (!value) return [null, null];
  const parts = value.split(",");
  if (parts.length !== 2) return [null, null];
  const start = parts[0] ? new Date(parts[0] + "T00:00:00") : null;
  const end = parts[1] ? new Date(parts[1] + "T00:00:00") : null;
  const isValidStart = start && !isNaN(start.getTime());
  const isValidEnd = end && !isNaN(end.getTime());
  return [isValidStart ? start : null, isValidEnd ? end : null];
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
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const PeriodPickerComponent: React.FC<PeriodPickerProps> = ({
  dateRange,
  singleDateInRange,
  onDateRangeChange,
  onSingleDateInRangeChange,
  disabled = false,
}) => {
  const parsedRange = React.useMemo(
    () => parseDateRange(dateRange),
    [dateRange]
  );

  const handleRangeChange = React.useCallback(
    (value: DateRangeTuple) => {
      const formatted = formatDateRange(value);
      onDateRangeChange(formatted);

      // If single date is no longer in range, clear it
      if (singleDateInRange && !isDateInRange(singleDateInRange, value)) {
        onSingleDateInRangeChange(null);
      }
    },
    [onDateRangeChange, onSingleDateInRangeChange, singleDateInRange]
  );

  const handleSingleDateChange = React.useCallback(
    (value: Date | null) => {
      if (!value) {
        onSingleDateInRangeChange(null);
        return;
      }
      if (!isDateInRange(value, parsedRange)) {
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
      <Paper p="md" radius="md" withBorder style={{ maxWidth: 680, margin: "0 auto" }}>
        <Stack gap="xl">
          {/* Header */}
          <Text fw={600} size="lg" c="blue.7">
            Período
          </Text>

          {/* Date Range Picker */}
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
                const inRange = isDateInRange(date, parsedRange);
                const isSelected =
                  singleDateInRange &&
                  date.toDateString() === singleDateInRange.toDateString();
                return {
                  style: isSelected
                    ? {
                        backgroundColor: "var(--mantine-color-orange-5)",
                        color: "white",
                        borderRadius: "50%",
                      }
                    : inRange
                    ? {}
                    : {},
                };
              }}
            />
          </Stack>

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
                        ? {
                            backgroundColor: "var(--mantine-color-orange-5)",
                            color: "white",
                            borderRadius: "50%",
                          }
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
