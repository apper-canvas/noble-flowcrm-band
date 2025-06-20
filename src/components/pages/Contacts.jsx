import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import ContactCard from "@/components/molecules/ContactCard";
import EmptyState from "@/components/molecules/EmptyState";
import ErrorState from "@/components/molecules/ErrorState";
import SkeletonLoader from "@/components/molecules/SkeletonLoader";
import ContactTable from "@/components/organisms/ContactTable";
import ContactForm from "@/components/organisms/ContactForm";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import contactService from "@/services/api/contactService";

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    filterContacts()
  }, [contacts, searchQuery, statusFilter, tagFilter])

  const loadContacts = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await contactService.getAll()
      setContacts(result)
    } catch (err) {
      setError(err.message || 'Failed to load contacts')
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const filterContacts = () => {
    let filtered = [...contacts]

if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(contact =>
        contact?.name?.toLowerCase().includes(query) ||
        contact?.email?.toLowerCase().includes(query) ||
        contact?.company?.toLowerCase().includes(query)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(contact => contact.status === statusFilter)
    }

    if (tagFilter) {
      filtered = filtered.filter(contact =>
        contact.tags?.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()))
      )
    }

    setFilteredContacts(filtered)
  }

  const handleCreateContact = async (contactData) => {
    setFormLoading(true)
    try {
      const newContact = await contactService.create(contactData)
      setContacts(prev => [newContact, ...prev])
      setShowForm(false)
      toast.success('Contact created successfully')
    } catch (err) {
      toast.error('Failed to create contact')
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateContact = async (contactData) => {
    setFormLoading(true)
    try {
      const updatedContact = await contactService.update(editingContact.Id, contactData)
      setContacts(prev => prev.map(contact =>
        contact.Id === editingContact.Id ? updatedContact : contact
      ))
      setEditingContact(null)
      setShowForm(false)
      toast.success('Contact updated successfully')
    } catch (err) {
      toast.error('Failed to update contact')
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleStatusChange = async (contactId, updates) => {
    try {
      const updatedContact = await contactService.update(contactId, updates)
      setContacts(prev => prev.map(contact =>
        contact.Id === contactId ? updatedContact : contact
      ))
      toast.success('Contact status updated')
    } catch (err) {
      toast.error('Failed to update contact status')
    }
  }

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return
    }

    try {
      await contactService.delete(contactId)
      setContacts(prev => prev.filter(contact => contact.Id !== contactId))
      toast.success('Contact deleted successfully')
    } catch (err) {
      toast.error('Failed to delete contact')
    }
  }

  const handleEditContact = (contact) => {
    setEditingContact(contact)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingContact(null)
  }

  const clearFilters = () => {
    setSearchQuery('')
setTagFilter('')
  }

  const handleMergeContact = async (sourceId, targetId) => {
    if (!window.confirm('Are you sure you want to merge these contacts? This action cannot be undone.')) {
      return
    }

    try {
      await contactService.merge(sourceId, targetId)
      setContacts(prev => prev.filter(contact => contact.Id !== sourceId))
      toast.success('Contacts merged successfully')
    } catch (err) {
      toast.error('Failed to merge contacts')
    }
  }

  const handleFindDuplicates = async () => {
    try {
      const duplicates = await contactService.findDuplicates()
      setDuplicateData(duplicates)
      toast.info(`Found ${duplicates.length} potential duplicates`)
    } catch (err) {
      toast.error('Failed to find duplicates')
    }
  }

  const [duplicateData, setDuplicateData] = useState([])

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Inactive', label: 'Inactive' }
  ]

  const uniqueTags = [...new Set(contacts.flatMap(contact => contact.tags || []))]

  if (loading && contacts.length === 0) {
    return (
    return (
      <div className="p-6">
        <SkeletonLoader count={6} type="card" />
      </div>
    )
  }

  if (error && contacts.length === 0) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadContacts}
        />
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingContact ? 'Edit Contact' : 'Create New Contact'}
          </h1>
          <p className="text-gray-600">
            {editingContact ? 'Update contact information' : 'Add a new contact to your CRM'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ContactForm
            contact={editingContact}
            onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
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
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">
            {filteredContacts.length} of {contacts.length} contacts
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name="Grid3X3" size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name="List" size={16} />
            </button>
          </div>
          
          <Button
            onClick={() => setShowForm(true)}
            icon="Plus"
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon="Search"
          />
          
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          
          <Input
            placeholder="Filter by tag"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            icon="Tag"
          />
          
          <Button
            variant="outline"
            onClick={clearFilters}
            icon="X"
            disabled={!searchQuery && !statusFilter && !tagFilter}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredContacts.length === 0 && !loading ? (
        <EmptyState
          icon={contacts.length === 0 ? "Users" : "Search"}
          title={contacts.length === 0 ? "No contacts yet" : "No contacts found"}
          description={
            contacts.length === 0
              ? "Get started by adding your first contact to the CRM"
              : "Try adjusting your search criteria or clearing filters"
          }
          actionLabel={contacts.length === 0 ? "Add Contact" : undefined}
          onAction={contacts.length === 0 ? () => setShowForm(true) : undefined}
        />
      ) : (
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.Id}
                  contact={contact}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteContact}
                />
              ))}
            </div>
) : (
            <ContactTable
              contacts={filteredContacts}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteContact}
              onEdit={handleEditContact}
              onMerge={handleMergeContact}
              onBulkMerge={handleFindDuplicates}
              duplicateData={duplicateData}
              loading={loading}
            />
          )}
        </motion.div>
      )}
    </div>
  )
}

export default Contacts