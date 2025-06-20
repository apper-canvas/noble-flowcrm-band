import { motion } from 'framer-motion'
import { useDrag } from 'react-dnd'
import { format } from 'date-fns'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'

const DealCard = ({ deal, contact, onUpdate, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'deal',
    item: { id: deal.Id, currentStage: deal.stage },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getProbabilityColor = (probability) => {
    if (probability >= 75) return 'success'
    if (probability >= 50) return 'warning'
    return 'error'
  }

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
            {deal.title}
          </h3>
          <button
            onClick={() => onDelete(deal.Id)}
            className="p-1 text-gray-400 hover:text-error transition-colors rounded ml-2 flex-shrink-0"
          >
            <ApperIcon name="X" size={14} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(deal.value)}
            </span>
            <Badge variant={getProbabilityColor(deal.probability)} size="sm">
              {deal.probability}%
            </Badge>
          </div>

          {contact && (
            <div className="flex items-center gap-2">
              <ApperIcon name="User" size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600 truncate">
                {contact.name}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <ApperIcon name="Calendar" size={12} className="text-gray-400" />
            <span className="text-xs text-gray-600">
              {format(new Date(deal.expectedCloseDate), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${deal.probability}%` }}
          />
        </div>
      </Card>
    </motion.div>
  )
}

export default DealCard