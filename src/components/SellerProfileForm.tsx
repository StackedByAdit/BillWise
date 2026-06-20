import { useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { FieldError } from './FieldError'
import { errorInputClass } from '../lib/formFieldHelpers'
import { INDIAN_STATES } from '../lib/constants'
import { writeSellerProfile } from '../lib/invoiceDraft'
import { isValidGstin } from '../lib/validation'
import type { SellerProfile } from '../types/seller'

const MAX_LOGO_SIZE_BYTES = 500 * 1024

const inputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const labelClassName = 'mb-1.5 block text-sm font-medium text-slate-700'

export interface SellerProfileFormProps {
  value: SellerProfile
  onChange: (profile: SellerProfile) => void
  validationErrors?: {
    gstin?: string
  }
}

export function SellerProfileForm({
  value,
  onChange,
  validationErrors,
}: SellerProfileFormProps) {
  const formId = useId()
  const [gstinTouched, setGstinTouched] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const gstinValue = value.gstin.trim().toUpperCase()
  const gstinError =
    validationErrors?.gstin ??
    (gstinTouched && gstinValue.length > 0 && !isValidGstin(gstinValue)
      ? 'Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).'
      : undefined)

  function updateField<K extends keyof SellerProfile>(
    field: K,
    fieldValue: SellerProfile[K],
  ) {
    setSaveMessage(null)
    onChange({ ...value, [field]: fieldValue })
  }

  function handleStateChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedCode = event.target.value
    const selectedState = INDIAN_STATES.find((state) => state.code === selectedCode)

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

    const base64 = await readFileAsDataUrl(file)
    updateField('logo', base64)
    event.target.value = ''
  }

  function handleRemoveLogo() {
    setLogoError(null)
    setSaveMessage(null)
    updateField('logo', undefined)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGstinTouched(true)
    setSaveMessage(null)

    if (!isValidGstin(value.gstin)) {
      return
    }

    const profileToSave: SellerProfile = {
      ...value,
      gstin: value.gstin.trim().toUpperCase(),
    }

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
            <label htmlFor={`${formId}-name`} className={labelClassName}>
              Business name
            </label>
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
            <label htmlFor={`${formId}-gstin`} className={labelClassName}>
              GSTIN
            </label>
            <input
              id={`${formId}-gstin`}
              type="text"
              required
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
              placeholder="billing@example.com"
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

          <div className="md:col-span-2">
            <label htmlFor={`${formId}-logo`} className={labelClassName}>
              Logo <span className="font-normal text-slate-500">(optional)</span>
            </label>
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
            {value.logo ? (
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
