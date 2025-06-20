import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Input from '@/components/atoms/Input'
import SearchResult from '@/components/molecules/SearchResult'
import ApperIcon from '@/components/ApperIcon'
import contactService from '@/services/api/contactService'
import dealService from '@/services/api/dealService'
import activityService from '@/services/api/activityService'

const GlobalSearch = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchData = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const [contacts, deals, activities] = await Promise.all([
          contactService.search(query),
          dealService.search(query),
          activityService.search(query)
        ])

        const combinedResults = [
          ...contacts.slice(0, 3).map(item => ({ ...item, type: 'contact' })),
          ...deals.slice(0, 3).map(item => ({ ...item, type: 'deal' })),
          ...activities.slice(0, 3).map(item => ({ ...item, type: 'activity' }))
        ]

        setResults(combinedResults)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchData, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    setIsOpen(true)
  }

  const handleResultSelect = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={searchRef} className="relative">
      <Input
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search contacts, deals, activities..."
        icon="Search"
        className="w-full"
      />

      <AnimatePresence>
        {isOpen && (query.length >= 2 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
          >
            {loading ? (
              <div className="p-4 text-center">
                <ApperIcon name="Loader2" size={20} className="animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <SearchResult
                    key={`${result.type}-${result.Id}`}
                    result={result}
                    type={result.type}
                    onSelect={handleResultSelect}
                  />
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center">
                <ApperIcon name="Search" size={20} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No results found for "{query}"</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GlobalSearch