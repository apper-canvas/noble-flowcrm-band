import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import DealPipeline from '@/components/organisms/DealPipeline'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import ApperIcon from '@/components/ApperIcon'
import dealService from '@/services/api/dealService'
import contactService from '@/services/api/contactService'

const DealForm = ({ deal, contacts, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: deal?.title || '',
    value: deal?.value || '',
    stage: deal?.stage || 'Lead',
    contactId: deal?.contactId || '',
    probability: deal?.probability || 50,
    expectedCloseDate: deal?.expectedCloseDate?.split('T')[0] || ''
  })

  const [errors, setErrors] = useState({})

  const stageOptions = [
    { value: 'Lead', label: 'Lead' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Proposal', label: 'Proposal' },
    { value: 'Negotiation', label: 'Negotiation' },
    { value: 'Closed', label: 'Closed' }
  ]

  const contactOptions = contacts.map(contact => ({
    value: contact.Id,
    label: `${contact.name} (${contact.company})`
  }))

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required'
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Deal value must be greater than 0'
    }

    if (!formData.contactId) {
      newErrors.contactId = 'Please select a contact'
    }

    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    const submitData = {
      ...formData,
      value: parseFloat(formData.value),
      contactId: parseInt(formData.contactId, 10),
      probability: parseInt(formData.probability, 10),
      expectedCloseDate: new Date(formData.expectedCloseDate).toISOString()
    }

    try {
      await onSubmit(submitData)
    } catch (error) {
      toast.error('Failed to save deal')
    }
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Deal Title"
          value={formData.title}
          onChange={handleChange('title')}
          error={errors.title}
          placeholder="Enter deal title"
        />

        <Input
          label="Deal Value"
          type="number"
          min="0"
          step="0.01"
          value={formData.value}
          onChange={handleChange('value')}
          error={errors.value}
          placeholder="0.00"
          icon="DollarSign"
        />

        <Select
          label="Stage"
          value={formData.stage}
          onChange={handleChange('stage')}
          options={stageOptions}
          error={errors.stage}
        />

        <Select
          label="Contact"
          value={formData.contactId}
          onChange={handleChange('contactId')}
          options={contactOptions}
          placeholder="Select a contact"
          error={errors.contactId}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Probability (%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.probability}
            onChange={handleChange('probability')}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>0%</span>
            <span className="font-medium">{formData.probability}%</span>
            <span>100%</span>
          </div>
        </div>

        <Input
          label="Expected Close Date"
          type="date"
          value={formData.expectedCloseDate}
          onChange={handleChange('expectedCloseDate')}
          error={errors.expectedCloseDate}
        />
      </div>

      <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          loading={loading}
          icon="Save"
        >
          {deal ? 'Update Deal' : 'Create Deal'}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </motion.form>
  )
}

const Deals = () => {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [viewMode, setViewMode] = useState('pipeline') // 'pipeline' or 'list'

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
      setError(err.message || 'Failed to load deals')
      toast.error('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDeal = async (dealData) => {
    setFormLoading(true)
    try {
      const newDeal = await dealService.create(dealData)
      setDeals(prev => [newDeal, ...prev])
      setShowForm(false)
      toast.success('Deal created successfully')
    } catch (err) {
      toast.error('Failed to create deal')
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateDeal = async (dealData) => {
    setFormLoading(true)
    try {
      const updatedDeal = await dealService.update(editingDeal.Id, dealData)
      setDeals(prev => prev.map(deal =>
        deal.Id === editingDeal.Id ? updatedDeal : deal
      ))
      setEditingDeal(null)
      setShowForm(false)
      toast.success('Deal updated successfully')
    } catch (err) {
      toast.error('Failed to update deal')
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditDeal = (deal) => {
    setEditingDeal(deal)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingDeal(null)
  }

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
  const wonDeals = deals.filter(deal => deal.stage === 'Closed' && deal.probability === 100)
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0)

  if (loading && deals.length === 0) {
    return (
      <div className="p-6">
        <SkeletonLoader count={4} type="card" />
      </div>
    )
  }

  if (error && deals.length === 0) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadData}
        />
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingDeal ? 'Edit Deal' : 'Create New Deal'}
          </h1>
          <p className="text-gray-600">
            {editingDeal ? 'Update deal information' : 'Add a new deal to your pipeline'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <DealForm
            deal={editingDeal}
            contacts={contacts}
            onSubmit={editingDeal ? handleUpdateDeal : handleCreateDeal}
            onCancel={handleCancelForm}
            loading={formLoading}
          />
        </div>
      </div>
    )
  }

  if (deals.length === 0 && !loading) {
    return (
      <div className="p-6">
        <EmptyState
          icon="TrendingUp"
          title="No deals yet"
          description="Start tracking your sales opportunities by creating your first deal"
          actionLabel="Create Deal"
          onAction={() => setShowForm(true)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
            <p className="text-gray-600">{deals.length} active deals</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowForm(true)}
              icon="Plus"
            >
              Add Deal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ApperIcon name="TrendingUp" size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <ApperIcon name="Target" size={24} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Won Deals</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${wonValue.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-lg">
                <ApperIcon name="BarChart3" size={24} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pipeline */}
      <DealPipeline />
    </div>
  )
}

export default Deals