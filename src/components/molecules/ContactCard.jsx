import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const ContactCard = ({ contact, onStatusChange, onDelete, onMerge }) => {
  const navigate = useNavigate()

  const statusColors = {
    'Active': 'success',
    'Prospect': 'warning',
    'Inactive': 'default'
  }
const handleCardClick = () => {
    if (contact?.Id) {
      navigate(`/contacts/${contact.Id}`)
    }
  }

  const handleStatusClick = (e) => {
    e.stopPropagation()
    if (onStatusChange && contact?.Id) {
      const statuses = ['Active', 'Prospect', 'Inactive']
      const currentIndex = statuses.indexOf(contact.status)
      const nextStatus = statuses[(currentIndex + 1) % statuses.length]
      onStatusChange(contact.Id, { status: nextStatus })
    }
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (onDelete && contact?.Id) {
      onDelete(contact.Id)
    }
  }

  const handleMergeClick = (e) => {
    e.stopPropagation()
    if (onMerge && contact?.Id) {
      onMerge(contact.Id)
    }
  }

  const hasDuplicates = contact?.duplicates && contact.duplicates.length > 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        hover 
        className="p-4 cursor-pointer transition-all hover:shadow-hover"
        onClick={handleCardClick}
      >
<div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar name={contact?.name || 'Unknown'} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {contact?.name || 'Unknown Contact'}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {contact?.company || 'No Company'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <ApperIcon name="Mail" size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500 truncate">
                  {contact?.email || 'No Email'}
                </span>
              </div>
            </div>
          </div>
          
<div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {hasDuplicates && (
              <button
                onClick={handleMergeClick}
                className="p-1 text-warning hover:text-warning/80 transition-colors rounded"
                title="Merge duplicates"
              >
                <ApperIcon name="Merge" size={14} />
              </button>
            )}
            <button
              onClick={handleStatusClick}
              className="transition-transform hover:scale-105"
            >
<Badge variant={statusColors[contact?.status] || 'default'}>
                {contact?.status || 'Unknown'}
              </Badge>
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1 text-gray-400 hover:text-error transition-colors rounded"
            >
              <ApperIcon name="Trash2" size={14} />
            </button>
          </div>
        </div>

        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {contact.tags.map((tag, index) => (
              <Badge key={index} variant="primary" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

export default ContactCard