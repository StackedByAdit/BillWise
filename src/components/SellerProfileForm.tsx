import { useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { FieldError } from './FieldError'
import { FieldLabel } from './FieldLabel'
import {
  errorInputClass,
  isValidLogoDataUrl,
} from '../lib/formFieldHelpers'
import { INDIAN_STATES } from '../lib/constants'
import { writeSellerProfile } from '../lib/invoiceDraft'
import {
  applyStateFromGstin,
  getGstinValidationError,
  isValidGstin,
} from '../lib/validation'
import type { SellerProfile } from '../types/seller'

const MAX_LOGO_SIZE_BYTES = 500 * 1024

const inputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

export interface SellerProfileFormProps {
  value: SellerProfile
  onChange: (profile: SellerProfile) => void
  submitAttempted?: boolean
  validationErrors?: {
    gstin?: string
    stateCode?: string
  }
}

export function SellerProfileForm({
  value,
  onChange,
  submitAttempted = false,
  validationErrors,
}: SellerProfileFormProps) {
  const formId = useId()
  const [gstinTouched, setGstinTouched] = useState(false)
  const [stateTouched, setStateTouched] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const gstinError =
    (submitAttempted ? validationErrors?.gstin : undefined) ??
    (gstinTouched
      ? getGstinValidationError(value.gstin, {
          required: true,
          stateCode: value.stateCode,
        })
      : undefined)

  const stateError =
    (submitAttempted ? validationErrors?.stateCode : undefined) ??
    (stateTouched && gstinError?.includes('implies')
      ? gstinError
      : undefined)

  const hasLogoPreview = isValidLogoDataUrl(value.logo)

  function updateField<K extends keyof SellerProfile>(
    field: K,
    fieldValue: SellerProfile[K],
  ) {
    setSaveMessage(null)
    onChange({ ...value, [field]: fieldValue })
  }

  function handleGstinChange(event: ChangeEvent<HTMLInputElement>) {
    const nextGstin = event.target.value.toUpperCase()
    let nextProfile: SellerProfile = { ...value, gstin: nextGstin }

    if (nextGstin.length === 15 && isValidGstin(nextGstin)) {
      nextProfile = applyStateFromGstin(nextProfile)
    }

    setSaveMessage(null)
    onChange(nextProfile)
  }

  function handleGstinBlur() {
    setGstinTouched(true)

    if (isValidGstin(value.gstin)) {
      onChange(applyStateFromGstin(value))
    }
  }

  function handleStateChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedCode = event.target.value
    const selectedState = INDIAN_STATES.find((state) => state.code === selectedCode)

    setStateTouched(true)
    setSaveMessage(null)
    onChange({
      ...value,
      stateCode: selectedCode,
      state: selectedState?.name ?? '',
    })
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setLogoError(null)
    setSaveMessage(null)

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setLogoError('Please upload a valid image file.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setLogoError('Logo must be 500KB or smaller.')
      event.target.value = ''
      return
    }

    try {
      const base64 = await readFileAsDataUrl(file)
      updateField('logo', base64)
    } catch {
      setLogoError('Unable to read the selected image.')
    } finally {
      event.target.value = ''
    }
  }

  function handleRemoveLogo() {
    setLogoError(null)
    setSaveMessage(null)
    updateField('logo', undefined)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGstinTouched(true)
    setStateTouched(true)
    setSaveMessage(null)

    if (!isValidGstin(value.gstin)) {
      return
    }

    const profileToSave = applyStateFromGstin({
      ...value,
      gstin: value.gstin.trim().toUpperCase(),
    })

    writeSellerProfile(profileToSave)
    onChange(profileToSave)
    setSaveMessage('Seller profile saved successfully.')
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">Seller Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Save your business details for reuse on every invoice.
        </p>
      </div>

      <form id={formId} onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel htmlFor={`${formId}-name`}>Business name</FieldLabel>
            <input
              id={`${formId}-name`}
              type="text"
              required
              value={value.name}
              onChange={(event) => updateField('name', event.target.value)}
              className={inputClassName}
              placeholder="Acme Traders Pvt. Ltd."
            />
          </div>

          <div>
            <FieldLabel htmlFor={`${formId}-gstin`} required>
              GSTIN
            </FieldLabel>
            <input
              id={`${formId}-gstin`}
              type="text"
              required
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
              State is auto-filled from the first two digits when GSTIN is valid.
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
              placeholder="billing@example.com"
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

          <div className="md:col-span-2">
            <FieldLabel htmlFor={`${formId}-logo`}>
              Logo <span className="font-normal text-slate-500">(optional)</span>
            </FieldLabel>
            <input
              id={`${formId}-logo`}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              PNG, JPG, or SVG up to 500KB. Stored locally as base64.
            </p>
            {logoError ? (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {logoError}
              </p>
            ) : null}
            {hasLogoPreview ? (
              <div className="mt-4 flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <img
                  src={value.logo}
                  alt="Business logo preview"
                  className="h-16 w-16 rounded-md border border-slate-200 bg-white object-contain p-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Logo preview</p>
                  <p className="text-xs text-slate-500">
                    This logo will appear on generated invoices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Save profile
          </button>
          {saveMessage ? (
            <p className="text-sm font-medium text-green-700" role="status">
              {saveMessage}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  )
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Unable to read file.'))
    }

    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file.'))
    reader.readAsDataURL(file)
  })
}
