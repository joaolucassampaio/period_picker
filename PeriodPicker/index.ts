import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { PeriodPickerComponent } from "./PeriodPicker";

export class PeriodPicker implements ComponentFramework.ReactControl<IInputs, IOutputs> {
  private _notifyOutputChanged: () => void;
  private _dateRange: string;
  private _singleDateInRange: Date | null;

  constructor() {
    this._dateRange = "";
    this._singleDateInRange = null;
  }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void
  ): void {
    this._notifyOutputChanged = notifyOutputChanged;
    context.mode.trackContainerResize(true);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
    const rawDateRange = context.parameters.DateRange?.raw ?? "";
    this._dateRange = rawDateRange ?? "";

    const rawSingleDate = context.parameters.SingleDateInRange?.raw;
    this._singleDateInRange =
      rawSingleDate instanceof Date && !isNaN(rawSingleDate.getTime())
        ? rawSingleDate
        : null;

    const isDisabled =
      context.mode.isControlDisabled ||
      context.parameters.DateRange?.security?.readable === false;

    return React.createElement(PeriodPickerComponent, {
      dateRange: this._dateRange,
      singleDateInRange: this._singleDateInRange,
      onDateRangeChange: this.onDateRangeChange.bind(this),
      onSingleDateInRangeChange: this.onSingleDateInRangeChange.bind(this),
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

  public getOutputs(): IOutputs {
    const outputs: IOutputs = {
      DateRange: this._dateRange,
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
