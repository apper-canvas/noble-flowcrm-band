import { useState, useEffect } from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import DealCard from '@/components/molecules/DealCard'
import ApperIcon from '@/components/ApperIcon'
import dealService from '@/services/api/dealService'
import contactService from '@/services/api/contactService'

const DEAL_STAGES = [
  { id: 'Lead', label: 'Lead', color: 'bg-gray-100' },
  { id: 'Qualified', label: 'Qualified', color: 'bg-yellow-100' },
  { id: 'Proposal', label: 'Proposal', color: 'bg-blue-100' },
  { id: 'Negotiation', label: 'Negotiation', color: 'bg-orange-100' },
  { id: 'Closed', label: 'Closed', color: 'bg-green-100' }
]

const StageColumn = ({ stage, deals, contacts, onDealUpdate, onDealDelete }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'deal',
    drop: (item) => {
      if (item.currentStage !== stage.id) {
        onDealUpdate(item.id, { stage: stage.id })
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const stageDeals = deals.filter(deal => deal.stage === stage.id)
  const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)

  return (
    <div
      ref={drop}
      className={`
        flex-1 min-w-80 bg-gray-50 rounded-lg p-4 space-y-4
        ${isOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''}
        transition-all duration-200
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${stage.color.replace('bg-', 'bg-').replace('-100', '-400')}`} />
          <h3 className="font-semibold text-gray-900">{stage.label}</h3>
          <span className="text-sm text-gray-500">({stageDeals.length})</span>
        </div>
        <div className="text-sm font-medium text-gray-700">
          ${stageValue.toLocaleString()}
        </div>
      </div>

      <div className="space-y-3 min-h-40">
        {stageDeals.map((deal, index) => (
          <motion.div
            key={deal.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <DealCard
              deal={deal}
              contact={contacts.find(c => c.Id === deal.contactId)}
              onUpdate={onDealUpdate}
              onDelete={onDealDelete}
            />
          </motion.div>
        ))}
        
        {stageDeals.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <ApperIcon name="Package" size={24} className="mx-auto mb-2" />
              <p className="text-sm">No deals in {stage.label}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const DealPipeline = () => {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ])
      setDeals(dealsData)
      setContacts(contactsData)
    } catch (err) {
      setError(err.message || 'Failed to load pipeline data')
      toast.error('Failed to load pipeline data')
    } finally {
      setLoading(false)
    }
  }

  const handleDealUpdate = async (dealId, updates) => {
    try {
      const updatedDeal = await dealService.update(dealId, updates)
      setDeals(prev => prev.map(deal => 
        deal.Id === dealId ? updatedDeal : deal
      ))
      
      if (updates.stage) {
        toast.success(`Deal moved to ${updates.stage}`)
      }
    } catch (err) {
      toast.error('Failed to update deal')
    }
  }

  const handleDealDelete = async (dealId) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) {
      return
    }

    try {
      await dealService.delete(dealId)
      setDeals(prev => prev.filter(deal => deal.Id !== dealId))
      toast.success('Deal deleted successfully')
    } catch (err) {
      toast.error('Failed to delete deal')
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex gap-4 overflow-x-auto">
            {DEAL_STAGES.map((stage) => (
              <div key={stage.id} className="flex-1 min-w-80 bg-gray-100 rounded-lg p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertTriangle" className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load pipeline</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
            <p className="text-gray-600">
              {deals.length} deals • ${totalValue.toLocaleString()} total value
            </p>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={deals}
              contacts={contacts}
              onDealUpdate={handleDealUpdate}
              onDealDelete={handleDealDelete}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  )
}

export default DealPipeline