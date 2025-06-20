import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const ContactForm = ({ contact, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    status: contact?.status || 'Prospect',
    tags: contact?.tags?.join(', ') || '',
    industry: contact?.customFields?.industry || '',
    employees: contact?.customFields?.employees || '',
    website: contact?.customFields?.website || ''
  })

  const [errors, setErrors] = useState({})

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Inactive', label: 'Inactive' }
  ]

  const employeeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '10-50', label: '10-50 employees' },
    { value: '50-100', label: '50-100 employees' },
    { value: '100-500', label: '100-500 employees' },
    { value: '500-1000', label: '500-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required'
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
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      customFields: {
        industry: formData.industry,
        employees: formData.employees,
        website: formData.website
      }
    }

    try {
      await onSubmit(submitData)
    } catch (error) {
      toast.error('Failed to save contact')
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
          label="Full Name"
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
          icon="User"
          placeholder="Enter full name"
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          icon="Mail"
          placeholder="Enter email address"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={handleChange('phone')}
          error={errors.phone}
          icon="Phone"
          placeholder="Enter phone number"
        />

        <Input
          label="Company"
          value={formData.company}
          onChange={handleChange('company')}
          error={errors.company}
          icon="Building"
          placeholder="Enter company name"
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={handleChange('status')}
          options={statusOptions}
          error={errors.status}
        />

        <Input
          label="Tags"
          value={formData.tags}
          onChange={handleChange('tags')}
          placeholder="Enter tags (comma separated)"
          icon="Tag"
        />

        <Input
          label="Industry"
          value={formData.industry}
          onChange={handleChange('industry')}
          placeholder="Enter industry"
          icon="Briefcase"
        />

        <Select
          label="Company Size"
          value={formData.employees}
          onChange={handleChange('employees')}
          options={employeeOptions}
          placeholder="Select company size"
        />

        <div className="md:col-span-2">
          <Input
            label="Website"
            type="url"
            value={formData.website}
            onChange={handleChange('website')}
            placeholder="https://company.com"
            icon="Globe"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          loading={loading}
          icon="Save"
        >
          {contact ? 'Update Contact' : 'Create Contact'}
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

export default ContactForm