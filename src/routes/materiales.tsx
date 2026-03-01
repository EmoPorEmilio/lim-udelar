import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, createResource, For, Show, Suspense } from 'solid-js'
import { isServer } from 'solid-js/web'
import { Button, Badge, Dialog, DialogTrigger } from '@proyecto-viviana/ui'
import { PageShell } from '../components/layouts/PageShell'

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
  createdAt: string
}

async function fetchMaterials(params: { search?: string; semester?: string }): Promise<Material[]> {
  if (isServer) return []

  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.semester) query.set('semester', params.semester)

  const res = await fetch(`/api/materiales?${query.toString()}`)
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = '/api/auth/google'
      return []
    }
    throw new Error('Error al cargar materiales')
  }
  const data = await res.json()
  return data.materials
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const areaBadgeVariant: Record<string, string> = {
  ING: 'primary',
  ICM: 'accent',
  CI: 'success',
  COMP: 'warning',
}

/* Shared input style */
const inputStyle = {
  padding: "0.5rem 1rem",
  background: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  "font-family": "var(--font-body)",
  "clip-path": "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
} as const

const labelStyle = {
  color: "var(--color-text-secondary)",
  "font-size": "0.875rem",
  "font-family": "var(--font-title)",
} as const

export const Route = createFileRoute('/materiales')({
  component: MaterialesPage,
})

function MaterialesPage() {
  const [search, setSearch] = createSignal('')
  const [semesterFilter, setSemesterFilter] = createSignal('')
  const [uploadOpen, setUploadOpen] = createSignal(false)
  const [uploading, setUploading] = createSignal(false)

  const fetchParams = () => ({
    search: search(),
    semester: semesterFilter(),
  })

  const [materialsData, { refetch }] = createResource(fetchParams, fetchMaterials)

  async function handleUpload(e: SubmitEvent) {
    e.preventDefault()
    setUploading(true)

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/materiales', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setUploadOpen(false)
        form.reset()
        refetch()
      } else if (res.status === 401) {
        window.location.href = '/api/auth/google'
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <PageShell class="vui-page vui-page--with-header">

      <section class="vui-section">
        <div class="vui-section__container">
          <div class="vui-section__header">
            <h1 class="vui-section__title">Materiales</h1>
            <p class="vui-section__description">
              Compartí y descargá materiales de estudio organizados por materia y semestre.
            </p>
          </div>

          {/* Filters */}
          <div style={{
            display: "flex",
            gap: "1rem",
            "flex-wrap": "wrap",
            "align-items": "center",
            "margin-bottom": "2rem",
          }}>
            <input
              type="text"
              placeholder="Buscar por título..."
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              style={{ ...inputStyle, flex: "1", "min-width": "200px" }}
            />
            <select
              value={semesterFilter()}
              onChange={(e) => setSemesterFilter(e.currentTarget.value)}
              style={inputStyle}
            >
              <option value="">Todos los semestres</option>
              <For each={[1, 2, 3, 4, 5, 6, 7, 8]}>
                {(n) => <option value={String(n)}>Semestre {n}</option>}
              </For>
            </select>
            <DialogTrigger
              isOpen={uploadOpen()}
              onOpenChange={setUploadOpen}
              isDismissable
              trigger={<Button variant="accent">Subir Material</Button>}
              content={(close) => (
                <Dialog title="Subir Material" isDismissable onClose={close} size="md">
                  <form onSubmit={handleUpload} style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
                    <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
                      <span style={labelStyle}>Título *</span>
                      <input name="title" required style={inputStyle} />
                    </label>
                    <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
                      <span style={labelStyle}>Descripción</span>
                      <textarea
                        name="description"
                        rows={3}
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                    </label>
                    <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "1rem" }}>
                      <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
                        <span style={labelStyle}>Semestre</span>
                        <select name="semester" style={inputStyle}>
                          <option value="">—</option>
                          <For each={[1, 2, 3, 4, 5, 6, 7, 8]}>
                            {(n) => <option value={String(n)}>Semestre {n}</option>}
                          </For>
                        </select>
                      </label>
                      <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
                        <span style={labelStyle}>Código materia</span>
                        <input name="subjectCode" placeholder="ING101" style={inputStyle} />
                      </label>
                    </div>
                    <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
                      <span style={labelStyle}>Archivo *</span>
                      <input
                        type="file"
                        name="file"
                        required
                        style={{ padding: "0.5rem", color: "var(--color-text-secondary)" }}
                      />
                    </label>
                    <Button type="submit" variant="accent" disabled={uploading()}>
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
              when={materialsData() && materialsData()!.length > 0}
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
                <table style={{
                  width: "100%",
                  "border-collapse": "collapse",
                  "font-size": "0.875rem",
                }}>
                  <thead>
                    <tr style={{ "border-bottom": "2px solid var(--color-border)" }}>
                      <th style={{ "text-align": "left", padding: "0.75rem", color: "var(--color-text-secondary)", "font-family": "var(--font-title)" }}>Título</th>
                      <th style={{ "text-align": "left", padding: "0.75rem", color: "var(--color-text-secondary)", "font-family": "var(--font-title)" }}>Materia</th>
                      <th style={{ "text-align": "center", padding: "0.75rem", color: "var(--color-text-secondary)", "font-family": "var(--font-title)" }}>Semestre</th>
                      <th style={{ "text-align": "right", padding: "0.75rem", color: "var(--color-text-secondary)", "font-family": "var(--font-title)" }}>Tamaño</th>
                      <th style={{ "text-align": "right", padding: "0.75rem", color: "var(--color-text-secondary)", "font-family": "var(--font-title)" }}>Fecha</th>
                      <th style={{ "text-align": "center", padding: "0.75rem", color: "var(--color-text-secondary)", "font-family": "var(--font-title)" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={materialsData()}>
                      {(material, i) => (
                        <tr style={{
                          "border-bottom": "1px solid var(--color-border)",
                          background: i() % 2 === 0 ? "transparent" : "var(--color-surface-elevated)",
                        }}>
                          <td style={{ padding: "0.75rem", color: "var(--color-text)" }}>
                            {material.title}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <Show when={material.subjectCode}>
                              <Badge variant={areaBadgeVariant[material.areaCode || ''] || 'primary'}>
                                {material.subjectCode}
                              </Badge>
                            </Show>
                          </td>
                          <td style={{ padding: "0.75rem", "text-align": "center", color: "var(--color-text-secondary)" }}>
                            {material.semester || '—'}
                          </td>
                          <td style={{ padding: "0.75rem", "text-align": "right", color: "var(--color-text-secondary)" }}>
                            {formatFileSize(material.fileSize)}
                          </td>
                          <td style={{ padding: "0.75rem", "text-align": "right", color: "var(--color-text-muted)" }}>
                            {new Date(material.createdAt).toLocaleDateString('es-UY')}
                          </td>
                          <td style={{ padding: "0.75rem", "text-align": "center" }}>
                            <a href={`/api/materiales/${material.id}/download`}>
                              <Button variant="primary" size="sm" fill="outline">
                                Descargar
                              </Button>
                            </a>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Suspense>
        </div>
      </section>

      <footer class="vui-footer" style={{ "margin-top": "auto" }}>
        <div class="vui-footer__container">
          <p class="vui-footer__text">
            LIM — Grupo de Estudio — Licenciatura en Ingeniería de Medios
          </p>
          <p class="vui-footer__text">
            FIC + Fing — Universidad de la República — Uruguay
          </p>
        </div>
      </footer>
    </PageShell>
  )
}
