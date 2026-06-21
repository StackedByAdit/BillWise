import { useEffect, useState } from 'react'
import { FieldError } from './FieldError'
import { FieldErrorIcon } from './FieldErrorIcon'
import { RequiredMark } from './FieldLabel'
import { errorInputClass } from '../lib/formFieldHelpers'
import { GST_RATE_SLABS } from '../lib/constants'
import {
  clampDiscountPercent,
  createEmptyLineItem,
  formatLineItemAmount,
  formatNumericFieldValue,
  parseNumericInput,
} from '../lib/lineItems'
import type { LineItemValidationErrors } from '../lib/schemas'
import type { LineItem } from '../types/invoice'

const cellInputClassName =
  'w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const numericInputClassName =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

const cardInputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const cardLabelClassName = 'mb-1 block text-xs font-medium text-slate-600'

type LineItemField = 'quantity' | 'rate'

type TouchedLineItemFields = Record<string, Partial<Record<LineItemField, boolean>>>

export interface LineItemsTableProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  submitAttempted?: boolean
  validationErrors?: {
    items?: string
    lineItems?: Record<string, LineItemValidationErrors>
  }
}

export function LineItemsTable({
  items,
  onChange,
  submitAttempted = false,
  validationErrors,
}: LineItemsTableProps) {
  const [touchedFields, setTouchedFields] = useState<TouchedLineItemFields>({})

  useEffect(() => {
    if (items.length === 0) {
      onChange([createEmptyLineItem()])
    }
  }, [items, onChange])

  function markTouched(itemId: string, field: LineItemField) {
    setTouchedFields((current) => ({
      ...current,
      [itemId]: { ...current[itemId], [field]: true },
    }))
  }

  function visibleRowError(
    itemId: string,
    field: LineItemField,
    message?: string,
  ): string | undefined {
    if (!message) {
      return undefined
    }

    if (submitAttempted || touchedFields[itemId]?.[field]) {
      return message
    }

    return undefined
  }

  function updateItem(id: string, updates: Partial<LineItem>) {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }

  function addItem() {
    onChange([...items, createEmptyLineItem()])
  }

  function deleteItem(id: string) {
    if (items.length === 1) {
      setTouchedFields({})
      onChange([createEmptyLineItem()])
      return
    }

    onChange(items.filter((item) => item.id !== id))
  }

  const displayItems = items.length > 0 ? items : [createEmptyLineItem()]

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Line Items</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add products or services. Amounts update once quantity and rate are
            entered.
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Add row
        </button>
      </div>

      <div className="hidden min-w-0 md:block">
        <div className="-mx-2 overflow-x-auto px-2 pb-1">
          <table className="w-full min-w-[680px] table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[11%]" />
              <col className="w-[7%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-1.5 py-2.5 font-semibold">Description</th>
                <th className="px-1.5 py-2.5 font-semibold">HSN/SAC</th>
                <th className="px-1.5 py-2.5 font-semibold">Qty</th>
                <th className="px-1.5 py-2.5 font-semibold">Unit</th>
                <th className="px-1.5 py-2.5 font-semibold">
                  Rate (₹)
                  <RequiredMark />
                </th>
                <th className="px-1.5 py-2.5 font-semibold">Disc. (%)</th>
                <th className="px-1.5 py-2.5 font-semibold">GST (%)</th>
                <th className="px-1.5 py-2.5 text-right font-semibold">Amount</th>
                <th className="px-1.5 py-2.5" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item) => (
                <LineItemTableRow
                  key={item.id}
                  item={item}
                  quantityError={visibleRowError(
                    item.id,
                    'quantity',
                    validationErrors?.lineItems?.[item.id]?.quantity,
                  )}
                  rateError={visibleRowError(
                    item.id,
                    'rate',
                    validationErrors?.lineItems?.[item.id]?.rate,
                  )}
                  onUpdate={(updates) => updateItem(item.id, updates)}
                  onDelete={() => deleteItem(item.id)}
                  onBlurField={(field) => markTouched(item.id, field)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {displayItems.map((item, index) => (
          <LineItemCard
            key={item.id}
            item={item}
            index={index}
            quantityError={visibleRowError(
              item.id,
              'quantity',
              validationErrors?.lineItems?.[item.id]?.quantity,
            )}
            rateError={visibleRowError(
              item.id,
              'rate',
              validationErrors?.lineItems?.[item.id]?.rate,
            )}
            onUpdate={(updates) => updateItem(item.id, updates)}
            onDelete={() => deleteItem(item.id)}
            onBlurField={(field) => markTouched(item.id, field)}
          />
        ))}
      </div>

      {submitAttempted && validationErrors?.items ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <FieldError message={validationErrors.items} />
        </div>
      ) : null}
    </section>
  )
}

interface LineItemRowProps {
  item: LineItem
  index?: number
  quantityError?: string
  rateError?: string
  onUpdate: (updates: Partial<LineItem>) => void
  onDelete: () => void
  onBlurField: (field: LineItemField) => void
}

function LineItemTableRow({
  item,
  quantityError,
  rateError,
  onUpdate,
  onDelete,
  onBlurField,
}: LineItemRowProps) {
  const amountLabel = formatLineItemAmount(item)

  return (
    <tr className="border-b border-slate-100 align-top">
      <td className="px-1.5 py-2.5">
        <input
          type="text"
          value={item.description}
          onChange={(event) => onUpdate({ description: event.target.value })}
          className={cellInputClassName}
          placeholder="Item description"
          aria-label="Description"
        />
      </td>
      <td className="px-1.5 py-2.5">
        <input
          type="text"
          value={item.hsnSac}
          onChange={(event) => onUpdate({ hsnSac: event.target.value })}
          className={cellInputClassName}
          placeholder="998314"
          aria-label="HSN/SAC"
        />
      </td>
      <td className="px-1.5 py-2.5">
        <div className="flex items-center gap-1">
          <NumericField
            value={item.quantity}
            onChange={(quantity) => onUpdate({ quantity })}
            onBlur={() => onBlurField('quantity')}
            min={0}
            step="any"
            className={errorInputClass(Boolean(quantityError), cellInputClassName)}
            aria-label="Quantity"
            aria-invalid={Boolean(quantityError)}
          />
          <FieldErrorIcon message={quantityError} />
        </div>
      </td>
      <td className="px-1.5 py-2.5">
        <input
          type="text"
          value={item.unit}
          onChange={(event) => onUpdate({ unit: event.target.value })}
          className={cellInputClassName}
          placeholder="nos"
          aria-label="Unit"
        />
      </td>
      <td className="px-1.5 py-2.5">
        <div className="flex items-center gap-1">
          <NumericField
            value={item.rate}
            onChange={(rate) => onUpdate({ rate })}
            onBlur={() => onBlurField('rate')}
            emptyWhenZero
            min={0}
            step="any"
            placeholder="0.00"
            className={errorInputClass(Boolean(rateError), cellInputClassName)}
            aria-label="Rate in rupees"
            aria-invalid={Boolean(rateError)}
          />
          <FieldErrorIcon message={rateError} />
        </div>
      </td>
      <td className="px-1.5 py-2.5">
        <NumericField
          value={item.discountPercent}
          onChange={(discountPercent) =>
            onUpdate({
              discountPercent: clampDiscountPercent(discountPercent),
            })
          }
          emptyWhenZero
          min={0}
          max={100}
          step="any"
          className={cellInputClassName}
          aria-label="Discount percentage"
        />
      </td>
      <td className="px-1.5 py-2.5">
        <select
          value={item.taxRatePercent}
          onChange={(event) =>
            onUpdate({ taxRatePercent: parseNumericInput(event.target.value) })
          }
          className={cellInputClassName}
          aria-label="GST rate percentage"
        >
          {GST_RATE_SLABS.map((rate) => (
            <option key={rate} value={rate}>
              {rate}%
            </option>
          ))}
        </select>
      </td>
      <td className="px-1.5 py-2.5 text-right">
        <span
          className={`block truncate px-1 py-1.5 text-sm font-medium tabular-nums ${
            amountLabel === '—' ? 'text-slate-400' : 'text-slate-900'
          }`}
        >
          {amountLabel}
        </span>
      </td>
      <td className="px-1.5 py-2.5 text-center">
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
          aria-label={`Delete row for ${item.description || 'line item'}`}
        >
          <TrashIcon />
        </button>
      </td>
    </tr>
  )
}

