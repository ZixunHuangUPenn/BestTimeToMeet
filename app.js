// app.js
App({
  onLaunch() {
    if (!wx.getStorageSync('hairWashRecords')) {
      wx.setStorageSync('hairWashRecords', [])
    }
  },

  getRecords() {
    return wx.getStorageSync('hairWashRecords') || []
  },

  addRecord(date, note = '') {
    const records = this.getRecords()
    if (records.find(r => r.date === date)) {
      return { success: false, message: '该日期已有记录' }
    }
    records.push({
      id: Date.now().toString(),
      date,
      note,
      timestamp: Date.now()
    })
    records.sort((a, b) => b.date.localeCompare(a.date))
    wx.setStorageSync('hairWashRecords', records)
    return { success: true }
  },

  deleteRecord(id) {
    const records = this.getRecords().filter(r => r.id !== id)
    wx.setStorageSync('hairWashRecords', records)
  },

  updateNote(id, note) {
    const records = this.getRecords()
    const record = records.find(r => r.id === id)
    if (record) {
      record.note = note
      wx.setStorageSync('hairWashRecords', records)
    }
  },

  getStats() {
    const records = this.getRecords()
    if (records.length === 0) {
      return { total: 0, lastWash: null, daysSinceLast: null, avgInterval: null }
    }

    const lastWash = records[0].date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastDate = new Date(lastWash)
    const daysSinceLast = Math.round((today - lastDate) / (1000 * 60 * 60 * 24))

    let avgInterval = null
    if (records.length >= 2) {
      let totalDiff = 0
      for (let i = 0; i < records.length - 1; i++) {
        const a = new Date(records[i].date)
        const b = new Date(records[i + 1].date)
        totalDiff += Math.round((a - b) / (1000 * 60 * 60 * 24))
      }
      avgInterval = (totalDiff / (records.length - 1)).toFixed(1)
    }

    return { total: records.length, lastWash, daysSinceLast, avgInterval }
  }
})
