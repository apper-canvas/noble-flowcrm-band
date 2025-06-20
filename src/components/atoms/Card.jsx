import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } : {}}
      className={`
        bg-surface rounded-lg border border-gray-200 shadow-card
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card