function LineItemCard({
  item,
  index,
  quantityError,
  rateError,
  onUpdate,
  onDelete,
  onBlurField,
}: LineItemRowProps) {
  const amountLabel = formatLineItemAmount(item)

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Item {index !== undefined ? index + 1 : ''}
        </h3>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
        >
          Delete
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={cardLabelClassName}>Description</label>
          <input
            type="text"
            value={item.description}
            onChange={(event) => onUpdate({ description: event.target.value })}
            className={cardInputClassName}
            placeholder="Item description"
          />
        </div>

        <div>
          <label className={cardLabelClassName}>HSN/SAC</label>
          <input
            type="text"
            value={item.hsnSac}
            onChange={(event) => onUpdate({ hsnSac: event.target.value })}
            className={cardInputClassName}
            placeholder="e.g. 998314"
          />
        </div>

        <div>
          <label className={cardLabelClassName}>Qty</label>
          <NumericField
            value={item.quantity}
            onChange={(quantity) => onUpdate({ quantity })}
            onBlur={() => onBlurField('quantity')}
            min={0}
            step="any"
            className={errorInputClass(Boolean(quantityError), cardInputClassName)}
            aria-invalid={Boolean(quantityError)}
          />
          <FieldError message={quantityError} />
        </div>

        <div>
          <label className={cardLabelClassName}>Unit</label>
          <input
            type="text"
            value={item.unit}
            onChange={(event) => onUpdate({ unit: event.target.value })}
            className={cardInputClassName}
            placeholder="nos"
          />
        </div>

        <div>
          <label className={cardLabelClassName}>
            Rate (₹)
            <RequiredMark />
          </label>
          <NumericField
            value={item.rate}
            onChange={(rate) => onUpdate({ rate })}
            onBlur={() => onBlurField('rate')}
            emptyWhenZero
            min={0}
            step="any"
            placeholder="0.00"
            className={errorInputClass(Boolean(rateError), cardInputClassName)}
            aria-invalid={Boolean(rateError)}
          />
          <FieldError message={rateError} />
        </div>

        <div>
          <label className={cardLabelClassName}>Discount (%)</label>
          <NumericField
            value={item.discountPercent}
            onChange={(discountPercent) =>
              onUpdate({
                discountPercent: clampDiscountPercent(discountPercent),
              })
            }
            emptyWhenZero
            min={0}
            max={100}
            step="any"
            className={cardInputClassName}
          />
        </div>

        <div>
          <label className={cardLabelClassName}>GST Rate (%)</label>
          <select
            value={item.taxRatePercent}
            onChange={(event) =>
              onUpdate({ taxRatePercent: parseNumericInput(event.target.value) })
            }
            className={cardInputClassName}
          >
            {GST_RATE_SLABS.map((rate) => (
              <option key={rate} value={rate}>
                {rate}%
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={cardLabelClassName}>Amount</label>
          <div
            className={`rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium tabular-nums ${
              amountLabel === '—' ? 'text-slate-400' : 'text-slate-900'
            }`}
          >
            {amountLabel}
          </div>
        </div>
      </div>
    </article>
  )
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75a1.25 1.25 0 0 0-1.25-1.25h-2.5A1.25 1.25 0 0 0 7.5 3.75v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

interface NumericFieldProps {
  value: number
  onChange: (value: number) => void
  onBlur?: () => void
  emptyWhenZero?: boolean
  className?: string
  min?: number
  max?: number
  step?: string
  placeholder?: string
  'aria-label'?: string
  'aria-invalid'?: boolean
}

function NumericField({
  value,
  onChange,
  onBlur,
  emptyWhenZero = false,
  className,
  min,
  max,
  step,
  placeholder,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
}: NumericFieldProps) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step={step}
      value={formatNumericFieldValue(value, emptyWhenZero)}
      placeholder={placeholder}
      onChange={(event) => {
        const rawValue = event.target.value

        if (rawValue === '') {
          onChange(0)
          return
        }

        onChange(parseNumericInput(rawValue))
      }}
      onFocus={(event) => {
        if (emptyWhenZero && value === 0) {
          return
        }

        event.currentTarget.select()
      }}
      onBlur={onBlur}
      className={`${numericInputClassName} ${className ?? ''}`}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid}
    />
  )
}
