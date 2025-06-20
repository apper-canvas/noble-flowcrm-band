import { motion } from 'framer-motion'

const Avatar = ({ 
  name, 
  src, 
  size = 'md',
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        flex items-center justify-center rounded-full font-medium
        bg-gradient-to-br from-primary to-secondary text-white
        ${sizes[size]} ${className}
      `}
      {...props}
    >
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </motion.div>
  )
}

export default Avatar