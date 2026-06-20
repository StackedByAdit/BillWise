import { useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { INDIAN_STATES } from '../lib/constants'
import { isValidGstin } from '../lib/validation'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  EMPTY_SELLER_PROFILE,
  type SellerProfile,
} from '../types/seller'

const SELLER_PROFILE_KEY = 'gst-invoice:seller-profile'
const MAX_LOGO_SIZE_BYTES = 500 * 1024

const inputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const labelClassName = 'mb-1.5 block text-sm font-medium text-slate-700'

export function SellerProfileForm() {
  const formId = useId()
  const [savedProfile, setSavedProfile] = useLocalStorage<SellerProfile>(
    SELLER_PROFILE_KEY,
    EMPTY_SELLER_PROFILE,
  )
  const [formData, setFormData] = useState<SellerProfile>(() => savedProfile)
  const [gstinTouched, setGstinTouched] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const gstinValue = formData.gstin.trim().toUpperCase()
  const showGstinError =
    gstinTouched && gstinValue.length > 0 && !isValidGstin(gstinValue)

  function updateField<K extends keyof SellerProfile>(
    field: K,
    value: SellerProfile[K],
  ) {
    setSaveMessage(null)
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleStateChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedCode = event.target.value
    const selectedState = INDIAN_STATES.find((state) => state.code === selectedCode)

    setSaveMessage(null)
    setFormData((prev) => ({
      ...prev,
      stateCode: selectedCode,
      state: selectedState?.name ?? '',
    }))
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

    if (!isValidGstin(formData.gstin)) {
      return
    }

    const profileToSave: SellerProfile = {
      ...formData,
      gstin: formData.gstin.trim().toUpperCase(),
    }

    setSavedProfile(profileToSave)
    setFormData(profileToSave)
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
              value={formData.name}
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
              value={formData.gstin}
              onChange={(event) =>
                updateField('gstin', event.target.value.toUpperCase())
              }
              onBlur={() => setGstinTouched(true)}
              maxLength={15}
              className={`${inputClassName} uppercase tracking-wide ${
                showGstinError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
              placeholder="22AAAAA0000A1Z5"
              aria-invalid={showGstinError}
              aria-describedby={showGstinError ? `${formId}-gstin-error` : undefined}
            />
            {showGstinError ? (
              <p
                id={`${formId}-gstin-error`}
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor={`${formId}-state`} className={labelClassName}>
              State
            </label>
            <select
              id={`${formId}-state`}
              required
              value={formData.stateCode}
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
              value={formData.address}
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
              value={formData.email}
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
              value={formData.phone}
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
            {formData.logo ? (
              <div className="mt-4 flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <img
                  src={formData.logo}
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
