import { useId, useState, type ChangeEvent } from 'react'
import { FieldError } from '../components/FieldError'
import { FieldLabel } from '../components/FieldLabel'
import { errorInputClass } from '../lib/formFieldHelpers'
import { INDIAN_STATES } from '../lib/constants'
import {
  applyStateFromGstin,
  getGstinValidationError,
  isValidGstin,
  isValidOptionalGstin,
} from '../lib/validation'
import type { Party } from '../types/invoice'

const inputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

export interface BuyerDetailsFormProps {
  value: Party
  onChange: (buyer: Party) => void
  submitAttempted?: boolean
  validationErrors?: {
    name?: string
    gstin?: string
    stateCode?: string
  }
}

export function BuyerDetailsForm({
  value,
  onChange,
  submitAttempted = false,
  validationErrors,
}: BuyerDetailsFormProps) {
  const formId = useId()
  const [gstinTouched, setGstinTouched] = useState(false)
  const [stateTouched, setStateTouched] = useState(false)

  const gstinError =
    (submitAttempted ? validationErrors?.gstin : undefined) ??
    (gstinTouched && value.gstin.trim().length > 0
      ? getGstinValidationError(value.gstin, {
          stateCode: value.stateCode,
        })
      : undefined)

  const stateError =
    (submitAttempted ? validationErrors?.stateCode : undefined) ??
    (stateTouched && gstinError?.includes('implies') ? gstinError : undefined)

  const nameError = submitAttempted ? validationErrors?.name : undefined

  function updateField<K extends keyof Party>(field: K, fieldValue: Party[K]) {
    onChange({ ...value, [field]: fieldValue })
  }

  function handleGstinChange(event: ChangeEvent<HTMLInputElement>) {
    const nextGstin = event.target.value.toUpperCase()
    let nextBuyer: Party = { ...value, gstin: nextGstin }

    if (nextGstin.length === 15 && isValidOptionalGstin(nextGstin)) {
      nextBuyer = applyStateFromGstin(nextBuyer)
    }

    onChange(nextBuyer)
  }

  function handleGstinBlur() {
    setGstinTouched(true)

    if (value.gstin.trim() && isValidGstin(value.gstin)) {
      onChange(applyStateFromGstin(value))
    }
  }

  function handleStateChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedCode = event.target.value
    const selectedState = INDIAN_STATES.find((state) => state.code === selectedCode)

    setStateTouched(true)
    onChange({
      ...value,
      stateCode: selectedCode,
      state: selectedState?.name ?? '',
    })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">Buyer Details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter the customer details for this invoice.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel htmlFor={`${formId}-name`} required>
            Customer name
          </FieldLabel>
          <input
            id={`${formId}-name`}
            type="text"
            required
            value={value.name}
            onChange={(event) => updateField('name', event.target.value)}
            className={errorInputClass(Boolean(nameError), inputClassName)}
            placeholder="Customer or company name"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? `${formId}-name-error` : undefined}
          />
          <FieldError message={nameError} id={`${formId}-name-error`} />
        </div>

        <div>
          <FieldLabel htmlFor={`${formId}-gstin`}>
            GSTIN{' '}
            <span className="font-normal text-slate-500">(optional)</span>
          </FieldLabel>
          <input
            id={`${formId}-gstin`}
            type="text"
            value={value.gstin}
            onChange={handleGstinChange}
            onBlur={handleGstinBlur}
            maxLength={15}
            className={`${errorInputClass(Boolean(gstinError), inputClassName)} uppercase tracking-wide`}
            placeholder="22AAAAA0000A1ZC"
            aria-invalid={Boolean(gstinError)}
            aria-describedby={gstinError ? `${formId}-gstin-error` : undefined}
          />
          <FieldError message={gstinError} id={`${formId}-gstin-error`} />
          <p className="mt-1.5 text-xs text-slate-500">
            State is auto-filled from GSTIN when provided.
          </p>
        </div>

        <div>
          <FieldLabel htmlFor={`${formId}-state`} required>
            State
          </FieldLabel>
          <select
            id={`${formId}-state`}
            required
            value={value.stateCode}
            onChange={handleStateChange}
            onBlur={() => setStateTouched(true)}
            className={errorInputClass(Boolean(stateError), inputClassName)}
            aria-invalid={Boolean(stateError)}
            aria-describedby={stateError ? `${formId}-state-error` : undefined}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name} ({state.code})
              </option>
            ))}
          </select>
          <FieldError message={stateError} id={`${formId}-state-error`} />
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor={`${formId}-address`}>Address</FieldLabel>
          <textarea
            id={`${formId}-address`}
            required
            rows={3}
            value={value.address}
            onChange={(event) => updateField('address', event.target.value)}
            className={`${inputClassName} resize-y`}
            placeholder="Street, city, PIN code"
          />
        </div>

        <div>
          <FieldLabel htmlFor={`${formId}-email`}>Email</FieldLabel>
          <input
            id={`${formId}-email`}
            type="email"
            required
            value={value.email}
            onChange={(event) => updateField('email', event.target.value)}
            className={inputClassName}
            placeholder="customer@example.com"
          />
        </div>

        <div>
          <FieldLabel htmlFor={`${formId}-phone`}>Phone</FieldLabel>
          <input
            id={`${formId}-phone`}
            type="tel"
            required
            value={value.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            className={inputClassName}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>
    </section>
  )
}
