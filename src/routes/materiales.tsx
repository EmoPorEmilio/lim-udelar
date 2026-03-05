import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, createResource, For, Show, Suspense } from 'solid-js'
import { isServer } from 'solid-js/web'
import { Button, Badge, Dialog, DialogTrigger } from '@proyecto-viviana/ui'
import { toastSuccess, toastError } from '@proyecto-viviana/ui/toast'
import { PageShell } from '../components/layouts/PageShell'
import { ContentFooter } from '../components/layouts/ContentFooter'
import { useMobile } from '../hooks/useMobile'
import { useDebounce } from '../hooks/useDebounce'
import { useAuth } from '../auth/context'
import { formatFileSize } from '../utils/format'
import { getLoginUrl } from '../utils/auth'

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024 // 50 MB

interface Material {
  id: string
  title: string
  description: string | null
  subjectCode: string | null
  semester: number | null
  areaCode: string | null
  fileName: string
  fileSize: number
  mimeType: string
  uploadedBy: string
  createdAt: string
}

interface MaterialsResponse {
  materials: Material[]
  page: number
  totalPages: number
  total: number
}

async function fetchMaterials(params: { search?: string; semester?: string; page?: number }): Promise<MaterialsResponse> {
  // SSR guard: browser cookies are not available during server-side rendering,
  // so we skip the fetch and return empty data on the server.
  if (isServer) return { materials: [], page: 1, totalPages: 0, total: 0 }

  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.semester) query.set('semester', params.semester)
  if (params.page && params.page > 1) query.set('page', String(params.page))

  const res = await fetch(`/api/materiales?${query.toString()}`)
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = getLoginUrl('/materiales')
      return { materials: [], page: 1, totalPages: 0, total: 0 }
    }
    throw new Error('Error al cargar materiales')
  }
  return res.json()
}

const areaBadgeVariant: Record<string, 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'> = {
  ING: 'primary',
  ICM: 'accent',
  CI: 'success',
  COMP: 'warning',
}

function QuotaBar(props: { used: number; quota: number }) {
  const pct = () => props.quota > 0 ? Math.min(100, (props.used / props.quota) * 100) : 0
  const color = () => {
    const p = pct()
    if (p >= 90) return 'var(--color-danger, #ef4444)'
    if (p >= 75) return 'var(--color-warning, #f59e0b)'
    return 'var(--color-success, #22c55e)'
  }

  return (
    <div style={{ "margin-bottom": "1.5rem" }}>
      <div style={{
        display: "flex",
        "justify-content": "space-between",
        "font-size": "0.8125rem",
        color: "var(--color-text-secondary)",
        "margin-bottom": "0.375rem",
      }}>
        <span>Almacenamiento</span>
        <span>{formatFileSize(props.used)} / {formatFileSize(props.quota)}</span>
      </div>
      <div style={{
        height: "6px",
        background: "var(--color-border)",
        "border-radius": "3px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct()}%`,
          background: color(),
          transition: "width 0.3s ease",
        }} />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/materiales')({
  component: MaterialesPage,
})

