import { DecimalPipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';

/**
 * Rental calculator input values.
 *
 * Money values = Japanese Yen (¥)
 * *Months values = month multiplier
 * *Rate values = percentage (%)
 */
interface RentalCostInput {
  rent: number;
  managementFee: number;

  depositMonths: number;
  keyMoneyMonths: number;
  brokerageMonths: number;
  guarantorRate: number;

  fireInsurance: number;
  keyExchangeFee: number;
  cleaningFee: number;
  supportFee: number;

  firstRentMonths: number;
  moveInDate: string | null;
}

/**
 * Fully calculated rental cost breakdown.
 */
interface RentalCostResult {
  firstRent: number;
  proratedRent: number;

  deposit: number;
  keyMoney: number;
  brokerageFee: number;
  guarantorFee: number;

  fireInsurance: number;
  keyExchangeFee: number;
  cleaningFee: number;
  supportFee: number;

  totalInitialCost: number;
  monthlyCost: number;
}

interface RentalPreset {
  id: 'cheap' | 'standard' | 'expensive';
  label: string;
  values: Pick<
    RentalCostInput,
    'depositMonths' | 'keyMoneyMonths' | 'brokerageMonths' | 'guarantorRate'
  >;
}

/**
 * Brokerage fee consumption tax (10%).
 *
 * Legal maximum brokerage fee in Japan is 1 month rent
 * + consumption tax (10%), capped at 1.1 months total.
 */
const BROKERAGE_TAX_RATE = 10;

const DEFAULT_INPUT: RentalCostInput = {
  rent: 60000,
  managementFee: 0,

  depositMonths: 1,
  keyMoneyMonths: 1,
  brokerageMonths: 1,
  guarantorRate: 50,

  fireInsurance: 20000,
  keyExchangeFee: 20000,
  cleaningFee: 0,
  supportFee: 0,

  firstRentMonths: 1,
  moveInDate: null,
};

const PRESETS: RentalPreset[] = [
  {
    id: 'cheap',
    label: '安め',
    values: {
      depositMonths: 0,
      keyMoneyMonths: 0,
      brokerageMonths: 0.5,
      guarantorRate: 30,
    },
  },
  {
    id: 'standard',
    label: '標準',
    values: {
      depositMonths: 1,
      keyMoneyMonths: 1,
      brokerageMonths: 1,
      guarantorRate: 50,
    },
  },
  {
    id: 'expensive',
    label: '高め',
    values: {
      depositMonths: 2,
      keyMoneyMonths: 2,
      brokerageMonths: 1,
      guarantorRate: 100,
    },
  },
];

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, TranslocoModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
})
export class CalculatorComponent {
  private readonly fb = new FormBuilder().nonNullable;

  readonly presets = PRESETS;

  /**
   * Main calculator form.
   */
  readonly form = this.fb.group({
    rent: this.fb.control(DEFAULT_INPUT.rent, [
      Validators.required,
      Validators.min(0),
    ]),

    managementFee: this.fb.control(DEFAULT_INPUT.managementFee, [
      Validators.min(0),
    ]),

    depositMonths: this.fb.control(DEFAULT_INPUT.depositMonths, [
      Validators.min(0),
    ]),

    keyMoneyMonths: this.fb.control(DEFAULT_INPUT.keyMoneyMonths, [
      Validators.min(0),
    ]),

    brokerageMonths: this.fb.control(DEFAULT_INPUT.brokerageMonths, [
      Validators.min(0),
      Validators.max(1),
    ]),

    guarantorRate: this.fb.control(DEFAULT_INPUT.guarantorRate, [
      Validators.min(0),
      Validators.max(100),
    ]),

    fireInsurance: this.fb.control(DEFAULT_INPUT.fireInsurance, [
      Validators.min(0),
    ]),

    keyExchangeFee: this.fb.control(DEFAULT_INPUT.keyExchangeFee, [
      Validators.min(0),
    ]),

    cleaningFee: this.fb.control(DEFAULT_INPUT.cleaningFee, [
      Validators.min(0),
    ]),

    supportFee: this.fb.control(DEFAULT_INPUT.supportFee, [Validators.min(0)]),

    firstRentMonths: this.fb.control(DEFAULT_INPUT.firstRentMonths, [
      Validators.required,
      Validators.min(0),
      (control) => (Number.isInteger(control.value) ? null : { integer: true }),
    ]),

    moveInDate: this.fb.control<string | null>(DEFAULT_INPUT.moveInDate, [
      (control) => {
        if (!control.value) {
          return null;
        }

        const date = this.parseDate(control.value);

        if (!date) {
          return { invalidDate: true };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) {
          return { pastDate: true };
        }

        return null;
      },
    ]),
  });

  /**
   * Convert Reactive Form value changes into a Signal.
   */
  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  /**
   * Convert Reactive Form status changes into a Signal.
   *
   * This ensures `result()` re-computes when validation state
   * changes even if the raw value has not changed.
   */
  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  /**
   * Final calculated result.
   *
   * If the form is invalid, no calculation is performed.
   */
  readonly result = computed<RentalCostResult | null>(() => {
    // Explicitly read both signals so Angular tracks them.
    this.formValue();
    this.formStatus();

    if (this.form.invalid) {
      return null;
    }

    return this.calculate(this.form.getRawValue());
  });

  /**
   * Apply one of the predefined presets.
   */
  applyPreset(preset: RentalPreset): void {
    this.form.patchValue(preset.values);
  }

  /**
   * Reset the calculator to default values.
   */
  resetForm(): void {
    this.form.reset(DEFAULT_INPUT);
  }

  // ============================================================
  // CALCULATIONS
  // ============================================================

  /**
   * 敷金
   *
   * 家賃 × 敷金ヶ月
   */
  private calculateDeposit(input: RentalCostInput): number {
    return this.yen(this.safe(input.rent) * this.safe(input.depositMonths));
  }

  /**
   * 礼金
   *
   * 家賃 × 礼金ヶ月
   */
  private calculateKeyMoney(input: RentalCostInput): number {
    return this.yen(this.safe(input.rent) * this.safe(input.keyMoneyMonths));
  }

  /**
   * 仲介手数料
   *
   * 家賃 × 仲介手数料ヶ月 × 1.10
   *
   * Legal maximum = 1 month rent + 10% tax (1.1 months total).
   */
  private calculateBrokerageFee(input: RentalCostInput): number {
    const base = this.safe(input.rent) * this.safe(input.brokerageMonths);

    return this.yen(base * (1 + BROKERAGE_TAX_RATE / 100));
  }

  /**
   * 保証会社利用料
   *
   * 家賃 × 保証料率
   *
   * MVPでは家賃のみを基準にする。
   */
  private calculateGuarantorFee(input: RentalCostInput): number {
    return this.yen(
      (this.safe(input.rent) * this.safe(input.guarantorRate)) / 100,
    );
  }

  /**
   * 前家賃
   *
   * 家賃 × 前家賃ヶ月
   *
   * 入居予定日の有無とは関係なく計算する。
   */
  private calculateFirstRent(input: RentalCostInput): number {
    return this.yen(this.safe(input.rent) * this.safe(input.firstRentMonths));
  }

  /**
   * 日割り家賃
   *
   * 入居予定日がある場合のみ計算。
   *
   * MVP:
   * 家賃のみを日割り計算する。
   */
  private calculateProratedRent(
    rent: number,
    moveInDate: string | null,
  ): number {
    if (!moveInDate) {
      return 0;
    }

    const date = this.parseDate(moveInDate);

    if (!date) {
      return 0;
    }

    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();

    const remainingDays = daysInMonth - date.getDate() + 1;

    const dailyRent = this.safe(rent) / daysInMonth;

    return this.yen(dailyRent * remainingDays);
  }

  /**
   * 月額費用
   *
   * 家賃 + 管理費・共益費
   */
  private calculateMonthlyCost(input: RentalCostInput): number {
    return this.yen(this.safe(input.rent) + this.safe(input.managementFee));
  }

  /**
   * Main calculation.
   */
  private calculate(input: RentalCostInput): RentalCostResult {
    const firstRent = this.calculateFirstRent(input);

    const proratedRent = this.calculateProratedRent(
      input.rent,
      input.moveInDate,
    );

    const deposit = this.calculateDeposit(input);

    const keyMoney = this.calculateKeyMoney(input);

    const brokerageFee = this.calculateBrokerageFee(input);

    const guarantorFee = this.calculateGuarantorFee(input);

    const fireInsurance = this.yen(this.safe(input.fireInsurance));

    const keyExchangeFee = this.yen(this.safe(input.keyExchangeFee));

    const cleaningFee = this.yen(this.safe(input.cleaningFee));

    const supportFee = this.yen(this.safe(input.supportFee));

    /**
     * IMPORTANT:
     *
     * 日割り家賃 and 前家賃 are independent.
     *
     * 入居日がある:
     *   日割り家賃 > 0
     *   前家賃     > 0
     *
     * 入居日がない:
     *   日割り家賃 = 0
     *   前家賃     > 0
     */
    const totalInitialCost = this.yen(
      proratedRent +
        firstRent +
        deposit +
        keyMoney +
        brokerageFee +
        guarantorFee +
        fireInsurance +
        keyExchangeFee +
        cleaningFee +
        supportFee,
    );

    return {
      firstRent,
      proratedRent,

      deposit,
      keyMoney,
      brokerageFee,
      guarantorFee,

      fireInsurance,
      keyExchangeFee,
      cleaningFee,
      supportFee,

      totalInitialCost,

      monthlyCost: this.calculateMonthlyCost(input),
    };
  }

  /**
   * Convert a YYYY-MM-DD string to a local Date.
   *
   * This avoids timezone-related problems caused by:
   * new Date('YYYY-MM-DD')
   */
  private parseDate(value: string): Date | null {
    const parts = value.split('-');

    if (parts.length !== 3) {
      return null;
    }

    const [year, month, day] = parts.map(Number);

    if (!year || !month || !day) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  /**
   * Round money to the nearest yen.
   */
  private yen(value: number): number {
    return Math.round(value);
  }

  /**
   * Protect calculations from invalid numeric values.
   */
  private safe(value: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      return 0;
    }

    return value;
  }
}
