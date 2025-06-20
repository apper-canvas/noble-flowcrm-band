import contactsData from "@/services/mockData/contacts.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// String similarity function using Levenshtein distance
const stringSimilarity = {
  compareTwoStrings(str1, str2) {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return (maxLength - distance) / maxLength;
  }
};

let contacts = [...contactsData]
const contactService = {
  async getAll() {
    await delay(300)
    return [...contacts]
  },

  async getById(id) {
    await delay(200)
    const contact = contacts.find(c => c.Id === parseInt(id, 10))
    if (!contact) {
      throw new Error('Contact not found')
    }
    return { ...contact }
  },

  async create(contactData) {
    await delay(400)
    const maxId = Math.max(...contacts.map(c => c.Id), 0)
    const newContact = {
      ...contactData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      customFields: contactData.customFields || {}
    }
    contacts.push(newContact)
    return { ...newContact }
  },

  async update(id, contactData) {
    await delay(350)
    const index = contacts.findIndex(c => c.Id === parseInt(id, 10))
    if (index === -1) {
      throw new Error('Contact not found')
    }
    
    const updatedContact = {
      ...contacts[index],
      ...contactData,
      Id: contacts[index].Id // Ensure ID doesn't change
    }
    
    contacts[index] = updatedContact
    return { ...updatedContact }
  },

  async delete(id) {
    await delay(300)
    const index = contacts.findIndex(c => c.Id === parseInt(id, 10))
    if (index === -1) {
      throw new Error('Contact not found')
    }
    
    const deletedContact = contacts[index]
    contacts.splice(index, 1)
    return { ...deletedContact }
  },

  async search(query) {
    await delay(200)
    const searchTerm = query.toLowerCase()
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm) ||
      contact.company.toLowerCase().includes(searchTerm) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchTerm))
).map(contact => ({ ...contact }))
  },

  async findDuplicates(contactId = null) {
    await delay(400)
    const duplicates = []
    const processContacts = contactId 
      ? contacts.filter(c => c.Id === parseInt(contactId, 10))
      : [...contacts]

    for (let i = 0; i < processContacts.length; i++) {
      const contact = processContacts[i]
      const potentialDuplicates = []

      for (let j = 0; j < contacts.length; j++) {
        const otherContact = contacts[j]
        if (contact.Id === otherContact.Id) continue

        let score = 0
        const reasons = []

        // Exact email match (highest priority)
        if (contact.email.toLowerCase() === otherContact.email.toLowerCase()) {
          score += 0.9
          reasons.push('Same email address')
        }

        // Name similarity
        const nameSimilarity = stringSimilarity.compareTwoStrings(
          contact.name.toLowerCase(),
          otherContact.name.toLowerCase()
        )
        if (nameSimilarity > 0.8) {
          score += nameSimilarity * 0.6
          reasons.push(`Similar name (${Math.round(nameSimilarity * 100)}% match)`)
        }

        // Company similarity
        if (contact.company && otherContact.company) {
          const companySimilarity = stringSimilarity.compareTwoStrings(
            contact.company.toLowerCase(),
            otherContact.company.toLowerCase()
          )
          if (companySimilarity > 0.8) {
            score += companySimilarity * 0.4
            reasons.push(`Similar company (${Math.round(companySimilarity * 100)}% match)`)
          }
        }

        // Phone similarity (basic check for same digits)
        if (contact.phone && otherContact.phone) {
          const phone1 = contact.phone.replace(/\D/g, '')
          const phone2 = otherContact.phone.replace(/\D/g, '')
          if (phone1.length >= 10 && phone2.length >= 10) {
            const phoneSimilarity = phone1.slice(-10) === phone2.slice(-10)
            if (phoneSimilarity) {
              score += 0.5
              reasons.push('Same phone number')
            }
          }
        }

        if (score > 0.7) {
          potentialDuplicates.push({
            contact: { ...otherContact },
            score: Math.round(score * 100),
            reasons
          })
        }
      }

      if (potentialDuplicates.length > 0) {
        duplicates.push({
          original: { ...contact },
          duplicates: potentialDuplicates.sort((a, b) => b.score - a.score)
        })
      }
    }

    return duplicates
  },

  async mergeContacts(primaryContactId, duplicateContactIds, fieldChoices) {
    await delay(500)
    const primaryContact = contacts.find(c => c.Id === parseInt(primaryContactId, 10))
    if (!primaryContact) {
      throw new Error('Primary contact not found')
    }

    const duplicateContacts = duplicateContactIds.map(id => {
      const contact = contacts.find(c => c.Id === parseInt(id, 10))
      if (!contact) {
        throw new Error(`Duplicate contact with ID ${id} not found`)
      }
      return contact
    })

    // Create merged contact based on field choices
    const mergedContact = { ...primaryContact }
    
    // Apply field choices
    Object.keys(fieldChoices).forEach(field => {
      const chosenContactId = fieldChoices[field]
      if (chosenContactId === primaryContact.Id) {
        // Keep primary contact's value
        return
      }
      
      const sourceContact = duplicateContacts.find(c => c.Id === chosenContactId)
      if (sourceContact && sourceContact[field]) {
        mergedContact[field] = sourceContact[field]
      }
    })

    // Merge tags (combine unique tags)
    const allTags = new Set([
      ...(primaryContact.tags || []),
      ...duplicateContacts.flatMap(c => c.tags || [])
    ])
    mergedContact.tags = Array.from(allTags)

    // Merge custom fields (combine all fields, with field choices taking precedence)
    const allCustomFields = { ...(primaryContact.customFields || {}) }
    duplicateContacts.forEach(contact => {
      if (contact.customFields) {
        Object.keys(contact.customFields).forEach(key => {
          if (!allCustomFields[key] || fieldChoices[`customFields.${key}`] === contact.Id) {
            allCustomFields[key] = contact.customFields[key]
          }
        })
      }
    })
    mergedContact.customFields = allCustomFields

    // Update the primary contact
    const primaryIndex = contacts.findIndex(c => c.Id === primaryContact.Id)
    contacts[primaryIndex] = mergedContact

    // Remove duplicate contacts
    duplicateContactIds.forEach(id => {
      const index = contacts.findIndex(c => c.Id === parseInt(id, 10))
      if (index !== -1) {
        contacts.splice(index, 1)
      }
    })

    return { ...mergedContact }
  }
}

export default contactService