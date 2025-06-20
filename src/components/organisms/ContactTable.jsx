import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const ContactTable = ({ contacts, onStatusChange, onDelete, loading = false }) => {
  const navigate = useNavigate()
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedContacts, setSelectedContacts] = useState([])

  const statusColors = {
    'Active': 'success',
    'Prospect': 'warning',
    'Inactive': 'default'
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedContacts = [...contacts].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (sortDirection === 'asc') {
      return aValue.toString().localeCompare(bValue.toString())
    }
    return bValue.toString().localeCompare(aValue.toString())
  })

  const handleSelectAll = (checked) => {
    setSelectedContacts(checked ? contacts.map(c => c.Id) : [])
  }

  const handleSelectContact = (contactId, checked) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId])
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId))
    }
  }

  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) return
    
    if (window.confirm(`Delete ${selectedContacts.length} selected contacts?`)) {
      selectedContacts.forEach(id => onDelete(id))
      setSelectedContacts([])
    }
  }

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-left font-medium text-gray-900 hover:text-primary transition-colors"
    >
      {children}
      <ApperIcon 
        name={sortField === field ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
        size={14} 
      />
    </button>
  )

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-200 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/5 border-b border-primary/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              {selectedContacts.length} contacts selected
            </span>
            <Button
              variant="danger"
              size="sm"
              icon="Trash2"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
          </div>
        </motion.div>
      )}

      {/* Table Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedContacts.length === contacts.length && contacts.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
          <div className="col-span-3">
            <SortButton field="name">Contact</SortButton>
          </div>
          <div className="col-span-3">
            <SortButton field="company">Company</SortButton>
          </div>
          <div className="col-span-2">
            <SortButton field="status">Status</SortButton>
          </div>
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-900">Tags</span>
          </div>
          <div className="col-span-1">
            <span className="text-sm font-medium text-gray-900">Actions</span>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {sortedContacts.map((contact, index) => (
          <motion.div
            key={contact.Id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.Id)}
                  onChange={(e) => handleSelectContact(contact.Id, e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              
              <div className="col-span-3">
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/contacts/${contact.Id}`)}
                >
                  <Avatar name={contact.name} size="md" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {contact.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {contact.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-3">
                <p className="font-medium text-gray-900 truncate">
                  {contact.company}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {contact.phone}
                </p>
              </div>
              
              <div className="col-span-2">
                <button
                  onClick={() => {
                    const statuses = ['Active', 'Prospect', 'Inactive']
                    const currentIndex = statuses.indexOf(contact.status)
                    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                    onStatusChange(contact.Id, { status: nextStatus })
                  }}
                  className="transition-transform hover:scale-105"
                >
                  <Badge variant={statusColors[contact.status] || 'default'}>
                    {contact.status}
                  </Badge>
                </button>
              </div>
              
              <div className="col-span-2">
                <div className="flex flex-wrap gap-1">
                  {contact.tags?.slice(0, 2).map((tag, i) => (
                    <Badge key={i} variant="primary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {contact.tags?.length > 2 && (
                    <Badge variant="default" size="sm">
                      +{contact.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="col-span-1">
                <button
                  onClick={() => onDelete(contact.Id)}
                  className="p-1 text-gray-400 hover:text-error transition-colors rounded"
                >
                  <ApperIcon name="Trash2" size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ContactTable