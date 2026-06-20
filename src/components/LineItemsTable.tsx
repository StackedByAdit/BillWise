import { GST_RATE_SLABS } from '../lib/constants'
import {
  calculateLineItemTaxableAmount,
  createEmptyLineItem,
  formatIndianCurrency,
  parseNumericInput,
} from '../lib/lineItems'
import type { LineItem } from '../types/invoice'

const cellInputClassName =
  'w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const cardInputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const cardLabelClassName = 'mb-1 block text-xs font-medium text-slate-600'

export interface LineItemsTableProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}

export function LineItemsTable({ items, onChange }: LineItemsTableProps) {
  function updateItem(id: string, updates: Partial<LineItem>) {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }

  function addItem() {
    onChange([...items, createEmptyLineItem()])
  }

  function deleteItem(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Line Items</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add products or services. Amounts update as you edit each row.
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

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
          <p className="text-sm text-slate-500">No line items yet.</p>
          <button
            type="button"
            onClick={addItem}
            className="mt-4 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
          >
            Add first row
          </button>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-3 font-semibold">Description</th>
                  <th className="px-2 py-3 font-semibold">HSN/SAC</th>
                  <th className="w-20 px-2 py-3 font-semibold">Qty</th>
                  <th className="w-24 px-2 py-3 font-semibold">Unit</th>
                  <th className="w-28 px-2 py-3 font-semibold">Rate (₹)</th>
                  <th className="w-28 px-2 py-3 font-semibold">Discount (%)</th>
                  <th className="w-28 px-2 py-3 font-semibold">GST Rate (%)</th>
                  <th className="w-32 px-2 py-3 text-right font-semibold">Amount</th>
                  <th className="w-12 px-2 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <LineItemTableRow
                    key={item.id}
                    item={item}
                    onUpdate={(updates) => updateItem(item.id, updates)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {items.map((item, index) => (
              <LineItemCard
                key={item.id}
                item={item}
                index={index}
                onUpdate={(updates) => updateItem(item.id, updates)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

interface LineItemRowProps {
  item: LineItem
  index?: number
  onUpdate: (updates: Partial<LineItem>) => void
  onDelete: () => void
}

function LineItemTableRow({ item, onUpdate, onDelete }: LineItemRowProps) {
  const amount = calculateLineItemTaxableAmount(item)

  return (
    <tr className="border-b border-slate-100 align-top">
      <td className="px-2 py-3">
        <input
          type="text"
          value={item.description}
          onChange={(event) => onUpdate({ description: event.target.value })}
          className={cellInputClassName}
          placeholder="Item description"
          aria-label="Description"
        />
      </td>
      <td className="px-2 py-3">
        <input
          type="text"
          value={item.hsnSac}
          onChange={(event) => onUpdate({ hsnSac: event.target.value })}
          className={cellInputClassName}
          placeholder="998314"
          aria-label="HSN/SAC"
        />
      </td>
      <td className="px-2 py-3">
        <input
          type="number"
          min="0"
          step="any"
          value={item.quantity}
          onChange={(event) =>
            onUpdate({ quantity: parseNumericInput(event.target.value) })
          }
          className={cellInputClassName}
          aria-label="Quantity"
        />
      </td>
      <td className="px-2 py-3">
        <input
          type="text"
          value={item.unit}
          onChange={(event) => onUpdate({ unit: event.target.value })}
          className={cellInputClassName}
          placeholder="nos"
          aria-label="Unit"
        />
      </td>
      <td className="px-2 py-3">
        <input
          type="number"
          min="0"
          step="any"
          value={item.rate}
          onChange={(event) =>
            onUpdate({ rate: parseNumericInput(event.target.value) })
          }
          className={cellInputClassName}
          aria-label="Rate in rupees"
        />
      </td>
      <td className="px-2 py-3">
        <input
          type="number"
          min="0"
          max="100"
          step="any"
          value={item.discountPercent}
          onChange={(event) =>
            onUpdate({ discountPercent: parseNumericInput(event.target.value) })
          }
          className={cellInputClassName}
          aria-label="Discount percentage"
        />
      </td>
      <td className="px-2 py-3">
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
      <td className="px-2 py-3 text-right">
        <span className="block px-2 py-1.5 font-medium tabular-nums text-slate-900">
          {formatIndianCurrency(amount)}
        </span>
      </td>
      <td className="px-2 py-3">
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
          aria-label={`Delete row for ${item.description || 'line item'}`}
        >
          <TrashIcon />
        </button>
      </td>
    </tr>
  )
}

function LineItemCard({ item, index, onUpdate, onDelete }: LineItemRowProps) {
  const amount = calculateLineItemTaxableAmount(item)

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
            placeholder="998314"
          />
        </div>

        <div>
          <label className={cardLabelClassName}>Qty</label>
          <input
            type="number"
            min="0"
            step="any"
            value={item.quantity}
            onChange={(event) =>
              onUpdate({ quantity: parseNumericInput(event.target.value) })
            }
            className={cardInputClassName}
          />
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
          <label className={cardLabelClassName}>Rate (₹)</label>
          <input
            type="number"
            min="0"
            step="any"
            value={item.rate}
            onChange={(event) =>
              onUpdate({ rate: parseNumericInput(event.target.value) })
            }
            className={cardInputClassName}
          />
        </div>

        <div>
          <label className={cardLabelClassName}>Discount (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            value={item.discountPercent}
            onChange={(event) =>
              onUpdate({ discountPercent: parseNumericInput(event.target.value) })
            }
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
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium tabular-nums text-slate-900">
            {formatIndianCurrency(amount)}
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
