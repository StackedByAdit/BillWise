import { useId, useState, type ChangeEvent } from 'react'
import { FieldError } from '../components/FieldError'
import { errorInputClass } from '../lib/formFieldHelpers'
import { INDIAN_STATES } from '../lib/constants'
import { isValidOptionalGstin } from '../lib/validation'
import type { Party } from '../types/invoice'

const inputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const labelClassName = 'mb-1.5 block text-sm font-medium text-slate-700'

export interface BuyerDetailsFormProps {
  value: Party
  onChange: (buyer: Party) => void
  validationErrors?: {
    name?: string
    gstin?: string
  }
}

export function BuyerDetailsForm({
  value,
  onChange,
  validationErrors,
}: BuyerDetailsFormProps) {
  const formId = useId()
  const [gstinTouched, setGstinTouched] = useState(false)

  const gstinValue = value.gstin.trim().toUpperCase()
  const gstinError =
    validationErrors?.gstin ??
    (gstinTouched && gstinValue.length > 0 && !isValidOptionalGstin(value.gstin)
      ? 'Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).'
      : undefined)
  const nameError = validationErrors?.name

  function updateField<K extends keyof Party>(field: K, fieldValue: Party[K]) {
    onChange({ ...value, [field]: fieldValue })
  }

  function handleStateChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedCode = event.target.value
    const selectedState = INDIAN_STATES.find((state) => state.code === selectedCode)

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
          <label htmlFor={`${formId}-name`} className={labelClassName}>
            Customer name
          </label>
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
          <label htmlFor={`${formId}-gstin`} className={labelClassName}>
            GSTIN{' '}
            <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id={`${formId}-gstin`}
            type="text"
            value={value.gstin}
            onChange={(event) =>
              updateField('gstin', event.target.value.toUpperCase())
            }
            onBlur={() => setGstinTouched(true)}
            maxLength={15}
            className={`${errorInputClass(Boolean(gstinError), inputClassName)} uppercase tracking-wide`}
            placeholder="22AAAAA0000A1Z5"
            aria-invalid={Boolean(gstinError)}
            aria-describedby={gstinError ? `${formId}-gstin-error` : undefined}
          />
          <FieldError message={gstinError} id={`${formId}-gstin-error`} />
        </div>

        <div>
          <label htmlFor={`${formId}-state`} className={labelClassName}>
            State
          </label>
          <select
            id={`${formId}-state`}
            required
            value={value.stateCode}
            onChange={handleStateChange}
            className={inputClassName}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name} ({state.code})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor={`${formId}-address`} className={labelClassName}>
            Address
          </label>
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
          <label htmlFor={`${formId}-email`} className={labelClassName}>
            Email
          </label>
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
          <label htmlFor={`${formId}-phone`} className={labelClassName}>
            Phone
          </label>
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
