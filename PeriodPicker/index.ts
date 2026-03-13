import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { PeriodPickerComponent } from "./PeriodPicker";

export class PeriodPicker implements ComponentFramework.ReactControl<IInputs, IOutputs> {
  private _notifyOutputChanged: () => void;
  private _dateRange: string;
  private _singleDateInRange: Date | null;
  private _preset: string;

  constructor() {
    this._dateRange = "";
    this._singleDateInRange = null;
    this._preset = "custom";
  }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void
  ): void {
    this._notifyOutputChanged = notifyOutputChanged;
    context.mode.trackContainerResize(true);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
    this._dateRange = context.parameters.DateRange?.raw ?? "";

    const rawSingleDate = context.parameters.SingleDateInRange?.raw;
    this._singleDateInRange =
      rawSingleDate instanceof Date && !isNaN(rawSingleDate.getTime())
        ? rawSingleDate
        : null;

    this._preset = context.parameters.Preset?.raw ?? "custom";

    const isDisabled =
      context.mode.isControlDisabled ||
      context.parameters.DateRange?.security?.readable === false;

    return React.createElement(PeriodPickerComponent, {
      dateRange: this._dateRange,
      singleDateInRange: this._singleDateInRange,
      preset: this._preset,
      onDateRangeChange: this.onDateRangeChange.bind(this),
      onSingleDateInRangeChange: this.onSingleDateInRangeChange.bind(this),
      onPresetChange: this.onPresetChange.bind(this),
      disabled: isDisabled,
    });
  }

  private onDateRangeChange(range: string): void {
    this._dateRange = range;
    this._notifyOutputChanged();
  }

  private onSingleDateInRangeChange(date: Date | null): void {
    this._singleDateInRange = date;
    this._notifyOutputChanged();
  }

  private onPresetChange(preset: string): void {
    this._preset = preset;
    this._notifyOutputChanged();
  }

  public getOutputs(): IOutputs {
    const outputs: IOutputs = {
      DateRange: this._dateRange,
      Preset: this._preset,
    };

    if (this._singleDateInRange) {
      outputs.SingleDateInRange = this._singleDateInRange;
    }

    return outputs;
  }

  public destroy(): void {
    // Cleanup if needed
  }
}
