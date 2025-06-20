import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Button from '@/components/atoms/Button'

const ActivityForm = ({ activity, contacts, deals, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    type: activity?.type || 'Note',
    contactId: activity?.contactId || '',
    dealId: activity?.dealId || '',
    content: activity?.content || ''
  })

  const [errors, setErrors] = useState({})

  const activityTypes = [
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

  const dealOptions = deals.map(deal => ({
    value: deal.Id,
    label: deal.title
  }))

  const validateForm = () => {
    const newErrors = {}

    if (!formData.type) {
      newErrors.type = 'Activity type is required'
    }

    if (!formData.contactId) {
      newErrors.contactId = 'Please select a contact'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
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
      contactId: parseInt(formData.contactId, 10),
      dealId: formData.dealId ? parseInt(formData.dealId, 10) : null
    }

    try {
      await onSubmit(submitData)
    } catch (error) {
      toast.error('Failed to save activity')
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
        <Select
          label="Activity Type"
          value={formData.type}
          onChange={handleChange('type')}
          options={activityTypes}
          error={errors.type}
        />

        <Select
          label="Contact"
          value={formData.contactId}
          onChange={handleChange('contactId')}
          options={contactOptions}
          placeholder="Select a contact"
          error={errors.contactId}
        />

        <div className="md:col-span-2">
          <Select
            label="Related Deal (Optional)"
            value={formData.dealId}
            onChange={handleChange('dealId')}
            options={dealOptions}
            placeholder="Select a deal (optional)"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={formData.content}
          onChange={handleChange('content')}
          rows={4}
          placeholder="Enter activity details..."
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:ring-2 focus:ring-primary/50 focus:border-primary
            resize-vertical
            ${errors.content ? 'border-error focus:ring-error/50 focus:border-error' : ''}
          `}
        />
        {errors.content && (
          <p className="text-sm text-error mt-1">{errors.content}</p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          loading={loading}
          icon="Save"
        >
          {activity ? 'Update Activity' : 'Create Activity'}
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

export default ActivityForm