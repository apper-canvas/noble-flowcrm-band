import { format, formatDistanceToNow } from 'date-fns'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'

const ActivityCard = ({ activity, contact, deal }) => {
  const getActivityIcon = (type) => {
    const icons = {
      'Call': 'Phone',
      'Email': 'Mail',
      'Meeting': 'Users',
      'Note': 'FileText',
      'Task': 'CheckSquare'
    }
    return icons[type] || 'Activity'
  }

  const getActivityColor = (type) => {
    const colors = {
      'Call': 'primary',
      'Email': 'secondary',
      'Meeting': 'success',
      'Note': 'warning',
      'Task': 'info'
    }
    return colors[type] || 'default'
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full bg-${getActivityColor(activity.type)}/10`}>
          <ApperIcon 
            name={getActivityIcon(activity.type)} 
            size={16} 
            className={`text-${getActivityColor(activity.type)}`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={getActivityColor(activity.type)} size="sm">
              {activity.type}
            </Badge>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-sm text-gray-800 mb-2 break-words">
            {activity.content}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {contact && (
              <div className="flex items-center gap-1">
                <ApperIcon name="User" size={12} />
                <span>{contact.name}</span>
              </div>
            )}
            {deal && (
              <div className="flex items-center gap-1">
                <ApperIcon name="TrendingUp" size={12} />
                <span>{deal.title}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <ApperIcon name="Clock" size={12} />
              <span>{format(new Date(activity.timestamp), 'MMM dd, HH:mm')}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ActivityCard