function MaterialesPage() {
  const auth = useAuth()
  const isMobile = useMobile()
  const [search, setSearch] = createSignal('')
  const [semesterFilter, setSemesterFilter] = createSignal('')
  const [page, setPage] = createSignal(1)
  const [uploadOpen, setUploadOpen] = createSignal(false)
  const [uploading, setUploading] = createSignal(false)
  const [quotaUsed, setQuotaUsed] = createSignal(auth.user?.storageBytesUsed ?? 0)
  const [quotaTotal, setQuotaTotal] = createSignal(auth.user?.storageQuotaBytes ?? 0)
  const [deleting, setDeleting] = createSignal<string | null>(null)

  const debouncedSearch = useDebounce(search, 400)

  const fetchParams = () => ({
    search: debouncedSearch(),
    semester: semesterFilter(),
    page: page(),
  })

  // Reset page on filter change
  const handleSearchInput = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  const handleSemesterChange = (value: string) => {
    setSemesterFilter(value)
    setPage(1)
  }

  const [data, { refetch }] = createResource(fetchParams, fetchMaterials)

  const materialsData = () => data()?.materials ?? []
  const totalPages = () => data()?.totalPages ?? 0

  async function refreshQuota() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const { user } = await res.json() as { user: { storageBytesUsed: number; storageQuotaBytes: number } }
        setQuotaUsed(user.storageBytesUsed)
        setQuotaTotal(user.storageQuotaBytes)
      }
    } catch { /* ignore */ }
  }

  async function handleUpload(e: SubmitEvent) {
    e.preventDefault()
    setUploading(true)

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const file = formData.get('file') as File | null
    if (file && file.size > MAX_UPLOAD_SIZE) {
      toastError('El archivo no puede superar 50 MB')
      setUploading(false)
      return
    }

    try {
      const res = await fetch('/api/materiales', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setUploadOpen(false)
        form.reset()
        toastSuccess('Material subido correctamente')
        refetch()
        refreshQuota()
      } else if (res.status === 401) {
        window.location.href = getLoginUrl('/materiales')
      } else {
        let msg = 'Error al subir el material'
        try {
          const data: { error?: string } = await res.json()
          if (data.error) msg = data.error
        } catch { /* non-JSON response */ }
        toastError(msg)
      }
    } finally {
      setUploading(false)
    }
  }

  async function deleteMaterial(id: string) {
    if (!confirm('¿Estás seguro de que querés eliminar este material?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/materiales/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toastSuccess('Material eliminado')
        refetch()
        refreshQuota()
      } else {
        let msg = 'Error al eliminar el material'
        try {
          const data: { error?: string } = await res.json()
          if (data.error) msg = data.error
        } catch { /* non-JSON response */ }
        toastError(msg)
      }
    } catch {
      toastError('Error de conexión')
    } finally {
      setDeleting(null)
    }
  }

  const canDelete = (material: Material) =>
    auth.user && (material.uploadedBy === auth.user.id || auth.user.role === 'admin')

  return (
    <PageShell class="vui-page vui-page--with-header">

      <section class="vui-section">
        <div class="vui-section__container" style={{ padding: isMobile() ? '0 1rem' : '0 1.5rem' }}>
          <div class="vui-section__header">
            <h1 class="vui-section__title">Materiales</h1>
            <p class="vui-section__description">
              Compartí y descargá materiales de estudio organizados por materia y semestre.
            </p>
          </div>

          {/* Quota Bar */}
          <Show when={auth.user}>
            <QuotaBar used={quotaUsed()} quota={quotaTotal()} />
          </Show>

          {/* Filters */}
          <div style={{
            display: "flex",
            gap: "1rem",
            "flex-wrap": "wrap",
            "align-items": "center",
            "margin-bottom": "2rem",
          }}>
            <label style={{ flex: "1", "min-width": "200px" }}>
              <span class="sr-only">Buscar materiales</span>
              <input
                type="text"
                placeholder="Buscar por título..."
                value={search()}
                onInput={(e) => handleSearchInput(e.currentTarget.value)}
                class="vui-input"
                style={{ width: "100%" }}
              />
            </label>
            <label>
              <span class="sr-only">Filtrar por semestre</span>
              <select
                value={semesterFilter()}
                onChange={(e) => handleSemesterChange(e.currentTarget.value)}
                class="vui-input"
              >
                <option value="">Todos los semestres</option>
                <For each={[1, 2, 3, 4, 5, 6, 7, 8]}>
                  {(n) => <option value={String(n)}>Semestre {n}</option>}
                </For>
              </select>
            </label>
            <DialogTrigger
              isOpen={uploadOpen()}
              onOpenChange={setUploadOpen}
              isDismissable
              trigger={<Button variant="accent" onPress={() => setUploadOpen(true)}>Subir Material</Button>}
              content={(close) => (
                <Dialog title="Subir Material" isDismissable onClose={close} size="md">
                  <form onSubmit={handleUpload} style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
                    <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
                      <span class="vui-label">Título *</span>
                      <input name="title" required class="vui-input" />
                    </label>
                    <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
                      <span class="vui-label">Descripción</span>
                      <textarea
                        name="description"
                        rows={3}
                        class="vui-input"
                        style={{ resize: "vertical" }}
                      />
                    </label>
                    <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "1rem" }}>
                      <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
                        <span class="vui-label">Semestre</span>
                        <select name="semester" class="vui-input">
                          <option value="">—</option>
                          <For each={[1, 2, 3, 4, 5, 6, 7, 8]}>
                            {(n) => <option value={String(n)}>Semestre {n}</option>}
                          </For>
                        </select>
                      </label>
                      <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
                        <span class="vui-label">Código materia</span>
                        <input name="subjectCode" placeholder="ING101" class="vui-input" />
                      </label>
                    </div>
                    <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
                      <span class="vui-label">Archivo *</span>
                      <input
                        type="file"
                        name="file"
                        required
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.7z,.rar,.gz,.txt,.csv,.md,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.mp4,.webm"
                        style={{ padding: "0.5rem", color: "var(--color-text-secondary)" }}
                      />
                    </label>
                    <Button type="submit" variant="accent" isDisabled={uploading()}>
                      {uploading() ? 'Subiendo...' : 'Subir'}
                    </Button>
                  </form>
                </Dialog>
              )}
            />
          </div>

          {/* Materials Table */}
          <Suspense fallback={<p style={{ color: "var(--color-text-secondary)" }}>Cargando materiales...</p>}>
            <Show
              when={materialsData().length > 0}
              fallback={
                <div style={{
                  "text-align": "center",
                  padding: "3rem",
                  color: "var(--color-text-muted)",
                }}>
                  <p>No hay materiales disponibles.</p>
                  <p style={{ "font-size": "0.875rem", "margin-top": "0.5rem" }}>
                    Sé el primero en subir un material para tu grupo de estudio.
                  </p>
                </div>
              }
            >
              <div style={{ "overflow-x": "auto" }}>
                <table class="vui-table">
                  <caption class="sr-only">Lista de materiales de estudio</caption>
                  <thead>
                    <tr>
                      <th style={{ "text-align": "left" }}>Título</th>
                      <th style={{ "text-align": "left" }}>Materia</th>
                      <th style={{ "text-align": "center" }}>Semestre</th>
                      <th style={{ "text-align": "right" }}>Tamaño</th>
                      <th style={{ "text-align": "right" }}>Fecha</th>
                      <th style={{ "text-align": "center" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={materialsData()}>
                      {(material, i) => (
                        <tr style={{
                          background: i() % 2 === 0 ? "transparent" : "var(--color-surface-elevated)",
                        }}>
                          <td style={{ color: "var(--color-text)" }}>
                            {material.title}
                          </td>
                          <td>
                            <Show when={material.subjectCode}>
                              <Badge variant={areaBadgeVariant[material.areaCode || ''] || 'primary'}>
                                {material.subjectCode}
                              </Badge>
                            </Show>
                          </td>
                          <td style={{ "text-align": "center", color: "var(--color-text-secondary)" }}>
                            {material.semester || '—'}
                          </td>
                          <td style={{ "text-align": "right", color: "var(--color-text-secondary)" }}>
                            {formatFileSize(material.fileSize)}
                          </td>
                          <td style={{ "text-align": "right", color: "var(--color-text-muted)" }}>
                            {new Date(material.createdAt).toLocaleDateString('es-UY')}
                          </td>
                          <td style={{ "text-align": "center", "white-space": "nowrap" }}>
                            <div style={{ display: "inline-flex", gap: "0.5rem", "justify-content": "center" }}>
                              <a href={`/api/materiales/${material.id}/download`} download={material.fileName}>
                                <Button variant="primary" size="sm" buttonStyle="outline">
                                  Descargar
                                </Button>
                              </a>
                              <Show when={canDelete(material)}>
                                <Button
                                  variant="negative"
                                  size="sm"
                                  buttonStyle="outline"
                                  isDisabled={deleting() === material.id}
                                  onClick={() => deleteMaterial(material.id)}
                                >
                                  {deleting() === material.id ? 'Eliminando...' : 'Eliminar'}
                                </Button>
                              </Show>
                            </div>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Show when={totalPages() > 1}>
                <div style={{
                  display: "flex",
                  "justify-content": "center",
                  "align-items": "center",
                  gap: "0.75rem",
                  "margin-top": "1.5rem",
                }}>
                  <Button
                    variant="primary"
                    size="sm"
                    buttonStyle="outline"
                    isDisabled={page() <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span style={{ color: "var(--color-text-secondary)", "font-size": "0.875rem" }}>
                    Página {page()} de {totalPages()}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    buttonStyle="outline"
                    isDisabled={page() >= totalPages()}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </Show>
            </Show>
          </Suspense>
        </div>
      </section>

      <footer class="vui-footer" style={{ "margin-top": "auto" }}>
        <ContentFooter />
      </footer>
    </PageShell>
  )
}
