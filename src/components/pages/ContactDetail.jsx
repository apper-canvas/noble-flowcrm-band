import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Avatar from '@/components/atoms/Avatar'
import Card from '@/components/atoms/Card'
import ActivityCard from '@/components/molecules/ActivityCard'
import DealCard from '@/components/molecules/DealCard'
import ContactForm from '@/components/organisms/ContactForm'
import ActivityForm from '@/components/organisms/ActivityForm'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import ErrorState from '@/components/molecules/ErrorState'
import ApperIcon from '@/components/ApperIcon'
import contactService from '@/services/api/contactService'
import dealService from '@/services/api/dealService'
import activityService from '@/services/api/activityService'

const ContactDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [contact, setContact] = useState(null)
  const [deals, setDeals] = useState([])
  const [activities, setActivities] = useState([])
  const [allContacts, setAllContacts] = useState([])
  const [allDeals, setAllDeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditForm, setShowEditForm] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadContactData()
    }
  }, [id])

  const loadContactData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [
        contactData,
        contactDeals,
        contactActivities,
        allContactsData,
        allDealsData
      ] = await Promise.all([
        contactService.getById(id),
        dealService.getByContactId(id),
        activityService.getByContactId(id),
        contactService.getAll(),
        dealService.getAll()
      ])
      
      setContact(contactData)
      setDeals(contactDeals)
      setActivities(contactActivities)
      setAllContacts(allContactsData)
      setAllDeals(allDealsData)
    } catch (err) {
      setError(err.message || 'Failed to load contact details')
      toast.error('Failed to load contact details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateContact = async (contactData) => {
    setFormLoading(true)
    try {
      const updatedContact = await contactService.update(id, contactData)
      setContact(updatedContact)
      setShowEditForm(false)
      toast.success('Contact updated successfully')
    } catch (err) {
      toast.error('Failed to update contact')
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleCreateActivity = async (activityData) => {
    setFormLoading(true)
    try {
      const newActivity = await activityService.create({
        ...activityData,
        contactId: parseInt(id, 10)
      })
      setActivities(prev => [newActivity, ...prev])
      setShowActivityForm(false)
      toast.success('Activity created successfully')
    } catch (err) {
      toast.error('Failed to create activity')
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteContact = async () => {
    if (!window.confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return
    }

    try {
      await contactService.delete(id)
      toast.success('Contact deleted successfully')
      navigate('/contacts')
    } catch (err) {
      toast.error('Failed to delete contact')
    }
  }

  const statusColors = {
    'Active': 'success',
    'Prospect': 'warning',
    'Inactive': 'default'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'activities', label: 'Activities', icon: 'Activity' },
    { id: 'deals', label: 'Deals', icon: 'TrendingUp' },
    { id: 'notes', label: 'Notes', icon: 'FileText' }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader count={1} type="list" />
      </div>
    )
  }

  if (error || !contact) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error || 'Contact not found'}
          title={error ? 'Failed to load contact' : 'Contact not found'}
          onRetry={error ? loadContactData : undefined}
        />
      </div>
    )
  }

  if (showEditForm) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowEditForm(false)}
            icon="ArrowLeft"
            className="mb-4"
          >
            Back to Contact
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Contact</h1>
          <p className="text-gray-600">Update contact information</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ContactForm
            contact={contact}
            onSubmit={handleUpdateContact}
            onCancel={() => setShowEditForm(false)}
            loading={formLoading}
          />
        </div>
      </div>
    )
  }

  if (showActivityForm) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowActivityForm(false)}
            icon="ArrowLeft"
            className="mb-4"
          >
            Back to Contact
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Add Activity</h1>
          <p className="text-gray-600">Record a new interaction with {contact.name}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ActivityForm
            contacts={allContacts}
            deals={allDeals}
            onSubmit={handleCreateActivity}
            onCancel={() => setShowActivityForm(false)}
            loading={formLoading}
          />
        </div>
      </div>
    )
  }

  const totalDealValue = deals.reduce((sum, deal) => sum + deal.value, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/contacts')}
            icon="ArrowLeft"
          >
            Back to Contacts
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowActivityForm(true)}
            icon="Plus"
          >
            Add Activity
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowEditForm(true)}
            icon="Edit"
          >
            Edit Contact
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteContact}
            icon="Trash2"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Contact Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar name={contact.name} size="xl" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {contact.name}
              </h1>
              <Badge variant={statusColors[contact.status]}>
                {contact.status}
              </Badge>
            </div>
            
            <p className="text-lg text-gray-600 mb-4">{contact.company}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <ApperIcon name="Mail" size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{contact.email}</span>
              </div>
              
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <ApperIcon name="Phone" size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{contact.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <ApperIcon name="Calendar" size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  Created {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
            
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {contact.tags.map((tag, index) => (
                  <Badge key={index} variant="primary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Deal Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalDealValue.toLocaleString()}
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
              <ApperIcon name="Package" size={24} className="text-success" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Deals</p>
              <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <ApperIcon name="Activity" size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activities</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary bg-primary/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <ApperIcon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contact.customFields?.industry && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Industry</label>
                      <p className="text-gray-900">{contact.customFields.industry}</p>
                    </div>
                  )}
                  
                  {contact.customFields?.employees && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company Size</label>
                      <p className="text-gray-900">{contact.customFields.employees} employees</p>
                    </div>
                  )}
                  
                  {contact.customFields?.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <a 
                        href={contact.customFields.website.startsWith('http') 
                          ? contact.customFields.website 
                          : `https://${contact.customFields.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {contact.customFields.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <ActivityCard
                    key={activity.Id}
                    activity={activity}
                    contact={contact}
                    deal={deals.find(d => d.Id === activity.dealId)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <ApperIcon name="Activity" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                  <p className="text-gray-600 mb-4">Start tracking interactions with this contact</p>
                  <Button onClick={() => setShowActivityForm(true)} icon="Plus">
                    Add Activity
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-4">
              {deals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deals.map((deal) => (
                    <DealCard
                      key={deal.Id}
                      deal={deal}
                      contact={contact}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ApperIcon name="TrendingUp" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deals yet</h3>
                  <p className="text-gray-600 mb-4">Create deals to track sales opportunities</p>
                  <Button onClick={() => navigate('/deals')} icon="Plus">
                    Create Deal
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {activities.filter(a => a.type === 'Note').length > 0 ? (
                activities
                  .filter(a => a.type === 'Note')
                  .map((note) => (
                    <Card key={note.Id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-warning/10 rounded-full">
                          <ApperIcon name="FileText" size={16} className="text-warning" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 mb-2">{note.content}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(note.timestamp), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
              ) : (
                <div className="text-center py-12">
                  <ApperIcon name="FileText" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                  <p className="text-gray-600 mb-4">Add notes to keep track of important information</p>
                  <Button onClick={() => setShowActivityForm(true)} icon="Plus">
                    Add Note
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactDetail