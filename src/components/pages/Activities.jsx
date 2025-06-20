import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import ActivityCard from '@/components/molecules/ActivityCard'
import ActivityForm from '@/components/organisms/ActivityForm'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import ApperIcon from '@/components/ApperIcon'
import activityService from '@/services/api/activityService'
import contactService from '@/services/api/contactService'
import dealService from '@/services/api/dealService'

const Activities = () => {
  const [activities, setActivities] = useState([])
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [contactFilter, setContactFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [activities, searchQuery, typeFilter, contactFilter])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ])
      setActivities(activitiesData)
      setContacts(contactsData)
      setDeals(dealsData)
    } catch (err) {
      setError(err.message || 'Failed to load activities')
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = [...activities]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(activity =>
        activity.content.toLowerCase().includes(query) ||
        activity.type.toLowerCase().includes(query)
      )
    }

    if (typeFilter) {
      filtered = filtered.filter(activity => activity.type === typeFilter)
    }

    if (contactFilter) {
      filtered = filtered.filter(activity => 
        activity.contactId === parseInt(contactFilter, 10)
      )
    }

    setFilteredActivities(filtered)
  }

  const handleCreateActivity = async (activityData) => {
    setFormLoading(true)
    try {
      const newActivity = await activityService.create(activityData)
      setActivities(prev => [newActivity, ...prev])
      setShowForm(false)
      toast.success('Activity created successfully')
    } catch (err) {
      toast.error('Failed to create activity')
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateActivity = async (activityData) => {
    setFormLoading(true)
    try {
      const updatedActivity = await activityService.update(editingActivity.Id, activityData)
      setActivities(prev => prev.map(activity =>
        activity.Id === editingActivity.Id ? updatedActivity : activity
      ))
      setEditingActivity(null)
      setShowForm(false)
      toast.success('Activity updated successfully')
    } catch (err) {
      toast.error('Failed to update activity')
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return
    }

    try {
      await activityService.delete(activityId)
      setActivities(prev => prev.filter(activity => activity.Id !== activityId))
      toast.success('Activity deleted successfully')
    } catch (err) {
      toast.error('Failed to delete activity')
    }
  }

  const handleEditActivity = (activity) => {
    setEditingActivity(activity)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingActivity(null)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('')
    setContactFilter('')
  }

  const typeOptions = [
    { value: 'Call', label: 'Phone Call' },
    { value: 'Email', label: 'Email' },
    { value: 'Meeting', label: 'Meeting' },
    { value: 'Note', label: 'Note' },
    { value: 'Task', label: 'Task' }
  ]

  const contactOptions = contacts.map(contact => ({
    value: contact.Id,
    label: `${contact.name} (${contact.company})`
  }))

  if (loading && activities.length === 0) {
    return (
      <div className="p-6">
        <SkeletonLoader count={4} type="list" />
      </div>
    )
  }

  if (error && activities.length === 0) {
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
            {editingActivity ? 'Edit Activity' : 'Create New Activity'}
          </h1>
          <p className="text-gray-600">
            {editingActivity ? 'Update activity information' : 'Record a new customer interaction'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ActivityForm
            activity={editingActivity}
            contacts={contacts}
            deals={deals}
            onSubmit={editingActivity ? handleUpdateActivity : handleCreateActivity}
            onCancel={handleCancelForm}
            loading={formLoading}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600">
            {filteredActivities.length} of {activities.length} activities
          </p>
        </div>
        
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
        >
          Add Activity
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon="Search"
          />
          
          <Select
            placeholder="Filter by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={typeOptions}
          />
          
          <Select
            placeholder="Filter by contact"
            value={contactFilter}
            onChange={(e) => setContactFilter(e.target.value)}
            options={contactOptions}
          />
          
          <Button
            variant="outline"
            onClick={clearFilters}
            icon="X"
            disabled={!searchQuery && !typeFilter && !contactFilter}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {typeOptions.map((type) => {
          const count = activities.filter(a => a.type === type.value).length
          const percentage = activities.length > 0 ? (count / activities.length * 100).toFixed(1) : 0
          
          return (
            <motion.div
              key={type.value}
              whileHover={{ y: -2 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{type.label}</p>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{percentage}%</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 && !loading ? (
        <EmptyState
          icon={activities.length === 0 ? "Activity" : "Search"}
          title={activities.length === 0 ? "No activities yet" : "No activities found"}
          description={
            activities.length === 0
              ? "Start tracking customer interactions by creating your first activity"
              : "Try adjusting your search criteria or clearing filters"
          }
          actionLabel={activities.length === 0 ? "Add Activity" : undefined}
          onAction={activities.length === 0 ? () => setShowForm(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <ActivityCard
                  activity={activity}
                  contact={contacts.find(c => c.Id === activity.contactId)}
                  deal={deals.find(d => d.Id === activity.dealId)}
                />
                
                {/* Action buttons */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                    <button
                      onClick={() => handleEditActivity(activity)}
                      className="p-1 text-gray-400 hover:text-primary transition-colors rounded"
                    >
                      <ApperIcon name="Edit" size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.Id)}
                      className="p-1 text-gray-400 hover:text-error transition-colors rounded"
                    >
                      <ApperIcon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Activities