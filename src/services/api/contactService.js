import contactsData from '../mockData/contacts.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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
  }
}

export default contactService