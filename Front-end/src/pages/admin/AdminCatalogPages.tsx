import { Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/common/Misc'
import { ErrorState, Spinner } from '../../components/common/States'
import { AdminPageTitle } from '../../components/layout/AdminLayout'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { classNames } from '../../lib/format'
import { createCategory, deleteCategory, listCategories, listProducts, updateCategory, updateStock, type CategoryInput } from '../../services/adminService'
import type { Category } from '../../types'

// ======================= DANH MỤC =======================

function CategoryForm({ initial, roots, isRoot, onSubmit, onCancel }: { initial: CategoryInput; roots: Category[]; isRoot: boolean; onSubmit: (c: CategoryInput) => Promise<void>; onCancel: () => void }) {
  const [f, setF] = useState(initial)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!f.name.trim()) return setError('Vui lòng nhập tên danh mục')
    setSaving(true)
    try {
      await onSubmit(f)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div><label className="label">Tên danh mục *</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      {!isRoot && (
        <div>
          <label className="label">Danh mục cha (cấp 1) *</label>
          <select className="input" value={f.parentId ?? ''} onChange={(e) => setF({ ...f, parentId: Number(e.target.value) })}>
            {roots.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      )}
      <div><label className="label">Mô tả</label><textarea className="input" rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-outline" onClick={onCancel}>Hủy</button>
        <button className="btn-primary" disabled={saving}>{saving && <Loader2 className="size-4 animate-spin" />} Lưu</button>
      </div>
    </form>
  )
}

export function AdminCategories() {
  const toast = useToast()
  const { data, loading, error, reload } = useAsync(listCategories, [])
  const [editing, setEditing] = useState<{ cat: Category | null; parentId: number } | null>(null)

  if (loading) return <Spinner />
  if (error || !data) return <ErrorState message={error ?? ''} onRetry={reload} />
  const roots = data.filter((c) => c.parentId === null)

  const remove = async (c: Category) => {
    if (!confirm(`Xóa danh mục "${c.name}"?`)) return
    try {
      await deleteCategory(c.id)
      toast.success('Đã xóa danh mục')
      reload()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <>
      <AdminPageTitle title="Quản lý danh mục" subtitle="Quy tắc LAB 6: đúng 3 danh mục cấp 1, mỗi nhóm tối đa 4 danh mục con, tối đa 2 cấp." />
      <div className="grid gap-4 xl:grid-cols-3">
        {roots.map((root) => {
          const children = data.filter((c) => c.parentId === root.id)
          return (
            <div key={root.id} className="card">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div>
                  <p className="text-xs text-slate-500">Cấp 1 · /{root.slug}</p>
                  <h2 className="font-bold">{root.name}</h2>
                </div>
                <button className="btn-ghost p-2" onClick={() => setEditing({ cat: root, parentId: 0 })} aria-label="Sửa"><Pencil className="size-4" /></button>
              </div>
              <ul className="divide-y divide-slate-100">
                {children.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
                    <span>
                      {c.name}
                      <span className="ml-2 text-xs text-slate-400">{c.productCount} SP</span>
                    </span>
                    <span className="flex">
                      <button className="btn-ghost p-1.5" onClick={() => setEditing({ cat: c, parentId: root.id })} aria-label="Sửa"><Pencil className="size-4" /></button>
                      <button className="btn-ghost p-1.5 text-red-600" onClick={() => remove(c)} aria-label="Xóa"><Trash2 className="size-4" /></button>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="p-3">
                <button className="btn-outline w-full py-2" disabled={children.length >= 4} onClick={() => setEditing({ cat: null, parentId: root.id })}>
                  <Plus className="size-4" /> {children.length >= 4 ? 'Đã đủ 4 danh mục con' : 'Thêm danh mục con'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={editing !== null} title={editing?.cat ? 'Sửa danh mục' : 'Thêm danh mục con'} onClose={() => setEditing(null)}>
        {editing && (
          <CategoryForm
            initial={editing.cat ? { name: editing.cat.name, parentId: editing.cat.parentId, description: editing.cat.description } : { name: '', parentId: editing.parentId, description: '' }}
            roots={roots}
            isRoot={editing.cat?.parentId === null}
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              if (editing.cat) await updateCategory(editing.cat.id, input)
              else await createCategory(input)
              toast.success('Đã lưu danh mục')
              setEditing(null)
              reload()
            }}
          />
        )}
      </Modal>
    </>
  )
}

// ======================= TỒN KHO =======================

export function AdminInventory() {
  const toast = useToast()
  const { data, loading, error, reload } = useAsync(listProducts, [])
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [draft, setDraft] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<number | null>(null)

  if (loading) return <Spinner />
  if (error || !data) return <ErrorState message={error ?? ''} onRetry={reload} />

  const rows = data.filter((p) => (filter === 'low' ? p.stock > 0 && p.stock <= 5 : filter === 'out' ? p.stock === 0 : true))

  const save = async (id: number) => {
    const value = Number(draft[id])
    if (!Number.isInteger(value) || value < 0) return toast.error('Tồn kho phải là số nguyên >= 0')
    setSaving(id)
    try {
      await updateStock(id, value)
      toast.success('Đã cập nhật tồn kho')
      setDraft(({ [id]: _, ...rest }) => rest)
      reload()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(null)
    }
  }

  const tabs = [
    { key: 'all', label: `Tất cả (${data.length})` },
    { key: 'low', label: `Sắp hết (${data.filter((p) => p.stock > 0 && p.stock <= 5).length})` },
    { key: 'out', label: `Hết hàng (${data.filter((p) => p.stock === 0).length})` },
  ] as const

  return (
    <>
      <AdminPageTitle title="Quản lý tồn kho" subtitle="Tồn kho tự động trừ khi khách đặt hàng và hoàn lại khi đơn bị hủy." />
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)} className={classNames('rounded-full px-4 py-1.5 text-sm font-medium', filter === t.key ? 'bg-brand-700 text-white' : 'bg-white text-slate-600')}>{t.label}</button>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface text-left text-xs text-slate-500 uppercase">
            <tr><th className="px-4 py-3">Mã</th><th className="px-4 py-3">Sản phẩm</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Tồn kho</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">
                  <span className={classNames('rounded-full px-2 py-0.5 text-xs font-semibold', p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')}>
                    {p.stock === 0 ? 'Hết hàng' : p.stock <= 5 ? 'Sắp hết' : 'Còn hàng'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <input type="number" min={0} className="input w-24 py-1.5 text-right" value={draft[p.id] ?? p.stock} onChange={(e) => setDraft({ ...draft, [p.id]: e.target.value })} aria-label={`Tồn kho ${p.code}`} />
                    <button className="btn-primary p-2" disabled={draft[p.id] === undefined || Number(draft[p.id]) === p.stock || saving === p.id} onClick={() => save(p.id)} aria-label="Lưu">
                      {saving === p.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
