import dealsData from '../mockData/deals.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let deals = [...dealsData]

const dealService = {
  async getAll() {
    await delay(300)
    return [...deals]
  },

  async getById(id) {
    await delay(200)
    const deal = deals.find(d => d.Id === parseInt(id, 10))
    if (!deal) {
      throw new Error('Deal not found')
    }
    return { ...deal }
  },

  async getByContactId(contactId) {
    await delay(250)
    return deals
      .filter(d => d.contactId === parseInt(contactId, 10))
      .map(deal => ({ ...deal }))
  },

  async create(dealData) {
    await delay(400)
    const maxId = Math.max(...deals.map(d => d.Id), 0)
    const newDeal = {
      ...dealData,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    }
    deals.push(newDeal)
    return { ...newDeal }
  },

  async update(id, dealData) {
    await delay(350)
    const index = deals.findIndex(d => d.Id === parseInt(id, 10))
    if (index === -1) {
      throw new Error('Deal not found')
    }
    
    const updatedDeal = {
      ...deals[index],
      ...dealData,
      Id: deals[index].Id // Ensure ID doesn't change
    }
    
    deals[index] = updatedDeal
    return { ...updatedDeal }
  },

  async delete(id) {
    await delay(300)
    const index = deals.findIndex(d => d.Id === parseInt(id, 10))
    if (index === -1) {
      throw new Error('Deal not found')
    }
    
    const deletedDeal = deals[index]
    deals.splice(index, 1)
    return { ...deletedDeal }
  },

  async updateStage(id, newStage) {
    await delay(250)
    return this.update(id, { stage: newStage })
  },

  async search(query) {
    await delay(200)
    const searchTerm = query.toLowerCase()
    return deals.filter(deal => 
      deal.title.toLowerCase().includes(searchTerm)
    ).map(deal => ({ ...deal }))
  }
}

export default dealService