// ============= Classes Tab =============
// src/components/game-management/ClassesTab.tsx
import type { GameClass } from '@/types'

interface ClassesTabProps {
  classes: GameClass[]
  selectedGame: Game | undefined
  onRefresh: () => void
}

export function ClassesTab({ classes, selectedGame, onRefresh }: ClassesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingClass, setEditingClass] = useState<GameClass | null>(null)
  const [deletingClass, setDeletingClass] = useState<GameClass | null>(null)

  const { createGameClass, updateGameClass, deleteGameClass } = useGameClassMutations()

  const handleCreate = async (classData: Partial<GameClass>) => {
    if (!selectedGame) return
    
    try {
      await createGameClass.mutateAsync({ ...classData, game_id: selectedGame.id })
      setShowCreateModal(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to create game class:', error)
    }
  }

  const handleUpdate = async (classData: Partial<GameClass>) => {
    if (!editingClass) return
    
    try {
      await updateGameClass.mutateAsync({ id: editingClass.id, ...classData })
      setEditingClass(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to update game class:', error)
    }
  }

  const handleDelete = async () => {
    if (!deletingClass) return
    
    try {
      await deleteGameClass.mutateAsync(deletingClass.id)
      setDeletingClass(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete game class:', error)
    }
  }

  const isLoading = createGameClass.isPending || updateGameClass.isPending || deleteGameClass.isPending

  if (!selectedGame) {
    return (
      <SelectionRequired
        title="No Game Selected"
        message="Please select a game first to manage its classes"
        icon="🏅"
      />
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>🏅</span>
          <span>Classes for {selectedGame.name} ({classes.length})</span>
        </h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="success"
          icon="➕"
          disabled={isLoading}
        >
          Add Class
        </Button>
      </div>

      {isLoading && <LoadingState message="Processing class operation..." />}

      {!isLoading && classes.length === 0 ? (
        <EmptyState
          title="No Classes"
          message="Add classes like Pro, Semi-Pro, Amateur, etc."
          icon="🏅"
          action={{
            label: "Add First Class",
            onClick: () => setShowCreateModal(true)
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((gameClass) => (
            <ClassCard
              key={gameClass.id}
              gameClass={gameClass}
              onEdit={setEditingClass}
              onDelete={setDeletingClass}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <ClassModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          isLoading={createGameClass.isPending}
        />
      )}

      {editingClass && (
        <ClassModal
          gameClass={editingClass}
          onClose={() => setEditingClass(null)}
          onSubmit={handleUpdate}
          isLoading={updateGameClass.isPending}
        />
      )}

      {deletingClass && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeletingClass(null)}
          onConfirm={handleDelete}
          title="Delete Game Class"
          message={`Delete "${deletingClass.name}" class? This action cannot be undone.`}
          confirmText="Delete Class"
          confirmColor="red"
          isLoading={deleteGameClass.isPending}
        />
      )}
    </div>
  )
}

// Class Card Component
interface ClassCardProps {
  gameClass: GameClass
  onEdit: (cls: GameClass) => void
  onDelete: (cls: GameClass) => void
}

function ClassCard({ gameClass, onEdit, onDelete }: ClassCardProps) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6 group hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <span className="text-blue-300 text-xl">🏅</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{gameClass.name}</h3>
            <p className="text-sm text-slate-400">Competition Class</p>
          </div>
        </div>
        
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(gameClass)}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(gameClass)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Status:</span>
          <span className={gameClass.is_active ? 'text-green-400' : 'text-red-400'}>
            {gameClass.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Created:</span>
          <span className="text-slate-300">
            {formatDateTime(gameClass.created_at, { short: true })}
          </span>
        </div>
      </div>
    </div>
  )
}

// Class Modal Component
interface ClassModalProps {
  gameClass?: GameClass | null
  onClose: () => void
  onSubmit: (classData: Partial<GameClass>) => void
  isLoading: boolean
}

function ClassModal({ gameClass, onClose, onSubmit, isLoading }: ClassModalProps) {
  const [formData, setFormData] = useState({
    name: gameClass?.name || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      skill_level: 'intermediate',
      is_active: true
    })
  }

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      title={`${gameClass ? 'Edit' : 'Create'} Game Class`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-blue-300 text-sm">
            <strong>Simple setup:</strong> Just add the class name. This will be used as a filter for rally registration.
          </p>
        </div>

        <Input
          label="Class Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Pro, Semi-Pro, Amateur, Rookie"
          required
          hint="Examples: Pro, Semi-Pro, Amateur, Rookie, Beginner, Expert"
        />

        <FormActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="success" loading={isLoading} disabled={!formData.name}>
            {gameClass ? 'Update Class' : 'Create Class'}
          </Button>
        </FormActions>
      </form>
    </FormModal>
  )
}