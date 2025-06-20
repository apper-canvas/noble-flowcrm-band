import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'

const SearchResult = ({ result, type, onSelect }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (type === 'contact') {
      navigate(`/contacts/${result.Id}`)
    } else if (type === 'deal') {
      navigate('/deals')
    } else if (type === 'activity') {
      navigate('/activities')
    }
    onSelect()
  }

  const getIcon = () => {
    switch (type) {
      case 'contact': return 'User'
      case 'deal': return 'TrendingUp'
      case 'activity': return 'Activity'
      default: return 'Search'
    }
  }

  const getTypeColor = () => {
    switch (type) {
      case 'contact': return 'primary'
      case 'deal': return 'success'
      case 'activity': return 'secondary'
      default: return 'default'
    }
  }

  const renderContent = () => {
    switch (type) {
      case 'contact':
        return (
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{result.name}</p>
            <p className="text-sm text-gray-600 truncate">{result.company}</p>
            <p className="text-xs text-gray-500 truncate">{result.email}</p>
          </div>
        )
      case 'deal':
        return (
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{result.title}</p>
            <p className="text-sm text-gray-600">
              ${result.value?.toLocaleString()} • {result.stage}
            </p>
          </div>
        )
      case 'activity':
        return (
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 line-clamp-2">
              {result.content}
            </p>
            <p className="text-sm text-gray-600">{result.type}</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.button
      whileHover={{ backgroundColor: '#f9fafb' }}
      onClick={handleClick}
      className="w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
    >
      <div className={`p-2 rounded-full bg-${getTypeColor()}/10`}>
        <ApperIcon 
          name={getIcon()} 
          size={16} 
          className={`text-${getTypeColor()}`}
        />
      </div>
      
      {renderContent()}
      
      <Badge variant={getTypeColor()} size="sm">
        {type}
      </Badge>
    </motion.button>
  )
}

export default SearchResult