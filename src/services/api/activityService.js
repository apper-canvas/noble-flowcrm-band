import activitiesData from '../mockData/activities.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let activities = [...activitiesData]

const activityService = {
  async getAll() {
    await delay(300)
    return [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  },

  async getById(id) {
    await delay(200)
    const activity = activities.find(a => a.Id === parseInt(id, 10))
    if (!activity) {
      throw new Error('Activity not found')
    }
    return { ...activity }
  },

  async getByContactId(contactId) {
    await delay(250)
    return activities
      .filter(a => a.contactId === parseInt(contactId, 10))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(activity => ({ ...activity }))
  },

  async getByDealId(dealId) {
    await delay(250)
    return activities
      .filter(a => a.dealId === parseInt(dealId, 10))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(activity => ({ ...activity }))
  },

  async create(activityData) {
    await delay(400)
    const maxId = Math.max(...activities.map(a => a.Id), 0)
    const newActivity = {
      ...activityData,
      Id: maxId + 1,
      timestamp: new Date().toISOString()
    }
    activities.push(newActivity)
    return { ...newActivity }
  },

  async update(id, activityData) {
    await delay(350)
    const index = activities.findIndex(a => a.Id === parseInt(id, 10))
    if (index === -1) {
      throw new Error('Activity not found')
    }
    
    const updatedActivity = {
      ...activities[index],
      ...activityData,
      Id: activities[index].Id // Ensure ID doesn't change
    }
    
    activities[index] = updatedActivity
    return { ...updatedActivity }
  },

  async delete(id) {
    await delay(300)
    const index = activities.findIndex(a => a.Id === parseInt(id, 10))
    if (index === -1) {
      throw new Error('Activity not found')
    }
    
    const deletedActivity = activities[index]
    activities.splice(index, 1)
    return { ...deletedActivity }
  },

  async search(query) {
    await delay(200)
    const searchTerm = query.toLowerCase()
    return activities.filter(activity => 
      activity.content.toLowerCase().includes(searchTerm) ||
      activity.type.toLowerCase().includes(searchTerm)
    ).map(activity => ({ ...activity }))
  }
}

export default activityService